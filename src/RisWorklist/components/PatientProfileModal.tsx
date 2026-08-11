import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Activity, FileText, Upload, Calendar, X, FileBadge, Save } from 'lucide-react';
import RisUploadDocuments from './RisUploadDocuments';

export default function PatientProfileModal({
  patient,
  orders,
  reports = [],
  onClose,
  onSavePatient,
  loadAll
}: any) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'historial' | 'documentos'>('resumen');
  
  const [allergies, setAllergies] = useState(patient?.allergies || '');
  const [clinicalNotes, setClinicalNotes] = useState(patient?.clinicalNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if patient changes
  useEffect(() => {
    setAllergies(patient?.allergies || '');
    setClinicalNotes(patient?.clinicalNotes || '');
  }, [patient]);

  if (!patient) return null;

  const patientOrders = orders.filter((o: any) => o.patient?._id === patient._id || o.patient === patient._id)
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  const getOrderReport = (orderId: string) => {
    return reports.find((r: any) => r.order?._id === orderId || r.order === orderId);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSavePatient(patient._id, { ...patient, allergies, clinicalNotes });
    setIsSaving(false);
  };

  const calcAge = (dob: string) => {
    if (!dob) return '-';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' años';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="bg-plom-main border border-white/10 rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 bg-black/40 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-main to-secondary-main flex items-center justify-center text-xl font-black text-white shadow-lg shadow-primary-dark/50">
              {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{patient.lastName}, {patient.firstName}</h2>
              <div className="flex items-center gap-3 text-sm text-gray-400 mt-1 font-sans tracking-wide">
                <span>MRN: <span className="text-white">{patient.patientId}</span></span>
                {patient.documentId && <><span>•</span><span>CI/DNI: <span className="text-white">{patient.documentId}</span></span></>}
                <span>•</span><span>Edad: <span className="text-white">{calcAge(patient.dateOfBirth)}</span></span>
                <span>•</span><span>Sexo: <span className="text-white">{(patient.gender || '').toLowerCase() === 'male' || (patient.gender || '').toLowerCase() === 'masculino' || (patient.gender || '').toLowerCase() === 'm' ? 'Masculino' : (patient.gender || '').toLowerCase() === 'female' || (patient.gender || '').toLowerCase() === 'femenino' || (patient.gender || '').toLowerCase() === 'f' ? 'Femenino' : patient.gender || 'No especificado'}</span></span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR TABS */}
          <div className="w-48 bg-black/20 border-r border-white/5 flex flex-col p-4 gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`flex items-center gap-3 w-full text-left p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'resumen' ? 'bg-primary-dark/40 text-primary-light border border-primary-light/30' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'}`}
            >
              <Activity className="w-4 h-4" /> Resumen Clínico
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`flex items-center gap-3 w-full text-left p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'historial' ? 'bg-secondary-dark/40 text-secondary-light border border-secondary-light/30' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'}`}
            >
              <FileBadge className="w-4 h-4" /> Estudios Previos ({patientOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('documentos')}
              className={`flex items-center gap-3 w-full text-left p-3 rounded-xl transition-all font-bold text-sm ${activeTab === 'documentos' ? 'bg-common-dark/40 text-common-main border border-common-main/30' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'}`}
            >
              <FileText className="w-4 h-4" /> Documentos
            </button>
          </div>

          {/* MAIN TAB CONTENT */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-black/0 to-black/20 custom-scrollbar">
            
            {activeTab === 'resumen' && (
              <div className="space-y-6 animate-fade-in">
                {/* Contact Info Card */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Información de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Phone className="w-4 h-4" /></div>
                      <div>
                        <p className="text-gray-500 text-xs font-bold uppercase mb-0.5">Teléfono</p>
                        <p className="text-white font-medium">{patient.phone || 'No registrado'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-gray-400"><Mail className="w-4 h-4" /></div>
                      <div>
                        <p className="text-gray-500 text-xs font-bold uppercase mb-0.5">Email</p>
                        <p className="text-white font-medium">{patient.email || 'No registrado'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white/5 rounded-lg text-gray-400"><MapPin className="w-4 h-4" /></div>
                      <div>
                        <p className="text-gray-500 text-xs font-bold uppercase mb-0.5">Dirección</p>
                        <p className="text-white font-medium">{patient.address || 'No registrado'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Info Editable */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Anotaciones Clínicas</h3>
                    <button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-dark/40 text-primary-light hover:bg-primary-main/60 border border-primary-light/30 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Guardando...' : <><Save className="w-3.5 h-3.5" /> Guardar Cambios</>}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-2">⚡ Alergias y Riesgos</label>
                      <textarea
                        value={allergies}
                        onChange={e => setAllergies(e.target.value)}
                        placeholder="Ej. Alergia al yodo, asmático..."
                        rows={4}
                        className="w-full p-3 rounded-lg bg-red-900/10 border border-red-500/20 text-white focus:border-red-400/70 outline-none transition-all resize-none placeholder:text-red-900/40 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">📋 Notas Clínicas Generales</label>
                      <textarea
                        value={clinicalNotes}
                        onChange={e => setClinicalNotes(e.target.value)}
                        placeholder="Antecedentes importantes, cirugías previas..."
                        rows={4}
                        className="w-full p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-primary-light/70 outline-none transition-all resize-none placeholder:text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'historial' && (
              <div className="animate-fade-in">
                {patientOrders.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <FileBadge className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>El paciente no tiene estudios previos registrados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientOrders.map((o: any) => {
                      const report = getOrderReport(o._id);
                      return (
                        <div key={o._id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-black/60 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-secondary-dark/40 border border-secondary-light/20 flex flex-col items-center justify-center text-secondary-light font-bold uppercase">
                              <span className="text-lg leading-none">{o.modality}</span>
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-lg">{o.procedureDescription || 'Estudio Radiológico'}</h4>
                              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 font-sans tracking-wide">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(o.scheduledDate).toLocaleDateString('es-419')}</span>
                                <span>•</span>
                                <span>ACC: {o.accessionNumber}</span>
                                {o.referringPhysician && <><span>•</span><span>Dr. {o.referringPhysician}</span></>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {/* Status */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${o.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400 border-green-500/30' : o.status === 'CANCELED' ? 'bg-red-900/30 text-red-400 border-red-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'}`}>
                              {o.status}
                            </span>
                            
                            {/* Report Indicator */}
                            {report ? (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${report.status === 'SIGNED' ? 'bg-primary-dark/40 text-primary-light border-primary-light/30' : 'bg-common-dark/40 text-common-main border-common-main/30'}`}>
                                {report.status === 'SIGNED' ? '✓ Informe Firmado' : '✎ Informe Pendiente'}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-900/30 text-gray-500 border-gray-600/30">
                                Sin Informe
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documentos' && (
              <div className="animate-fade-in space-y-6">
                <div className="bg-common-dark/20 border border-common-main/20 rounded-xl p-6 text-center">
                  <Upload className="w-10 h-10 text-common-main mx-auto mb-3 opacity-50" />
                  <h3 className="text-white font-bold mb-1">Repositorio de Documentos</h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                    Sube consentimientos informados, recetas médicas, u otros documentos generales del paciente para tenerlos siempre disponibles.
                  </p>
                  
                  {patientOrders.length > 0 ? (
                    <div className="inline-block">
                       <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-bold">Vincular al último estudio: {patientOrders[0].accessionNumber}</p>
                       <RisUploadDocuments
                         patientName={`${patient.lastName || ''} ${patient.firstName || ''}`.trim()}
                         studyInstanceUid={patientOrders[0].studyInstanceUid}
                         orderId={patientOrders[0]._id}
                         onSuccess={loadAll}
                         variant="inline"
                         label="Adjuntar Documento"
                       />
                    </div>
                  ) : (
                    <div className="bg-red-900/20 text-red-400 border border-red-500/30 p-3 rounded-lg text-sm inline-block">
                      El paciente necesita al menos 1 estudio (Orden) para adjuntar documentos.
                    </div>
                  )}
                </div>

                {/* Per-study upload list */}
                {patientOrders.length > 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2 mb-4">Archivos por Estudio</h3>
                    <div className="space-y-3">
                      {patientOrders.map((o: any) => (
                        <div key={o._id} className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-secondary-dark/40 border border-secondary-light/20 flex items-center justify-center text-secondary-light font-bold text-xs flex-shrink-0">
                              {o.modality}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{o.procedureDescription || 'Estudio'}</p>
                              <p className="text-gray-500 text-[10px] font-sans tracking-wide">{o.accessionNumber} · {new Date(o.scheduledDate).toLocaleDateString('es-419')}</p>
                            </div>
                          </div>
                          <RisUploadDocuments
                            patientName={`${patient.lastName || ''} ${patient.firstName || ''}`.trim()}
                            studyInstanceUid={o.studyInstanceUid}
                            orderId={o._id}
                            onSuccess={loadAll}
                            variant="icon"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
