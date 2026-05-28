import { api } from '../Users/user';
import { getAuthHeaders } from "../utils/token";
import {
  Patient,
  Modality,
  Equipment,
  Service,
  Order,
  Branch,
  Organization,
  Template,
  InventoryItem,
  Company,
  MedicalUser,
  CashRegister
} from './types';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
};

export const fetchMedicalUsers = async (): Promise<MedicalUser[]> => {
  const url = `${api}/api/usuarios/medicos`;
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener médicos');
  }
  return response.json();
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  const url = `${api}/api/ris/orders`;
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener órdenes');
  }
  return response.json();
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  const url = `${api}/api/ris/orders/${orderId}/status`;
  const response = await fetchWithAuth(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar estado');
  }
  return response.json();
};

// --- Gestión de Pacientes ---
export const fetchPatients = async (): Promise<Patient[]> => {
  const url = `${api}/api/ris/patients`;
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener pacientes');
  }
  return response.json();
};

export const createPatient = async (patientData: Omit<Patient, '_id'>): Promise<Patient> => {
  const url = `${api}/api/ris/patients`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear paciente');
  }
  return response.json();
};

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> => {
  const response = await fetchWithAuth(`${api}/api/ris/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar paciente');
  }
  return response.json();
};

export const deletePatient = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/ris/patients/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar paciente');
  }
  return response.json();
};

// --- Agendamiento Manual ---
export const createOrder = async (orderData: Omit<Order, '_id'>): Promise<Order> => {
  const url = `${api}/api/ris/orders`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear la orden');
  }
  return response.json();
};

export const updateOrder = async (id: string, data: Partial<Order>): Promise<Order> => {
  const response = await fetchWithAuth(`${api}/api/ris/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar orden');
  }
  return response.json();
};

export const deleteOrder = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/ris/orders/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar orden');
  }
  return response.json();
};

// --- Gestión de Modalidades ---
export const fetchModalities = async (): Promise<Modality[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/modalities`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener modalidades');
  }
  return response.json();
};

export const createModality = async (data: Omit<Modality, '_id'>): Promise<Modality> => {
  const response = await fetchWithAuth(`${api}/api/ris/modalities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear modalidad');
  }
  return response.json();
};

export const updateModality = async (id: string, data: Partial<Modality>): Promise<Modality> => {
  const response = await fetchWithAuth(`${api}/api/ris/modalities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar modalidad');
  }
  return response.json();
};

export const deleteModality = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/ris/modalities/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar modalidad');
  }
  return response.json();
};

// --- Gestión de Equipos ---
export const fetchEquipment = async (): Promise<Equipment[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/equipment`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener equipos');
  }
  return response.json();
};

export const createEquipment = async (data: Omit<Equipment, '_id'>): Promise<Equipment> => {
  const response = await fetchWithAuth(`${api}/api/ris/equipment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear equipo');
  }
  return response.json();
};

export const updateEquipment = async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
  const response = await fetchWithAuth(`${api}/api/ris/equipment/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar equipo');
  }
  return response.json();
};

export const deleteEquipment = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/ris/equipment/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar equipo');
  }
  return response.json();
};

// --- Gestión de Servicios (Procedimientos) ---
export const fetchServices = async (): Promise<Service[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/services`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener servicios');
  }
  return response.json();
};

export const createService = async (data: Omit<Service, '_id'>): Promise<Service> => {
  const response = await fetchWithAuth(`${api}/api/ris/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear servicio');
  }
  return response.json();
};

export const updateService = async (id: string, data: Partial<Service>): Promise<Service> => {
  const response = await fetchWithAuth(`${api}/api/ris/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar servicio');
  }
  return response.json();
};

export const deleteService = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/ris/services/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar servicio');
  }
  return response.json();
};

// --- Gestión de Sucursales ---
export const fetchBranches = async (): Promise<Branch[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/branches`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener sucursales');
  }
  return response.json();
};

export const createBranch = async (data: Omit<Branch, '_id'>): Promise<Branch> => {
  const response = await fetchWithAuth(`${api}/api/ris/branches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear sucursal');
  }
  return response.json();
};

export const updateBranch = async (id: string, data: Partial<Branch>): Promise<Branch> => {
  const response = await fetchWithAuth(`${api}/api/ris/branches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar sucursal');
  }
  return response.json();
};

export const deleteBranch = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/ris/branches/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar sucursal');
  }
  return response.json();
};

