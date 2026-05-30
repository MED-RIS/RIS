'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Header, Onboarding, toast, useModal } from '@ohif/ui-next';
import { SidebarNavigation } from '@ohif/ui';
import { DicomMetadataStore } from '@ohif/core';
import { useAppConfig } from '@state';
import PropTypes from 'prop-types';

import {
  Users,
  Calendar,
  Stethoscope,
  FileText,
  Activity,
  Server,
  Network,
  Building2,
  Building,
  Box,
  DollarSign,
  BarChart,
  FileBadge,
  Menu,
  ChevronLeft,
  Wrench,
  Smartphone,
  Radio,
  GraduationCap,
  Briefcase,
  Form
} from 'lucide-react';

import {
  fetchAllOrders,
  updateOrderStatus,
  fetchPatients,
  createPatient,
  createOrder,
  updateOrder,
  deleteOrder,
  fetchModalities,
  createModality,
  updateModality,
  deleteModality,
  fetchEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  fetchServices,
  createService,
  updateService,
  deleteService,
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  fetchAllReports,
  fetchAnalytics,
  updatePatient,
  deletePatient,
  fetchMedicalUsers,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  fetchCashRegisters,
  openCashRegister,
  closeCashRegister,
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany
} from './risService';
import { fetchAllOrganizations } from '../Organizations/organization';
import { fetchSettings } from '../Settings/settings';
import { getHeaderConfig } from '../Users/Users';
import { api } from '../Users/user';

import OrdersTab from './components/OrdersTab';
import PatientsTab from './components/PatientsTab';
import AppointmentsTab from './components/AppointmentsTab';
import ReportsTab from './components/ReportsTab';
import ModalitiesTab from './components/ModalitiesTab';
import EquipmentTab from './components/EquipmentTab';
import ServicesTab from './components/ServicesTab';
import BranchesTab from './components/BranchesTab';
import OrganizationsTab from './components/OrganizationsTab';
import MetricsTab from './components/MetricsTab';
import ConsultaTab from './components/ConsultaTab';
import FormularioTab from './components/FormularioTab';

// New Tabs
import TemplatesTab from './components/TemplatesTab';
import InventoryTab from './components/InventoryTab';
import CashRegisterTab from './components/CashRegisterTab';
import PatientProfileModal from './components/PatientProfileModal';

// Advanced Modules
import MaintenanceTab from './components/MaintenanceTab';
import TotemTab from './components/TotemTab';
import TeleradiologyTab from './components/TeleradiologyTab';
import TeachingFileTab from './components/TeachingFileTab';
import TelemedModal from './components/TelemedModal';
import CompaniesTab from './components/CompaniesTab';

// ── Module-level constants (defined once, never recreated) ──────────────────

const MENU_GROUPS = [
  {
    title: 'Atención Clínica',
    items: [
      { id: 'citas', label: 'Recepción', icon: <Calendar className="w-5 h-5" /> },
      { id: 'consulta', label: 'Registro', icon: <Stethoscope className="w-5 h-5" /> },
      { id: 'informes', label: 'Informes', icon: <FileText className="w-5 h-5" /> },
      { id: 'pacientes', label: 'Pacientes', icon: <Users className="w-5 h-5" /> },
      { id: 'ordenes', label: 'Órdenes HL7', icon: <Activity className="w-5 h-5" /> },
      { id: 'Formulario', label: 'Formulario', icon: <Form className="w-5 h-5" /> },
    ]
  },
  {
    title: 'Finanzas e Inventario',
    items: [
      { id: 'caja', label: 'Caja', icon: <DollarSign className="w-5 h-5" /> },
      { id: 'inventory', label: 'Insumos', icon: <Box className="w-5 h-5" /> },
      { id: 'templates', label: 'Plantillas', icon: <FileBadge className="w-5 h-5" /> },
      { id: 'metricas', label: 'Métricas', icon: <BarChart className="w-5 h-5" /> },
    ]
  },
  {
    title: 'Herramientas Avanzadas',
    items: [
      { id: 'mantenimiento', label: 'Mantenimiento', icon: <Wrench className="w-5 h-5" /> },
      { id: 'totem', label: 'Tótem', icon: <Smartphone className="w-5 h-5" /> },
      { id: 'teleradiologia', label: 'Teleradiología', icon: <Radio className="w-5 h-5" /> },
      { id: 'docencia', label: 'Docencia', icon: <GraduationCap className="w-5 h-5" /> },
    ]
  },
  {
    title: 'Configuración',
    items: [
      { id: 'servicios', label: 'Servicios', icon: <Activity className="w-5 h-5" /> },
      { id: 'modalidades', label: 'Modalidades', icon: <Server className="w-5 h-5" /> },
      { id: 'equipos', label: 'Equipos', icon: <Network className="w-5 h-5" /> },
      { id: 'sucursales', label: 'Sucursales', icon: <Building2 className="w-5 h-5" /> },
      { id: 'organizaciones', label: 'Organizaciones', icon: <Building className="w-5 h-5" /> },
      { id: 'empresas', label: 'Empresas', icon: <Briefcase className="w-5 h-5" /> },
    ]
  }
];

