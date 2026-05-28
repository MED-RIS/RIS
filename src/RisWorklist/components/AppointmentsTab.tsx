import React, { useState, useEffect } from 'react';
import ConsultaTab from './ConsultaTab';

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h <= 20; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:20`);
    slots.push(`${h.toString().padStart(2, '0')}:40`);
  }
  slots.push('21:00');
  return slots;
};

const getWeekDays = (startDate: Date) => {
  return Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d;
  });
};

const toLocalISOString = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getModalityStyles = (modality: string) => {
  const mod = (modality || '').toUpperCase();
  if (['CT'].includes(mod)) return { bg: 'bg-orange-600/40', border: 'border-orange-500/50', text: 'text-orange-100', side: 'border-l-orange-500', plainText: 'text-orange-400' };
  if (['MR'].includes(mod)) return { bg: 'bg-purple-600/40', border: 'border-purple-500/50', text: 'text-purple-100', side: 'border-l-purple-500', plainText: 'text-primary-light' };
  if (['US'].includes(mod)) return { bg: 'bg-emerald-600/40', border: 'border-emerald-500/50', text: 'text-emerald-100', side: 'border-l-emerald-500', plainText: 'text-emerald-400' };
  if (['DX', 'CR', 'RX', 'MG'].includes(mod)) return { bg: 'bg-blue-600/40', border: 'border-blue-500/50', text: 'text-blue-100', side: 'border-l-blue-500', plainText: 'text-primary-main' };
  if (['SM'].includes(mod)) return { bg: 'bg-pink-600/40', border: 'border-pink-500/50', text: 'text-pink-100', side: 'border-l-pink-500', plainText: 'text-pink-400' };
  return { bg: 'bg-yellow-600/40', border: 'border-yellow-500/50', text: 'text-yellow-100', side: 'border-l-yellow-500', plainText: 'text-yellow-400' };
};

export default function AppointmentsTab({
  isEditing,
  editingItem,
  handleUpdate,
  handleCreateOrder,
  newOrder,
  setNewOrder,
  patients,
  modalities,
  medicalUsers,
  branches,
  user,
  handleCancelEdit,
  orders,
  handleEdit,
  handleDelete,
  services,
  companies
}: any) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    // Start on Monday
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (d.getDay() === 0) { // If today is Sunday, move to Monday
      d.setDate(d.getDate() + 1);
    }
    return d;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const timeSlots = generateTimeSlots();
  const weekDays = getWeekDays(currentWeekStart);

  useEffect(() => {
    if (isEditing && editingItem?.type === 'order') {
      setIsModalOpen(true);
    }
  }, [isEditing, editingItem]);

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);

    const newSelected = new Date(selectedDate);
    newSelected.setDate(newSelected.getDate() + 7);
    setSelectedDate(newSelected);
  };

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);

    const newSelected = new Date(selectedDate);
    newSelected.setDate(newSelected.getDate() - 7);
    setSelectedDate(newSelected);
  };

  const getSlotStatus = (day: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const slotStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 19, 59, 999);

    const slotOrders = orders.filter((o: any) => {
      if (!o.scheduledDate) return false;
      const orderDate = new Date(o.scheduledDate);
      return orderDate >= slotStart && orderDate <= slotEnd;
    });

    return {
      isOccupied: slotOrders.length > 0,
      orders: slotOrders
    };
  };

  const openModalForSlot = (day: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const slotStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0, 0);

    const localDateTime = toLocalISOString(slotStart);

    setNewOrder({ ...newOrder, scheduledDate: localDateTime, modality: '', patient: '', referringPhysician: '', branch: '' });
    setSelectedSlot(slotStart);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Date Selector Header */}
      <div className="flex justify-between items-center bg-primary-main p-3 sm:p-4 rounded-lg border border-secondary-dark shadow-sm gap-2">
        <button onClick={prevWeek} className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-black border border-secondary-dark rounded hover:bg-gray-900 transition-colors font-bold text-[10px] sm:text-xs text-gray-300 flex-shrink-0">
          <span className="hidden xs:inline">&lt; SEMANA ANTERIOR</span>
          <span className="xs:hidden">&lt; PREV</span>
        </button>

        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto px-1 sm:px-4 custom-scrollbar">
          {weekDays.map(day => {
            const isSelected = day.getTime() === selectedDate.getTime();
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center min-w-[65px] sm:min-w-[80px] px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg font-bold transition-all ${isSelected
                  ? 'bg-primary-light text-black shadow-md scale-105'
                  : 'bg-black border border-secondary-dark text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
              >
                <span className="uppercase text-[8px] sm:text-[10px] tracking-wider mb-0.5 sm:mb-1">{day.toLocaleDateString('es-419', { weekday: 'short' })}</span>
                <span className="text-sm sm:text-lg">{day.getDate()}</span>
                <span className="text-[8px] sm:text-[10px] uppercase font-normal">{day.toLocaleDateString('es-419', { month: 'short' })}</span>
              </button>
            )
          })}
        </div>

        <button onClick={nextWeek} className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-black border border-secondary-dark rounded hover:bg-gray-900 transition-colors font-bold text-[10px] sm:text-xs text-gray-300 flex-shrink-0">
          <span className="hidden xs:inline">SIGUIENTE SEMANA &gt;</span>
          <span className="xs:hidden">SIG &gt;</span>
        </button>
      </div>

      <div className="bg-primary-main rounded-lg border border-secondary-dark p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-secondary-dark pb-4">
          <h3 className="text-base sm:text-xl font-bold text-white uppercase tracking-wide">
            Agenda del {selectedDate.toLocaleDateString('es-419', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <div className="flex flex-wrap gap-3 text-[10px] sm:text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 border border-green-400"></span> Libre
            </div>
            {/* Dynamic Modal Colors Legend */}
            {(() => {
              const dayOrders = orders.filter((o: any) => {
                if (!o.scheduledDate) return false;
                const oDate = new Date(o.scheduledDate);
                return oDate.getFullYear() === selectedDate.getFullYear() &&
                       oDate.getMonth() === selectedDate.getMonth() &&
                       oDate.getDate() === selectedDate.getDate();
              });
              
              const uniqueMods = Array.from(new Set(dayOrders.map((o: any) => o.modality).filter(Boolean)));
              
              return uniqueMods.map((mod: any) => {
                let dotClass = 'bg-yellow-500 border-yellow-400';
                const upperMod = String(mod).toUpperCase();
                if (upperMod === 'CT') dotClass = 'bg-orange-500 border-orange-400';
                else if (upperMod === 'MR') dotClass = 'bg-purple-500 border-purple-400';
                else if (upperMod === 'US') dotClass = 'bg-emerald-500 border-emerald-400';
                else if (['DX', 'CR', 'RX', 'MG'].includes(upperMod)) dotClass = 'bg-blue-500 border-primary-light';
                else if (upperMod === 'SM') dotClass = 'bg-pink-500 border-pink-400';
                
                return (
                  <div key={mod} className="flex items-center gap-2 uppercase">
                    <span className={`w-3 h-3 rounded-full ${dotClass}`}></span> {mod}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {timeSlots.map(time => {
            const status = getSlotStatus(selectedDate, time);
            const isMulti = status.orders.length > 1;
            const primaryOrder = status.orders[0];
            const modStyles = status.isOccupied ? getModalityStyles(primaryOrder?.modality) : null;
            return (
              <button
                key={time}
                onClick={() => openModalForSlot(selectedDate, time)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all h-24 shadow-sm group relative overflow-visible ${status.isOccupied
                  ? isMulti
                    ? `bg-black/60 border-2 border-dashed border-primary-light/80 hover:border-white hover:bg-black/80 shadow-[0_0_10px_rgba(255,255,255,0.05)]`
                    : `bg-black/40 ${modStyles?.border} hover:bg-white/5`
                  : 'bg-green-800/20 border-green-700/50 hover:bg-green-700/40 text-green-400'
                  }`}
              >
                {/* Multi-appointment Badge indicator */}
                {status.isOccupied && isMulti && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-extrabold bg-primary-light text-black px-2 py-0.5 rounded-full border border-black shadow-[0_0_12px_rgba(255,255,255,0.3)] z-10 animate-pulse">
                    {status.orders.length}
                  </span>
                )}

                {/* Time Badge */}
                <span className={`font-sans tracking-wide text-xs sm:text-sm mb-1 ${status.isOccupied ? isMulti ? 'text-primary-light font-extrabold' : `${modStyles?.plainText} font-bold` : 'text-green-300 font-medium'}`}>
                  {time}
                </span>

                {status.isOccupied ? (
                  <div className="flex flex-col items-center w-full mt-0.5">
                    <span className={`text-[8px] sm:text-[10px] uppercase font-bold px-1 py-0.5 rounded w-full truncate border ${isMulti ? 'bg-primary-light/10 border-primary-light/30 text-primary-light' : `${modStyles?.bg} ${modStyles?.border} ${modStyles?.text}`}`}>
                      {isMulti ? 'MULTIPLES' : primaryOrder?.modality}
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-gray-300 truncate w-full px-0.5 mt-0.5">
                      {isMulti ? `${status.orders.length} PACIENTES` : primaryOrder?.patient?.lastName}
                    </span>
                    {!isMulti && primaryOrder?.company && (
                      <span className="text-[8px] text-primary-light truncate w-full px-0.5 mt-0.5">
                        {primaryOrder?.company}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[8px] sm:text-[10px] mt-0.5 font-bold text-white/30 uppercase tracking-widest group-hover:text-green-300 transition-colors">Libre</span>
                )}

                {/* Interactive Premium Hover Tooltip (Recuadro flotante) */}
                {status.isOccupied && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex flex-col gap-2 bg-primary-main/95 backdrop-blur-md p-3.5 rounded-xl border border-secondary-dark shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 w-64 text-left pointer-events-none transition-all">
                    <div className="flex justify-between items-center border-b border-secondary-dark pb-1.5">
                      <span className="font-sans tracking-wide text-xs font-bold text-primary-light">{time}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        {status.orders.length} {status.orders.length === 1 ? 'Cita' : 'Citas'} Programada{status.orders.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                      {status.orders.map((order: any, idx: number) => {
                        const oStyles = getModalityStyles(order.modality);
                        return (
                          <div key={order._id || idx} className="flex flex-col gap-0.5 bg-black/40 p-2 rounded-lg border border-secondary-dark/40">
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-white text-xs truncate max-w-[130px]">
                                {order.patient?.lastName}, {order.patient?.firstName}
                              </span>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide border ${oStyles.bg} ${oStyles.border} ${oStyles.text}`}>
                                {order.modality}
                              </span>
                            </div>
                            {order.referringPhysician && (
                              <span className="text-[9px] text-gray-400 truncate">
                                Dr. {order.referringPhysician}
                              </span>
                            )}
                            {order.company && (
                              <span className="text-[9px] text-primary-main font-medium truncate">
                                Empresa: {order.company}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-primary-main p-4 md:p-6 rounded-xl border border-secondary-dark w-full max-w-6xl shadow-2xl my-auto h-auto max-h-none lg:max-h-[90vh] flex flex-col overflow-y-auto lg:overflow-hidden">

            {/* Persistent Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-secondary-dark flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase">
                  {isEditing && editingItem?.type === 'order' ? 'Editar Estudio agendado' : 'Registro de Consulta'}
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                  {isEditing && editingItem?.type === 'order' ? 'Modificar datos de la cita y orden médica' : 'Registro de cliente, servicios por modalidad y pago integrado'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  if (isEditing) handleCancelEdit();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-visible lg:overflow-hidden min-h-0">
              {/* Left Column: Form (70%) */}
              <div className="w-full lg:w-[70%] overflow-visible lg:overflow-y-auto pr-0 lg:pr-2 flex flex-col min-h-0">
                {isEditing && editingItem?.type === 'order' ? (
                  <div className="bg-black/20 p-4 sm:p-5 rounded-xl border border-secondary-dark/50">
                    <form onSubmit={(e) => {
                      handleUpdate(e);
                      setIsModalOpen(false);
                    }} className="flex flex-col gap-4">
                      <select required value={newOrder.patient || ''} onChange={e => setNewOrder({ ...newOrder, patient: e.target.value })} className="p-3 rounded-lg bg-black border border-secondary-dark text-white font-bold focus:border-primary-light outline-none transition-colors">
                        <option value="">Seleccione Paciente</option>
                        {patients.map((p: any) => <option key={p._id} value={p._id}>{p.lastName}, {p.firstName}</option>)}
                      </select>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input placeholder="Acc. #" value={newOrder.accessionNumber || ''} onChange={e => setNewOrder({ ...newOrder, accessionNumber: e.target.value })} className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors" />
                        <select required value={newOrder.modality || ''} onChange={e => setNewOrder({ ...newOrder, modality: e.target.value })} className="p-3 rounded-lg bg-black border border-secondary-dark text-white font-bold focus:border-primary-light outline-none transition-colors">
                          <option value="">Modalidad</option>
                          {modalities.map((m: any) => <option key={m._id} value={m.dicom_code}>{m.dicom_code} - {m.name}</option>)}
                        </select>
                      </div>

                      <select value={newOrder.referringPhysician || ''} onChange={e => setNewOrder({ ...newOrder, referringPhysician: e.target.value })} className="p-3 rounded-lg bg-black border border-secondary-dark text-white font-bold focus:border-primary-light outline-none transition-colors">
                        <option value="">Asignar a Médico (Opcional)</option>
                        {medicalUsers.map((m: any) => <option key={m._id} value={m.nombre}>{m.nombre} ({m.role})</option>)}
                      </select>

                      {user?.role === 'admin' && (
                        <select
                          required
                          value={newOrder.branch || ''}
                          onChange={e => setNewOrder({ ...newOrder, branch: e.target.value })}
                          className="p-3 rounded-lg bg-black border border-secondary-dark text-white font-bold focus:border-primary-light outline-none transition-colors"
                        >
                          <option value="">Seleccionar Sucursal (Obligatorio para Admin)</option>
                          {branches.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                      )}

                      <input placeholder="Descripción (Opcional)" value={newOrder.procedureDescription || ''} onChange={e => setNewOrder({ ...newOrder, procedureDescription: e.target.value })} className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors" />

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Fecha y Hora</label>
                        <input required type="datetime-local" value={newOrder.scheduledDate ? toLocalISOString(new Date(newOrder.scheduledDate)) : ''} onChange={e => setNewOrder({ ...newOrder, scheduledDate: e.target.value })} className="p-3 rounded-lg bg-black border border-secondary-dark text-white font-sans tracking-wide focus:border-primary-light outline-none transition-colors" />
                      </div>

                      <div className="flex gap-3 mt-4 pt-4 border-t border-secondary-dark">
                        <button type="button" onClick={() => { setIsModalOpen(false); handleCancelEdit(); }} className="flex-1 bg-black border border-gray-600 text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">CANCELAR</button>
                        <button type="submit" className="flex-1 bg-primary-light text-black py-3 rounded-lg font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                          ACTUALIZAR
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
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
                    isModal={true}
                    onCancelModal={() => setIsModalOpen(false)}
                  />
                )}
              </div>

              {/* Right Column: Scheduled Appointments (30%) */}
              <div className="w-full lg:w-[30%] bg-black/40 rounded-xl p-4 border border-secondary-dark flex flex-col overflow-visible lg:overflow-hidden min-h-0">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 pl-1 tracking-wider border-b border-secondary-dark pb-2">
                  Citas en este horario:
                </h3>
                <div className="flex-1 overflow-visible lg:overflow-y-auto pr-0 lg:pr-2 flex flex-col gap-2 min-h-0">
                  {orders.filter((o: any) => {
                    if (!o.scheduledDate || !selectedSlot) return false;
                    const d = new Date(o.scheduledDate);
                    // 20 min intervals comparison
                    const slotEnd = new Date(selectedSlot);
                    slotEnd.setMinutes(slotEnd.getMinutes() + 19, 59, 999);
                    return d >= selectedSlot && d <= slotEnd;
                  }).map((order: any) => {
                    const oModStyles = getModalityStyles(order.modality);
                    return (
                      <div key={order._id} className={`text-sm bg-black/60 p-3 rounded-lg border-l-4 ${oModStyles.side} flex justify-between items-center group shadow-sm hover:bg-black/90 transition-all border border-secondary-dark/30`}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-white text-xs">{order.patient?.lastName}, {order.patient?.firstName}</span>
                          <span className={`text-[10px] ${oModStyles.plainText} uppercase font-bold tracking-wider`}>
                            {order.modality} {order.company ? `| ${order.company}` : ''}
                          </span>
                        </div>
                        <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => { handleEdit('order', order); setIsModalOpen(true); }} className={`text-[10px] ${oModStyles.plainText} hover:text-white uppercase font-bold transition-colors`}>Editar</button>
                          <button type="button" onClick={() => handleDelete('order', order._id)} className="text-[10px] text-red-500 hover:text-red-400 uppercase font-bold transition-colors">Quitar</button>
                        </div>
                      </div>
                    );
                  })}
                  {orders.filter((o: any) => {
                    if (!o.scheduledDate || !selectedSlot) return false;
                    const d = new Date(o.scheduledDate);
                    const slotEnd = new Date(selectedSlot);
                    slotEnd.setMinutes(slotEnd.getMinutes() + 19, 59, 999);
                    return d >= selectedSlot && d <= slotEnd;
                  }).length === 0 && (
                    <div className="text-xs text-gray-500 italic text-center py-8 bg-black/20 border border-dashed border-secondary-dark/30 rounded-lg">
                      No hay citas en este rango de tiempo.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
