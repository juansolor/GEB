from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.query import QuerySet
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transaction, ExpenseCategory, Budget
from .serializers import (
    TransactionSerializer, TransactionCreateUpdateSerializer, TransactionListSerializer,
    ExpenseCategorySerializer, BudgetSerializer, BudgetCreateUpdateSerializer
)


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self) -> QuerySet[ExpenseCategory]:  # type: ignore
        return ExpenseCategory.objects.all().order_by('name')


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):  # type: ignore
        if self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateUpdateSerializer
        elif self.action == 'list':
            return TransactionListSerializer
        return TransactionSerializer
    
    def get_queryset(self) -> QuerySet[Transaction]:  # type: ignore
        queryset = Transaction.objects.all().order_by('-transaction_date', '-created_at')
        
        # Filter by transaction type
        transaction_type = self.request.query_params.get('type', None)  # type: ignore
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        # Filter by date range  
        start_date = self.request.query_params.get('start_date', None)  # type: ignore
        end_date = self.request.query_params.get('end_date', None)  # type: ignore
        
        if start_date:
            queryset = queryset.filter(transaction_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(transaction_date__lte=end_date)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get financial statistics"""
        today = timezone.now().date()
        current_month_start = today.replace(day=1)
        last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
        
        # Current month totals
        current_month_income = Transaction.objects.filter(
            transaction_type='income',
            transaction_date__gte=current_month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        current_month_expenses = Transaction.objects.filter(
            transaction_type='expense',
            transaction_date__gte=current_month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Previous month totals
        previous_month_income = Transaction.objects.filter(
            transaction_type='income',
            transaction_date__gte=last_month_start,
            transaction_date__lt=current_month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        previous_month_expenses = Transaction.objects.filter(
            transaction_type='expense',
            transaction_date__gte=last_month_start,
            transaction_date__lt=current_month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Total counts
        total_transactions = Transaction.objects.count()
        total_income = Transaction.objects.filter(transaction_type='income').aggregate(total=Sum('amount'))['total'] or 0
        total_expenses = Transaction.objects.filter(transaction_type='expense').aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'current_month': {
                'income': float(current_month_income),
                'expenses': float(current_month_expenses),
                'balance': float(current_month_income - current_month_expenses)
            },
            'previous_month': {
                'income': float(previous_month_income),
                'expenses': float(previous_month_expenses),
                'balance': float(previous_month_income - previous_month_expenses)
            },
            'totals': {
                'transactions': total_transactions,
                'income': float(total_income),
                'expenses': float(total_expenses),
                'balance': float(total_income - total_expenses)
            }
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent transactions"""
        limit = int(request.query_params.get('limit', 10))  # type: ignore
        recent_transactions = Transaction.objects.all().order_by('-created_at')[:limit]
        serializer = TransactionListSerializer(recent_transactions, many=True)
        return Response(serializer.data)


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):  # type: ignore
        if self.action in ['create', 'update', 'partial_update']:
            return BudgetCreateUpdateSerializer
        return BudgetSerializer
    
    def get_queryset(self) -> QuerySet[Budget]:  # type: ignore
        queryset = Budget.objects.all().order_by('-year', '-month')
        
        # Filter by year and month
        year = self.request.query_params.get('year', None)  # type: ignore
        month = self.request.query_params.get('month', None)  # type: ignore
        
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