const ITEMS_PER_PAGE = 10;

/** Outside the component → stable reference, no re-creation on every render */
function PaginationControls({
  totalItems,
  currentPage,
  setCurrentPage,
}: {
  totalItems: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-between items-center mt-4 text-sm">
      <span className="text-primary-light">
        Mostrando {Math.min(totalItems, (currentPage - 1) * ITEMS_PER_PAGE + 1)}–
        {Math.min(totalItems, currentPage * ITEMS_PER_PAGE)} de {totalItems}
      </span>
      <div className="flex gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 hover:bg-primary-light hover:text-black transition-colors"
        >
          Anterior
        </button>
        <span className="px-3 py-1">Página {currentPage} de {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          className="px-3 py-1 bg-secondary-dark rounded disabled:opacity-50 hover:bg-primary-light hover:text-black transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

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

function RisWorklistPanel({ servicesManager }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [medicalUsers, setMedicalUsers] = useState<MedicalUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);
  const [newOrganization, setNewOrganization] = useState<Omit<Organization, '_id'>>({
    name: '',
    oid: '',
  });
  const [user, setUser] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // itemsPerPage is now the module-level ITEMS_PER_PAGE constant

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('citas');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isCreatingPatient, setIsCreatingPatient] = useState(false);
  const [isCreatingModality, setIsCreatingModality] = useState(false);
  const [isCreatingEquipment, setIsCreatingEquipment] = useState(false);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isCreatingInventory, setIsCreatingInventory] = useState(false);
  const [isCreatingCashRegister, setIsCreatingCashRegister] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  const [newPatient, setNewPatient] = useState({ patientId: '', documentId: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'U', phone: '', email: '', address: '' });
  const [newOrder, setNewOrder] = useState({ patient: '', accessionNumber: '', modality: '', procedureDescription: '', scheduledDate: '', referringPhysician: '', branch: '' });
  const [newModality, setNewModality] = useState({ name: '', dicom_code: '', description: '' });
  const [newEquipment, setNewEquipment] = useState({ name: '', manufacturer: '', model: '', serial_number: '' });
  const [newService, setNewService] = useState({ name: '', fk_branch: '', fk_modality: '', fk_equipments: [], price: 0 });
  const [newBranch, setNewBranch] = useState({
    name: '',
    short_name: '',
    oid: '',
    country_code: '',
    structure_id: '',
    suffix: '',
    fk_organization: ''
  });

  const [newTemplate, setNewTemplate] = useState({ name: '', modality: '', contentHtml: '' });
  const [newInventory, setNewInventory] = useState({ itemName: '', unit: '', stockQuantity: 0, costPrice: 0, sellingPrice: 0 });
  const [newCashRegister, setNewCashRegister] = useState({ openingBalance: 0, actualCash: 0, notes: '', expectedCash: 0 });
  const [newCompany, setNewCompany] = useState({ name: '', ruc: '', hasInsurance: false, insuranceName: '', insurancePolicy: '', status: true });

  // CRUD State
  const [editingItem, setEditingItem] = useState(null); // { type: 'modality' | 'equipment' | 'service' | 'patient' | 'order' | 'branch', data: any }
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState<any>(null);
  const [isTelemedOpen, setIsTelemedOpen] = useState(false);
  const [telemedPatient, setTelemedPatient] = useState('');
  const [telemedStudyId, setTelemedStudyId] = useState('');

  const { t } = useTranslation();
  const { show } = useModal();
  const navigate = useNavigate();
  const [appConfig] = useAppConfig();

  const { menuOptions } = getHeaderConfig({
    servicesManager,
    t,
    show,
    navigate,
    appConfig,
  });
  const normalizePatientName = rawName => {
    if (!rawName) {
      return '';
    }

    return rawName.replace(/[\^,]/g, ' ').replace(/\s+/g, ' ').trim();
  };
  useEffect(() => {
    const localStr = localStorage.getItem('usuario');
    const session = localStr ? JSON.parse(localStr) : null;
    if (session?.user) {
      setUser(session.user);
    }
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [ord, pat, mod, eq, ser, br, rep, ana, med, org, set, tpls, inv, cash, comp] = await Promise.all([
        fetchAllOrders(),
        fetchPatients(),
        fetchModalities(),
        fetchEquipment(),
        fetchServices(),
        fetchBranches(),
        fetchAllReports(),
        fetchAnalytics(),
        fetchMedicalUsers(),
        fetchAllOrganizations(),
        fetchSettings(),
        fetchTemplates().catch(() => []),
        fetchInventory().catch(() => []),
        fetchCashRegisters().catch(() => []),
        fetchCompanies().catch(() => [])
      ]);
      setOrders(ord);
      setPatients(pat);
      setModalities(mod);
      setEquipmentList(eq);
      setServices(ser);
      setBranches(br);
      setReports(rep);
      setAnalytics(ana);
      setMedicalUsers(med);
      setOrganizations(org);
      setTemplates(tpls);
      setInventory(inv);
      setCashRegisters(cash);
      setCompanies(comp);

      // Auto-select organization based on institution name if available
      let defaultOrgId = org[0]?._id || '';
      if (set?.institution_name) {
        const matchingOrg = org.find(o => o.name === set.institution_name);
        if (matchingOrg) {
          defaultOrgId = matchingOrg._id;
        }
      }

      // Set default modality for new order if available
      if (mod.length > 0 && !newOrder.modality) {
        setNewOrder(prev => ({ ...prev, modality: mod[0].dicom_code }));
      }

      // Set default organization for new branch if available
      if (org.length > 0 && !newBranch.fk_organization) {
        setNewBranch(prev => ({ ...prev, fk_organization: defaultOrgId }));
      }
    } catch (error) {
      toast.error('Error cargando datos: ' + (error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  // NOTE: loadAll is already called inside the first useEffect above (line ~134).
  // A second call here was causing duplicate fetches on mount — removed.

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Stable reference — only recreates when searchQuery changes
  const fuzzySearch = useCallback((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    const patient = item.patient || item.order?.patient || (item.firstName || item.patientId ? item : null);
    if (patient) {
      const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
      const patientId = (item.patient?.patientId || '').toLowerCase();
      const accession = (item.accessionNumber || '').toLowerCase();
      const doctor = (item.referringPhysician || '').toLowerCase();
      if (fullName.includes(q) || patientId.includes(q) || accession.includes(q) || doctor.includes(q)) return true;
    }

    const name = (item.name || '').toLowerCase();
    const dicomCode = (item.dicom_code || '').toLowerCase();
    const manufacturer = (item.manufacturer || '').toLowerCase();
    const model = (item.model || '').toLowerCase();
    const serial = (item.serial_number || '').toLowerCase();

    return name.includes(q) || dicomCode.includes(q) || manufacturer.includes(q) || model.includes(q) || serial.includes(q);
  }, [searchQuery]);

  // Stable reference — only recreates when currentPage changes
  const paginate = useCallback((items: any[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage]);

  // Memoized wrapper that binds currentPage/setCurrentPage to the stable
  // PaginationControls component — keeps prop interface of all tabs unchanged.
  const Paginator = useCallback(
    ({ totalItems }: { totalItems: number }) => (
      <PaginationControls
        totalItems={totalItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    ),
    [currentPage]
  );

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Error cargando órdenes: ' + (error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Estado actualizado');
      loadOrders();
    } catch (e) {
      toast.error('Error al actualizar: ' + (e as any).message);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient({ ...newPatient, dateOfBirth: newPatient.dateOfBirth || undefined });
      toast.success('Paciente creado exitosamente');
      setIsCreatingPatient(false);
      setNewPatient({ patientId: '', documentId: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'U', phone: '', email: '', address: '' });
      const data = await fetchPatients();
      setPatients(data);
    } catch (err) {
      toast.error('Error al crear paciente: ' + (err as any).message);
    }
  };

  const handleCreateOrder = async (e: any, customOrder?: any) => {
    e?.preventDefault?.();
    try {
      const orderData = customOrder || newOrder;
      const payload = {
        ...orderData,
        accessionNumber: orderData.accessionNumber || `ACC-${Date.now()}`
      };
      await createOrder(payload);
      toast.success('Estudio agendado correctamente');
      setNewOrder({ patient: '', accessionNumber: '', modality: modalities[0]?.dicom_code || 'DX', procedureDescription: '', scheduledDate: '', referringPhysician: '', branch: '' });
      setActiveTab('ordenes');
      loadOrders();
    } catch (err) {
      toast.error('Error al agendar estudio: ' + (err as any).message);
    }
  };

  const handleCreateModality = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createModality(newModality);
      toast.success('Modalidad creada');
      setIsCreatingModality(false);
      setNewModality({ name: '', dicom_code: '', description: '' });
      const data = await fetchModalities();
      setModalities(data);
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBranch(newBranch);
      toast.success('Sucursal creada');
      setIsCreatingBranch(false);
      setNewBranch({
        name: '',
        short_name: '',
        oid: '',
        country_code: '',
        structure_id: '',
        suffix: '',
        fk_organization: organizations[0]?._id || ''
      });
      const data = await fetchBranches();
      setBranches(data);
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrganization(newOrganization);
      toast.success('Organización creada');
      setIsCreatingOrganization(false);
      setNewOrganization({
        name: '',
        short_name: '',
        oid: '',
        country_code: '',
        structure_id: '',
        suffix: '',
        status: true
      });
      loadAll();
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  const handleEdit = (type: string, data: any) => {
    setEditingItem({ type, data });
    setIsEditing(true);
    if (type === 'patient') setNewPatient({ ...data });
    if (type === 'modality') setNewModality({ ...data });
    if (type === 'equipment') setNewEquipment({ ...data });
    if (type === 'service') setNewService({ ...data, fk_equipments: data.fk_equipments?.map(e => (typeof e === 'string' ? e : e._id)) || [] });
    if (type === 'order') setNewOrder({ ...data, patient: data.patient?._id || data.patient, referringPhysician: data.referringPhysician || '', branch: data.branch?._id || data.branch || '' });
    if (type === 'branch') {
      const orgId = data.fk_organization?._id || data.fk_organization || (organizations[0]?._id || '');
      setNewBranch({ ...data, fk_organization: orgId });
    }
    if (type === 'organization') setNewOrganization({ ...data });
    if (type === 'template') setNewTemplate({ ...data });
    if (type === 'inventory') setNewInventory({ ...data });
    if (type === 'cash-register' || type === 'cash-register-close') setNewCashRegister({ ...data });
    if (type === 'company') setNewCompany({ ...data });

    // Scroll to top or form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
    setNewPatient({ patientId: '', documentId: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'U', phone: '', email: '', address: '' });
    setNewModality({ name: '', dicom_code: '', description: '' });
    setNewEquipment({ name: '', manufacturer: '', model: '', serial_number: '' });
    setNewService({ name: '', fk_branch: '', fk_modality: '', fk_equipments: [], price: 0 });
    setNewOrder({ patient: '', accessionNumber: '', modality: '', procedureDescription: '', scheduledDate: '', referringPhysician: '', branch: '' });
    setNewBranch({
      name: '',
      short_name: '',
      oid: '',
      country_code: '',
      structure_id: '',
      suffix: '',
      fk_organization: organizations[0]?._id || ''
    });
    setNewTemplate({ name: '', modality: '', contentHtml: '' });
    setNewInventory({ itemName: '', unit: '', stockQuantity: 0, costPrice: 0, sellingPrice: 0 });
    setNewCashRegister({ openingBalance: 0, actualCash: 0, notes: '', expectedCash: 0 });
    setNewCompany({ name: '', ruc: '', hasInsurance: false, insuranceName: '', insurancePolicy: '', status: true });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const { type, data } = editingItem;
      const id = data._id;
      if (type === 'patient') await updatePatient(id, newPatient);
      if (type === 'modality') await updateModality(id, newModality);
      if (type === 'equipment') await updateEquipment(id, newEquipment);
      if (type === 'service') await updateService(id, newService);
      if (type === 'order') await updateOrder(id, newOrder);
      if (type === 'branch') await updateBranch(id, newBranch);
      if (type === 'organization') await updateOrganization(id, newOrganization);
      if (type === 'template') await updateTemplate(id, newTemplate);
      if (type === 'inventory') await updateInventoryItem(id, newInventory);
      if (type === 'cash-register' || type === 'cash-register-close') await closeCashRegister(id, newCashRegister);
      if (type === 'company') await updateCompany(id, newCompany);

      toast.success('Actualizado correctamente');
      handleCancelEdit();
      loadAll();
    } catch (err) {
      toast.error('Error al actualizar: ' + (err as any).message);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este registro?')) return;
    try {
      if (type === 'patient') await deletePatient(id);
      if (type === 'modality') await deleteModality(id);
      if (type === 'equipment') await deleteEquipment(id);
      if (type === 'organization') await deleteOrganization(id);
      if (type === 'service') await deleteService(id);
      if (type === 'order') await deleteOrder(id);
      if (type === 'branch') await deleteBranch(id);
      if (type === 'template') await deleteTemplate(id);
      if (type === 'inventory') await deleteInventoryItem(id);
      if (type === 'company') await deleteCompany(id);

      toast.success('Eliminado correctamente');
      loadAll();
    } catch (err) {
      toast.error('Error al eliminar: ' + (err as any).message);
    }
  };

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEquipment(newEquipment);
      toast.success('Equipo creado');
      setIsCreatingEquipment(false);
      setNewEquipment({ name: '', manufacturer: '', model: '', serial_number: '' });
      const data = await fetchEquipment();
      setEquipmentList(data);
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createService(newService);
      toast.success('Servicio creado');
      setIsCreatingService(false);
      setNewService({ name: '', fk_branch: '', fk_modality: '', fk_equipments: [], price: 0 });
      const data = await fetchServices();
      setServices(data);
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTemplate(newTemplate);
      toast.success('Plantilla creada');
      setIsCreatingTemplate(false);
      setNewTemplate({ name: '', modality: '', contentHtml: '' });
      const data = await fetchTemplates();
      setTemplates(data);
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInventoryItem(newInventory);
      toast.success('Ítem de inventario creado');
      setIsCreatingInventory(false);
      setNewInventory({ itemName: '', unit: '', stockQuantity: 0, costPrice: 0, sellingPrice: 0 });
      const data = await fetchInventory();
      setInventory(data);
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  const handleCreateCashRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await openCashRegister(newCashRegister);
      toast.success('Caja abierta');
      setIsCreatingCashRegister(false);
      setNewCashRegister({ openingBalance: 0, actualCash: 0, notes: '', expectedCash: 0 });
      const data = await fetchCashRegisters();
      setCashRegisters(data);
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany(newCompany);
      toast.success('Empresa creada exitosamente');
      setIsCreatingCompany(false);
      setNewCompany({ name: '', ruc: '', hasInsurance: false, insuranceName: '', insurancePolicy: '', status: true });
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (err) {
      toast.error('Error al crear empresa: ' + (err as any).message);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-black overflow-hidden">
      <Header
        isSticky
        menuOptions={menuOptions}
        isReturnEnabled={true}
        WhiteLabeling={appConfig.whiteLabeling}
      />
      <Onboarding />
      <SidebarNavigation onFilterToggle={() => navigate('/')} />

      <div className="flex flex-1 bg-black text-white font-sans overflow-hidden relative">
        {/* Mobile Drawer Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-50 sm:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <aside
              className="w-64 h-full bg-secondary-dark border-r border-secondary-dark flex flex-col z-50 animate-slide-in-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-dark/50">
                <div className="flex items-center gap-2">
                  <img src="/ris_logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="font-bold text-lg text-primary-light">RIS</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                {MENU_GROUPS.map((group, gIdx) => (
                  <div key={gIdx} className="mb-6">
                    <div className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {group.title}
                    </div>
                    <div className="space-y-1">
                      {group.items.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${isActive
                              ? 'bg-primary-light/10 text-primary-light border-r-4 border-primary-light shadow-sm'
                              : 'text-gray-400 hover:text-white hover:bg-secondary-dark border-transparent border-r-4'
                              }`}
                            style={{ width: 'calc(100% - 16px)' }}
                          >
                            <span className={`${isActive ? 'text-primary-light' : 'text-gray-400'}`}>
                              {item.icon}
                            </span>
                            <span className="ml-3 text-sm font-medium whitespace-nowrap">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}

        {/* Sidebar */}
        {activeTab !== 'totem' && (
          <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 bg-gradient-to-t from-secondary-dark border-r border-secondary-dark flex flex-col transition-all duration-300 z-10 hidden sm:flex`}>
            <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-dark/50">
              {isSidebarOpen ? (
                <div className="flex items-center gap-2">
                  <img src="/ris_logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="font-bold text-lg text-primary-light">RIS</span>
                </div>
              ) : (
                <img src="/ris_logo.svg" alt="Logo" className="w-8 h-8 object-contain mx-auto" />
              )}
              {isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-dark transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-dark transition-colors mx-auto mt-1">
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
              {MENU_GROUPS.map((group, gIdx) => (
                <div key={gIdx} className="mb-6">
                  {isSidebarOpen && (
                    <div className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {group.title}
                    </div>
                  )}
                  <div className="space-y-1">
                    {group.items.map(item => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          title={!isSidebarOpen ? item.label : undefined}
                          className={`w-full flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-primary-light/10 text-primary-light border-r-4 border-primary-light shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-secondary-dark border-transparent border-r-4'
                            }`}
                          style={{ width: 'calc(100% - 16px)' }}
                        >
                          <span className={`${isActive ? 'text-primary-light' : 'text-gray-400'}`}>
                            {item.icon}
                          </span>
                          {isSidebarOpen && (
                            <span className="ml-3 text-sm font-medium whitespace-nowrap">
                              {item.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Contenido Principal */}
        <main className="flex-1 flex flex-col min-w-0 bg-black">
          {/* Header Superior del Contenido */}
          <header className="h-16 flex-shrink-0 bg-black/80 backdrop-blur-md border-b border-secondary-dark flex items-center justify-between px-3 sm:px-6 z-10 w-full animate-fade-in-up">
            <div className="flex items-center gap-2 max-w-[45%]">
              {/* Hamburger button on mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-secondary-dark sm:hidden transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-sm sm:text-lg font-bold flex items-center gap-1.5 sm:gap-2 truncate">
                <span className="hidden xs:inline-block">
                  {MENU_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.icon}
                </span>
                <span className="text-sm sm:text-base font-semibold text-gray-100 truncate">
                  {MENU_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label}
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 max-w-[55%]">
              <div className="relative w-28 xs:w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full bg-primary-dark/80 border border-secondary-dark text-white rounded-full px-3 py-1.5 pl-8 text-xs focus:border-primary-light focus:outline-none transition-all placeholder:text-gray-500"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
                <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <button
                onClick={loadAll}
                className="bg-secondary-dark hover:bg-gray-700 flex items-center rounded-full px-3 py-1.5 text-white text-xs transition-colors border border-gray-600 font-medium whitespace-nowrap"
              >
                Refrescar
              </button>
            </div>
          </header>

          {/* Area Render con Glassmorphism base */}
          <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar relative">
            <div className="bg-primary-dark/40 border border-white/5 shadow-2xl rounded-xl p-4 md:p-6 min-h-full backdrop-blur-sm">

              {activeTab === 'ordenes' && (
                <OrdersTab isLoading={isLoading} orders={orders} reports={reports} fuzzySearch={fuzzySearch} paginate={paginate} handleStatusChange={handleStatusChange} handleEdit={handleEdit} handleDelete={handleDelete} loadAll={loadAll} PaginationControls={Paginator} openPatientProfile={setSelectedPatientProfile} />
              )}

              {activeTab === 'pacientes' && (
                <PatientsTab patients={patients} fuzzySearch={fuzzySearch} paginate={paginate} isCreatingPatient={isCreatingPatient} setIsCreatingPatient={setIsCreatingPatient} isEditing={isEditing} editingItem={editingItem} handleCreatePatient={handleCreatePatient} handleUpdate={handleUpdate} handleCancelEdit={handleCancelEdit} handleEdit={handleEdit} handleDelete={handleDelete} newPatient={newPatient} setNewPatient={setNewPatient} PaginationControls={Paginator} openPatientProfile={setSelectedPatientProfile} />
              )}

              {activeTab === 'citas' && (
                <AppointmentsTab companies={companies} services={services} isEditing={isEditing} editingItem={editingItem} handleUpdate={handleUpdate} handleCreateOrder={handleCreateOrder} newOrder={newOrder} setNewOrder={setNewOrder} patients={patients} modalities={modalities} medicalUsers={medicalUsers} branches={branches} user={user} handleCancelEdit={handleCancelEdit} orders={orders} handleEdit={handleEdit} handleDelete={handleDelete} />
              )}

              {activeTab === 'consulta' && (
                <ConsultaTab
                  patients={patients}
                  modalities={modalities}
                  services={services}
                  medicalUsers={medicalUsers}
                  branches={branches}
                  user={user}
                  orders={orders}
                  handleCreateOrder={handleCreateOrder}
                  newOrder={newOrder}
                  setNewOrder={setNewOrder}
                  companies={companies}
                />
              )}

              {activeTab === 'Formulario' && (
                <FormularioTab />
              )}

              {activeTab === 'informes' && (
                <ReportsTab
                  reports={reports}
                  orders={orders}
                  modalities={modalities}
                  fuzzySearch={fuzzySearch}
                  paginate={paginate}
                  appConfig={appConfig}
                  normalizePatientName={normalizePatientName}
                  navigate={navigate}
                  PaginationControls={Paginator}
                />
              )}

              {activeTab === 'modalidades' && (
                <ModalitiesTab modalities={modalities} fuzzySearch={fuzzySearch} paginate={paginate} isCreatingModality={isCreatingModality} setIsCreatingModality={setIsCreatingModality} isEditing={isEditing} editingItem={editingItem} handleCreateModality={handleCreateModality} handleUpdate={handleUpdate} handleCancelEdit={handleCancelEdit} handleEdit={handleEdit} handleDelete={handleDelete} newModality={newModality} setNewModality={setNewModality} PaginationControls={Paginator} />
              )}

              {activeTab === 'equipos' && (
                <EquipmentTab equipmentList={equipmentList} fuzzySearch={fuzzySearch} paginate={paginate} isCreatingEquipment={isCreatingEquipment} setIsCreatingEquipment={setIsCreatingEquipment} isEditing={isEditing} editingItem={editingItem} handleCreateEquipment={handleCreateEquipment} handleUpdate={handleUpdate} handleCancelEdit={handleCancelEdit} handleEdit={handleEdit} handleDelete={handleDelete} newEquipment={newEquipment} setNewEquipment={setNewEquipment} PaginationControls={Paginator} />
              )}

              {activeTab === 'servicios' && (
                <ServicesTab services={services} branches={branches} modalities={modalities} fuzzySearch={fuzzySearch} paginate={paginate} isCreatingService={isCreatingService} setIsCreatingService={setIsCreatingService} isEditing={isEditing} editingItem={editingItem} handleCreateService={handleCreateService} handleUpdate={handleUpdate} handleCancelEdit={handleCancelEdit} handleEdit={handleEdit} handleDelete={handleDelete} newService={newService} setNewService={setNewService} PaginationControls={Paginator} />
              )}

              {activeTab === 'sucursales' && (
                <BranchesTab branches={branches} organizations={organizations} fuzzySearch={fuzzySearch} paginate={paginate} isCreatingBranch={isCreatingBranch} setIsCreatingBranch={setIsCreatingBranch} isEditing={isEditing} editingItem={editingItem} handleCreateBranch={handleCreateBranch} handleUpdate={handleUpdate} handleCancelEdit={handleCancelEdit} handleEdit={handleEdit} handleDelete={handleDelete} newBranch={newBranch} setNewBranch={setNewBranch} PaginationControls={Paginator} />
              )}

              {activeTab === 'organizaciones' && (
                <OrganizationsTab organizations={organizations} fuzzySearch={fuzzySearch} paginate={paginate} isCreatingOrganization={isCreatingOrganization} setIsCreatingOrganization={setIsCreatingOrganization} isEditing={isEditing} editingItem={editingItem} handleCreateOrganization={handleCreateOrganization} handleUpdate={handleUpdate} handleCancelEdit={handleCancelEdit} handleEdit={handleEdit} handleDelete={handleDelete} newOrganization={newOrganization} setNewOrganization={setNewOrganization} PaginationControls={Paginator} />
              )}

              {activeTab === 'templates' && (
                <TemplatesTab templatesList={templates} fuzzySearch={fuzzySearch} paginate={paginate} isCreating={isCreatingTemplate} setIsCreating={setIsCreatingTemplate} isEditing={isEditing} editingItem={editingItem} handleCreate={handleCreateTemplate} handleUpdate={handleUpdate} handleCancelEdit={handleCancelEdit} handleEdit={handleEdit} handleDelete={handleDelete} newItemState={newTemplate} setNewItemState={setNewTemplate} PaginationControls={Paginator} modalities={modalities} />
              )}

              {activeTab === 'inventory' && (
                <InventoryTab inventoryList={inventory} fuzzySearch={fuzzySearch} paginate={paginate} isCreating={isCreatingInventory} setIsCreating={setIsCreatingInventory} isEditing={isEditing} editingItem={editingItem} handleCreate={handleCreateInventory} handleUpdate={handleUpdate} handleCancelEdit={handleCancelEdit} handleEdit={handleEdit} handleDelete={handleDelete} newItemState={newInventory} setNewItemState={setNewInventory} PaginationControls={Paginator} />
              )}

              {activeTab === 'caja' && (
                <CashRegisterTab registersList={cashRegisters} fuzzySearch={fuzzySearch} paginate={paginate} isCreating={isCreatingCashRegister} setIsCreating={setIsCreatingCashRegister} isEditing={isEditing} editingItem={editingItem} handleCreate={handleCreateCashRegister} handleUpdate={handleUpdate} handleCancelEdit={handleCancelEdit} handleEdit={handleEdit} handleDelete={handleDelete} newItemState={newCashRegister} setNewItemState={setNewCashRegister} PaginationControls={Paginator} orders={orders} />
              )}

              {activeTab === 'metricas' && (
                <MetricsTab analytics={analytics} orders={orders} />
              )}

              {activeTab === 'mantenimiento' && (
                <MaintenanceTab equipmentList={equipmentList} loadAll={loadAll} />
              )}

              {activeTab === 'totem' && (
                <TotemTab orders={orders} loadAll={loadAll} />
              )}

              {activeTab === 'teleradiologia' && (
                <TeleradiologyTab orders={orders} reports={reports} medicalUsers={medicalUsers} />
              )}

              {activeTab === 'docencia' && (
                <TeachingFileTab reports={reports} navigate={navigate} appConfig={appConfig} />
              )}

              {activeTab === 'empresas' && (
                <CompaniesTab
                  companies={companies}
                  fuzzySearch={fuzzySearch}
                  paginate={paginate}
                  isCreating={isCreatingCompany}
                  setIsCreating={setIsCreatingCompany}
                  isEditing={isEditing}
                  editingItem={editingItem}
                  handleCreate={handleCreateCompany}
                  handleUpdate={handleUpdate}
                  handleCancelEdit={handleCancelEdit}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  newItemState={newCompany}
                  setNewItemState={setNewCompany}
                  PaginationControls={Paginator}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Patient Profile Modal overlays everything */}
      {selectedPatientProfile && (
        <PatientProfileModal
          patient={selectedPatientProfile}
          orders={orders}
          reports={reports}
          onClose={() => setSelectedPatientProfile(null)}
          onSavePatient={async (id: string, data: any) => {
            await updatePatient(id, data);
            toast.success('Perfil clínico actualizado');
            loadAll();
            setSelectedPatientProfile(data); // update local state so allergies refresh
          }}
          loadAll={loadAll}
        />
      )}

      {/* Telemedicine Modal */}
      <TelemedModal
        isOpen={isTelemedOpen}
        onClose={() => setIsTelemedOpen(false)}
        patientName={telemedPatient}
        studyId={telemedStudyId}
      />
    </div>
  );
}
RisWorklistPanel.propTypes = {
  servicesManager: PropTypes.object.isRequired,
};

export default RisWorklistPanel;
