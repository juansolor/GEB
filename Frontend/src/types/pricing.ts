// Tipos para el sistema de análisis de precios unitarios

export interface ServiceCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceType {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Resource {
  id: number;
  name: string;
  code: string;
  resource_type: number;
  resource_type_name?: string;
  unit: string;
  unit_cost: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnitPriceAnalysis {
  id: number;
  name: string;
  code: string;
  category: number;
  category_name?: string;
  description?: string;
  unit: string;
  overhead_percentage: string;
  profit_margin: string;
  efficiency_factor: string;
  difficulty_factor: string;
  total_direct_cost: string;
  total_cost_with_overhead: string;
  final_unit_price: string;
  status: 'draft' | 'approved' | 'archived';
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: UnitPriceItem[];
}

export interface UnitPriceItem {
  id: number;
  analysis: number;
  resource: number;
  resource_name?: string;
  resource_unit?: string;
  quantity: string;
  unit_cost: string;
  total_cost: string;
  performance_factor: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectEstimate {
  id: number;
  name: string;
  project_code: string;
  customer?: number;
  customer_name?: string;
  description?: string;
  total_estimated_cost: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: ProjectEstimateItem[];
}

export interface ProjectEstimateItem {
  id: number;
  estimate: number;
  unit_price_analysis: number;
  analysis_name?: string;
  quantity: string;
  unit_price: string;
  total_cost: string;
  notes?: string;
}

export interface CostBreakdown {
  materials_cost: string;
  labor_cost: string;
  equipment_cost: string;
  subcontract_cost: string;
  other_cost: string;
  total_direct_cost: string;
  overhead_amount: string;
  total_with_overhead: string;
  profit_amount: string;
  final_price: string;
}

// Formularios
export interface ServiceCategoryForm {
  name: string;
  code: string;
  description?: string;
}

export interface ResourceForm {
  name: string;
  code: string;
  resource_type: number;
  unit: string;
  unit_cost: string;
  description?: string;
  is_active?: boolean;
}

export interface UnitPriceAnalysisForm {
  name: string;
  code: string;
  category: number;
  description?: string;
  unit: string;
  overhead_percentage?: string;
  profit_margin?: string;
  efficiency_factor?: string;
  difficulty_factor?: string;
}

export interface UnitPriceItemForm {
  resource: number;
  quantity: string;
  performance_factor?: string;
  notes?: string;
}

export interface ProjectEstimateForm {
  name: string;
  project_code: string;
  customer?: number;
  description?: string;
}

export interface ProjectEstimateItemForm {
  unit_price_analysis: number;
  quantity: string;
  notes?: string;
}
