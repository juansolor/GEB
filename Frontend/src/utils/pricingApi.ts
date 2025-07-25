import api from './api';
import {
  ServiceCategory,
  ServiceCategoryForm,
  ResourceType,
  Resource,
  ResourceForm,
  UnitPriceAnalysis,
  UnitPriceAnalysisForm,
  UnitPriceItem,
  UnitPriceItemForm,
  ProjectEstimate,
  ProjectEstimateForm,
  ProjectEstimateItem,
  ProjectEstimateItemForm,
  CostBreakdown
} from '../types/pricing';

// Categorías de Servicio
export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const response = await api.get('/api/service-categories/');
  
  // Verificar si la respuesta tiene paginación
  if (response.data && response.data.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  
  return response.data;
};

export const createServiceCategory = async (data: ServiceCategoryForm): Promise<ServiceCategory> => {
  const response = await api.post('/api/service-categories/', data);
  return response.data;
};

export const updateServiceCategory = async (id: number, data: ServiceCategoryForm): Promise<ServiceCategory> => {
  const response = await api.put(`/api/service-categories/${id}/`, data);
  return response.data;
};

export const deleteServiceCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/service-categories/${id}/`);
};

// Tipos de Recursos
export const getResourceTypes = async (): Promise<ResourceType[]> => {
  const response = await api.get('/api/resource-types/');
  
  // Verificar si la respuesta tiene paginación
  if (response.data && response.data.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  
  return response.data;
};

// Recursos
export const getResources = async (params?: { resource_type?: number }): Promise<Resource[]> => {
  const response = await api.get('/api/resources/', { params });
  
  // Verificar si la respuesta tiene paginación
  if (response.data && response.data.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  
  return response.data;
};

export const getResource = async (id: number): Promise<Resource> => {
  const response = await api.get(`/api/resources/${id}/`);
  return response.data;
};

export const createResource = async (data: ResourceForm): Promise<Resource> => {
  const response = await api.post('/api/resources/', data);
  return response.data;
};

export const updateResource = async (id: number, data: ResourceForm): Promise<Resource> => {
  const response = await api.put(`/api/resources/${id}/`, data);
  return response.data;
};

export const deleteResource = async (id: number): Promise<void> => {
  await api.delete(`/api/resources/${id}/`);
};

// Análisis de Precios Unitarios
export const getUnitPriceAnalyses = async (params?: { 
  category?: number; 
  status?: string; 
}): Promise<UnitPriceAnalysis[]> => {
  const response = await api.get('/api/unit-price-analysis/', { params });
  
  // Verificar si la respuesta tiene paginación
  if (response.data && response.data.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  
  return response.data;
};

export const getUnitPriceAnalysis = async (id: number): Promise<UnitPriceAnalysis> => {
  const response = await api.get(`/api/unit-price-analysis/${id}/`);
  return response.data;
};

export const createUnitPriceAnalysis = async (data: UnitPriceAnalysisForm): Promise<UnitPriceAnalysis> => {
  const response = await api.post('/api/unit-price-analysis/', data);
  return response.data;
};

export const updateUnitPriceAnalysis = async (id: number, data: UnitPriceAnalysisForm): Promise<UnitPriceAnalysis> => {
  const response = await api.put(`/api/unit-price-analysis/${id}/`, data);
  return response.data;
};

export const deleteUnitPriceAnalysis = async (id: number): Promise<void> => {
  await api.delete(`/api/unit-price-analysis/${id}/`);
};

export const duplicateUnitPriceAnalysis = async (id: number, newCode: string): Promise<UnitPriceAnalysis> => {
  const response = await api.post(`/api/unit-price-analysis/${id}/duplicate/`, { new_code: newCode });
  return response.data;
};

export const getCostBreakdown = async (id: number): Promise<CostBreakdown> => {
  const response = await api.get(`/api/unit-price-analysis/${id}/cost_breakdown/`);
  return response.data;
};

export const changeAnalysisStatus = async (id: number, status: string): Promise<UnitPriceAnalysis> => {
  const response = await api.post(`/api/unit-price-analysis/${id}/change_status/`, { status });
  return response.data;
};

// Items de Análisis
export const getUnitPriceItems = async (params?: { analysis?: number }): Promise<UnitPriceItem[]> => {
  const response = await api.get('/api/unit-price-items/', { params });
  // Maneja respuestas paginadas
  if (response.data && typeof response.data === 'object' && 'results' in response.data) {
    return response.data.results;
  }
  return response.data;
};

export const getUnitPriceItem = async (id: number): Promise<UnitPriceItem> => {
  const response = await api.get(`/api/unit-price-items/${id}/`);
  return response.data;
};

export const createUnitPriceItem = async (analysisId: number, data: UnitPriceItemForm): Promise<UnitPriceItem> => {
  console.log('=== API CREATE ITEM DEBUG ===');
  console.log('Analysis ID:', analysisId);
  console.log('Data being sent:', data);
  
  const response = await api.post(`/api/unit-price-analysis/${analysisId}/add_item/`, data);
  
  console.log('Response received:', response.data);
  console.log('=============================');
  
  return response.data;
};

export const updateUnitPriceItem = async (id: number, data: UnitPriceItemForm): Promise<UnitPriceItem> => {
  console.log('=== API UPDATE ITEM DEBUG ===');
  console.log('Item ID:', id);
  console.log('Data being sent:', data);
  
  const response = await api.put(`/api/unit-price-items/${id}/`, data);
  
  console.log('Response received:', response.data);
  console.log('=============================');
  
  return response.data;
};

export const deleteUnitPriceItem = async (id: number): Promise<void> => {
  await api.delete(`/api/unit-price-items/${id}/`);
};

// Estimaciones de Proyecto
export const getProjectEstimates = async (params?: { 
  customer?: number; 
  status?: string; 
}): Promise<ProjectEstimate[]> => {
  const response = await api.get('/api/project-estimates/', { params });
  return response.data;
};

export const getProjectEstimate = async (id: number): Promise<ProjectEstimate> => {
  const response = await api.get(`/api/project-estimates/${id}/`);
  return response.data;
};

export const createProjectEstimate = async (data: ProjectEstimateForm): Promise<ProjectEstimate> => {
  const response = await api.post('/api/project-estimates/', data);
  return response.data;
};

export const updateProjectEstimate = async (id: number, data: ProjectEstimateForm): Promise<ProjectEstimate> => {
  const response = await api.put(`/api/project-estimates/${id}/`, data);
  return response.data;
};

export const deleteProjectEstimate = async (id: number): Promise<void> => {
  await api.delete(`/api/project-estimates/${id}/`);
};

// Items de Estimación
export const getProjectEstimateItems = async (params?: { estimate?: number }): Promise<ProjectEstimateItem[]> => {
  const response = await api.get('/api/project-estimate-items/', { params });
  return response.data;
};

export const createProjectEstimateItem = async (estimateId: number, data: ProjectEstimateItemForm): Promise<ProjectEstimateItem> => {
  const response = await api.post(`/api/project-estimates/${estimateId}/add_item/`, data);
  return response.data;
};

export const updateProjectEstimateItem = async (id: number, data: ProjectEstimateItemForm): Promise<ProjectEstimateItem> => {
  const response = await api.put(`/api/project-estimate-items/${id}/`, data);
  return response.data;
};

export const deleteProjectEstimateItem = async (id: number): Promise<void> => {
  await api.delete(`/api/project-estimate-items/${id}/`);
};
