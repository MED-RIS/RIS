export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  patientId?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
}

export interface Modality {
  _id: string;
  dicom_code: string;
  name: string;
}

export interface Equipment {
  _id: string;
  name: string;
  manufacturer: string;
  model: string;
  serial_number: string;
}

export interface Service {
  _id: string;
  name: string;
  price: number;
  fk_modality?: string | Modality;
}

export interface ServiceLine {
  modality: string;
  modalityName?: string;
  serviceId: string;
  serviceName?: string;
  amount: number;
  manualAmount: string;
  effectiveAmount: number;
}

export interface Order {
  _id: string;
  patient: string | Patient;
  accessionNumber: string;
  modality: string;
  procedureDescription?: string;
  scheduledDate?: string;
  referringPhysician?: string;
  branch?: string;
  serviceLines?: ServiceLine[];
  company?: string;
  hasInsurance?: boolean;
  insuranceName?: string;
  insurancePolicy?: string;
  ruc?: string;
  agreementType?: string;
  billingFormat?: string;
  requiresInvoice?: boolean;
  invoiceNumber?: string;
  directAmount?: number;
  totalAmount?: number;
  paymentStatus?: 'PENDING' | 'PARTIAL' | 'PAID' | 'WAIVED';
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | 'INSURANCE' | 'OTHER';
  paymentNotes?: string;
  patientPhone?: string;
  patientAge?: number;
  observations?: string;
  paidAt?: string;
  status?: string;
}

export interface Branch {
  _id: string;
  name: string;
  oid?: string;
}

export interface Organization {
  _id: string;
  name: string;
  oid?: string;
}

export interface Template {
  _id: string;
  name: string;
  modality: string;
  contentHtml: string;
}

export interface InventoryItem {
  _id: string;
  itemName: string;
  description?: string;
  unit?: string;
  stockQuantity?: number;
  costPrice?: number;
  sellingPrice?: number;
  type?: 'inventory';
}

export interface Company {
  _id: string;
  name: string;
  hasInsurance?: boolean;
  insuranceName?: string;
  insurancePolicy?: string;
  ruc?: string;
  agreementType?: string;
  billingFormat?: string;
  status?: boolean;
}

export interface MedicalUser {
  _id: string;
  nombre: string;
  role: string;
}

export interface CashRegister {
  _id: string;
  initialAmount: number;
  currentAmount: number;
  status: 'OPEN' | 'CLOSED';
  openedBy?: string;
  closedBy?: string;
  openedAt?: string;
  closedAt?: string;
}
