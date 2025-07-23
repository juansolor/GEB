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
  const response = await api.get('/service-categories/');
  return response.data;
};

export const createServiceCategory = async (data: ServiceCategoryForm): Promise<ServiceCategory> => {
  const response = await api.post('/service-categories/', data);
  return response.data;
};

export const updateServiceCategory = async (id: number, data: ServiceCategoryForm): Promise<ServiceCategory> => {
  const response = await api.put(`/service-categories/${id}/`, data);
  return response.data;
};

export const deleteServiceCategory = async (id: number): Promise<void> => {
  await api.delete(`/service-categories/${id}/`);
};

// Tipos de Recursos
export const getResourceTypes = async (): Promise<ResourceType[]> => {
  const response = await api.get('/resource-types/');
  return response.data;
};

// Recursos
export const getResources = async (params?: { resource_type?: number }): Promise<Resource[]> => {
  const response = await api.get('/resources/', { params });
  return response.data;
};

export const getResource = async (id: number): Promise<Resource> => {
  const response = await api.get(`/resources/${id}/`);
  return response.data;
};

export const createResource = async (data: ResourceForm): Promise<Resource> => {
  const response = await api.post('/resources/', data);
  return response.data;
};

export const updateResource = async (id: number, data: ResourceForm): Promise<Resource> => {
  const response = await api.put(`/resources/${id}/`, data);
  return response.data;
};

export const deleteResource = async (id: number): Promise<void> => {
  await api.delete(`/resources/${id}/`);
};

// Análisis de Precios Unitarios
export const getUnitPriceAnalyses = async (params?: { 
  category?: number; 
  status?: string; 
}): Promise<UnitPriceAnalysis[]> => {
  const response = await api.get('/unit-price-analysis/', { params });
  return response.data;
};

export const getUnitPriceAnalysis = async (id: number): Promise<UnitPriceAnalysis> => {
  const response = await api.get(`/unit-price-analysis/${id}/`);
  return response.data;
};

export const createUnitPriceAnalysis = async (data: UnitPriceAnalysisForm): Promise<UnitPriceAnalysis> => {
  const response = await api.post('/unit-price-analysis/', data);
  return response.data;
};

export const updateUnitPriceAnalysis = async (id: number, data: UnitPriceAnalysisForm): Promise<UnitPriceAnalysis> => {
  const response = await api.put(`/unit-price-analysis/${id}/`, data);
  return response.data;
};

export const deleteUnitPriceAnalysis = async (id: number): Promise<void> => {
  await api.delete(`/unit-price-analysis/${id}/`);
};

export const duplicateUnitPriceAnalysis = async (id: number, newCode: string): Promise<UnitPriceAnalysis> => {
  const response = await api.post(`/unit-price-analysis/${id}/duplicate/`, { new_code: newCode });
  return response.data;
};

export const getCostBreakdown = async (id: number): Promise<CostBreakdown> => {
  const response = await api.get(`/unit-price-analysis/${id}/cost_breakdown/`);
  return response.data;
};

export const changeAnalysisStatus = async (id: number, status: string): Promise<UnitPriceAnalysis> => {
  const response = await api.post(`/unit-price-analysis/${id}/change_status/`, { status });
  return response.data;
};

// Items de Análisis
export const getUnitPriceItems = async (params?: { analysis?: number }): Promise<UnitPriceItem[]> => {
  const response = await api.get('/unit-price-items/', { params });
  return response.data;
};

export const getUnitPriceItem = async (id: number): Promise<UnitPriceItem> => {
  const response = await api.get(`/unit-price-items/${id}/`);
  return response.data;
};

export const createUnitPriceItem = async (analysisId: number, data: UnitPriceItemForm): Promise<UnitPriceItem> => {
  const response = await api.post(`/unit-price-analysis/${analysisId}/add_item/`, data);
  return response.data;
};

export const updateUnitPriceItem = async (id: number, data: UnitPriceItemForm): Promise<UnitPriceItem> => {
  const response = await api.put(`/unit-price-items/${id}/`, data);
  return response.data;
};

export const deleteUnitPriceItem = async (id: number): Promise<void> => {
  await api.delete(`/unit-price-items/${id}/`);
};

// Estimaciones de Proyecto
export const getProjectEstimates = async (params?: { 
  customer?: number; 
  status?: string; 
}): Promise<ProjectEstimate[]> => {
  const response = await api.get('/project-estimates/', { params });
  return response.data;
};

export const getProjectEstimate = async (id: number): Promise<ProjectEstimate> => {
  const response = await api.get(`/project-estimates/${id}/`);
  return response.data;
};

export const createProjectEstimate = async (data: ProjectEstimateForm): Promise<ProjectEstimate> => {
  const response = await api.post('/project-estimates/', data);
  return response.data;
};

export const updateProjectEstimate = async (id: number, data: ProjectEstimateForm): Promise<ProjectEstimate> => {
  const response = await api.put(`/project-estimates/${id}/`, data);
  return response.data;
};

export const deleteProjectEstimate = async (id: number): Promise<void> => {
  await api.delete(`/project-estimates/${id}/`);
};

// Items de Estimación
export const getProjectEstimateItems = async (params?: { estimate?: number }): Promise<ProjectEstimateItem[]> => {
  const response = await api.get('/project-estimate-items/', { params });
  return response.data;
};

export const createProjectEstimateItem = async (estimateId: number, data: ProjectEstimateItemForm): Promise<ProjectEstimateItem> => {
  const response = await api.post(`/project-estimates/${estimateId}/add_item/`, data);
  return response.data;
};

export const updateProjectEstimateItem = async (id: number, data: ProjectEstimateItemForm): Promise<ProjectEstimateItem> => {
  const response = await api.put(`/project-estimate-items/${id}/`, data);
  return response.data;
};

export const deleteProjectEstimateItem = async (id: number): Promise<void> => {
  await api.delete(`/project-estimate-items/${id}/`);
};