// --- Gestión de Informes (Reporting Hub) ---
export const fetchAllReports = async (): Promise<any[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/reports`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener informes');
  }
  return response.json();
};

// --- Analíticas ---
export const fetchAnalytics = async (): Promise<any> => {
  const response = await fetchWithAuth(`${api}/api/ris/analytics/stats`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener estadísticas');
  }
  return response.json();
};

export const createOrganization = async (data: Omit<Organization, '_id'>): Promise<Organization> => {
  const response = await fetchWithAuth(`${api}/api/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear organización');
  }
  return response.json();
};

export const updateOrganization = async (id: string, data: Partial<Organization>): Promise<Organization> => {
  const response = await fetchWithAuth(`${api}/api/organizations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar organización');
  }
  return response.json();
};

export const deleteOrganization = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/organizations/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar organización');
  }
  return response.json();
};

// --- Templates ---
export const fetchTemplates = async (): Promise<Template[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/templates`);
  if (!response.ok) throw new Error('Error al obtener plantillas');
  return response.json();
};

export const createTemplate = async (data: Omit<Template, '_id'>): Promise<Template> => {
  const response = await fetchWithAuth(`${api}/api/ris/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear plantilla');
  return response.json();
};

export const updateTemplate = async (id: string, data: Partial<Template>): Promise<Template> => {
  const response = await fetchWithAuth(`${api}/api/ris/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar plantilla');
  return response.json();
};

export const deleteTemplate = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/ris/templates/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Error al eliminar plantilla');
  return response.json();
};

// --- Inventory ---
export const fetchInventory = async (): Promise<InventoryItem[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/inventory`);
  if (!response.ok) throw new Error('Error al obtener inventario');
  return response.json();
};

export const createInventoryItem = async (data: Omit<InventoryItem, '_id'>): Promise<InventoryItem> => {
  const response = await fetchWithAuth(`${api}/api/ris/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear ítem');
  return response.json();
};

export const updateInventoryItem = async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await fetchWithAuth(`${api}/api/ris/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar ítem');
  return response.json();
};

export const deleteInventoryItem = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/ris/inventory/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Error al eliminar ítem');
  return response.json();
};

// --- Cash Register ---
export const fetchCashRegisters = async (): Promise<CashRegister[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/cash-register`);
  if (!response.ok) throw new Error('Error al obtener cajas');
  return response.json();
};

export const openCashRegister = async (data: Omit<CashRegister, '_id'>): Promise<CashRegister> => {
  const response = await fetchWithAuth(`${api}/api/ris/cash-register/open`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al abrir caja');
  return response.json();
};

export const closeCashRegister = async (id: string, data: Partial<CashRegister>): Promise<CashRegister> => {
  const response = await fetchWithAuth(`${api}/api/ris/cash-register/${id}/close`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al cerrar caja');
  return response.json();
};

// --- Equipment Maintenance ---
export const addMaintenanceRecord = async (equipmentId: string, data: any): Promise<any> => {
  const response = await fetchWithAuth(`${api}/api/ris/equipment/${equipmentId}/maintenance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al registrar mantenimiento');
  return response.json();
};

// --- Totem / Kiosk ---
export const totemArrival = async (orderId: string, data: { consentSignature?: string }): Promise<any> => {
  const response = await fetchWithAuth(`${api}/api/ris/orders/${orderId}/totem-arrival`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al registrar llegada');
  return response.json();
};

// --- Teaching Files ---
export const toggleTeachingFile = async (reportId: string, data: any): Promise<any> => {
  const response = await fetchWithAuth(`${api}/api/ris/reports/${reportId}/teaching`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar docencia');
  return response.json();
};

export const fetchTeachingFiles = async (): Promise<any[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/teaching-files`);
  if (!response.ok) throw new Error('Error al obtener archivos de docencia');
  return response.json();
};

// --- Teleradiology: Radiologist Workload ---
export const fetchRadiologistWorkload = async (): Promise<any[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/teleradiology/workload`);
  if (!response.ok) throw new Error('Error al obtener carga de trabajo');
  return response.json();
};

// --- Gestión de Empresas / Empleadores ---
export const fetchCompanies = async (): Promise<Company[]> => {
  const response = await fetchWithAuth(`${api}/api/ris/companies`);
  if (!response.ok) throw new Error('Error al obtener empresas');
  return response.json();
};

export const createCompany = async (data: Omit<Company, '_id'>): Promise<Company> => {
  const response = await fetchWithAuth(`${api}/api/ris/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al crear empresa');
  }
  return response.json();
};

export const updateCompany = async (id: string, data: Partial<Company>): Promise<Company> => {
  const response = await fetchWithAuth(`${api}/api/ris/companies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar empresa');
  }
  return response.json();
};

export const deleteCompany = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetchWithAuth(`${api}/api/ris/companies/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al eliminar empresa');
  }
  return response.json();
};
