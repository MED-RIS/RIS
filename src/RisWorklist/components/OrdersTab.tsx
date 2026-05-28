import React, { useState } from 'react';
import RisUploadDocuments from './RisUploadDocuments';
import { updateOrder } from '../risService';
import { toast } from '@ohif/ui-next';

export default function OrdersTab({
  isLoading,
  orders,
  fuzzySearch,
  paginate,
  handleStatusChange,
  handleEdit,
  handleDelete,
  loadAll,
  reports = [],
  PaginationControls,
  openPatientProfile
}: any) {
  const [paymentModalOrder, setPaymentModalOrder] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = React.useMemo(() => {
    let sortableItems = [...orders.filter(fuzzySearch)];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'patientName') {
          aValue = `${a.patient?.lastName || ''} ${a.patient?.firstName || ''}`.trim().toLowerCase();
          bValue = `${b.patient?.lastName || ''} ${b.patient?.firstName || ''}`.trim().toLowerCase();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [orders, fuzzySearch, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return <span className="text-gray-500 opacity-50">↕</span>;
  };

  const getOrderReport = (orderId: string) => {
    return reports.find((r: any) => r.order?._id === orderId || r.order === orderId);
  };

  const onStatusClick = (order: any, newStatus: string) => {
    // If advancing to ARRIVED or beyond and it's not paid yet
    const isAdvancing = ['ARRIVED', 'IN_PROGRESS', 'COMPLETED'].includes(newStatus);
    // Auto-open billing modal if they advance and payment is not PAID or WAIVED
    if (isAdvancing && order.paymentStatus !== 'PAID' && order.paymentStatus !== 'WAIVED') {
      setPaymentAmount(order.totalAmount ? String(order.totalAmount) : '');
      setPaymentMethod(order.paymentMethod || 'CASH');
      setPaymentModalOrder({ ...order, nextStatus: newStatus });
    } else {
      handleStatusChange(order._id, newStatus);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalOrder) return;
    try {
      // Update order with payment info
      await updateOrder(paymentModalOrder._id, {
        paymentStatus: 'PAID',
        paymentMethod,
        totalAmount: parseFloat(paymentAmount) || 0,
        status: paymentModalOrder.nextStatus
      });
      toast.success(`Pago registrado y estado cambiado a ${paymentModalOrder.nextStatus}`);
      setPaymentModalOrder(null);
      loadAll();
    } catch (err) {
      toast.error('Error al registrar pago: ' + (err as any).message);
    }
  };

  const closePaymentModal = () => {
    // Allow advancing WITHOUT paying
    if (paymentModalOrder) {
      handleStatusChange(paymentModalOrder._id, paymentModalOrder.nextStatus);
    }
    setPaymentModalOrder(null);
  };

  return (
    <div className="bg-primary-main rounded-lg shadow-sm border border-secondary-dark p-4 relative">
      {/* Payment Modal Overlay */}
      {paymentModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-plom-main border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-2">Cobro Pendiente</h2>
            <p className="text-sm text-gray-400 mb-6">Parece que <b>{paymentModalOrder.patient?.firstName} {paymentModalOrder.patient?.lastName}</b> no ha pagado su estudio. ¿Desea registrar el pago antes de pasarlo a sala?</p>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monto Total a Cobrar ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400">$</span>
                  <input required type="number" step="0.01" min="0" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full pl-8 p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-green-400/70 outline-none text-lg font-sans tracking-wide font-bold" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Método de Pago</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-3 rounded-lg bg-black/60 border border-white/10 text-white focus:border-green-400/70 outline-none">
                  <option value="CASH">Efectivo</option>
                  <option value="CARD">Tarjeta de Crédito/Débito</option>
                  <option value="TRANSFER">Transferencia / Depósito</option>
                  <option value="INSURANCE">Seguro Médico</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 mt-4 border-t border-white/10">
                <button type="button" onClick={closePaymentModal} className="flex-1 px-4 py-3 bg-black/40 border border-white/10 text-gray-400 rounded-lg hover:text-white transition-colors text-xs font-bold uppercase">
                  Cobrar Después
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-green-600/30 border border-green-500/50 text-green-300 rounded-lg hover:bg-green-600/50 hover:text-white transition-colors text-xs font-bold uppercase shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  Registrar Pago ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto relative">
        <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary-dark text-white">
              <tr>
                <th className="p-3 font-semibold rounded-tl-lg cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('accessionNumber')}>Accession # <span className="ml-1 text-[10px]">{getSortIcon('accessionNumber')}</span></th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('patientName')}>Paciente <span className="ml-1 text-[10px]">{getSortIcon('patientName')}</span></th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('modality')}>Modalidad <span className="ml-1 text-[10px]">{getSortIcon('modality')}</span></th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('procedureDescription')}>Descripción <span className="ml-1 text-[10px]">{getSortIcon('procedureDescription')}</span></th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('scheduledDate')}>Programado <span className="ml-1 text-[10px]">{getSortIcon('scheduledDate')}</span></th>
                <th className="p-3 font-semibold cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('referringPhysician')}>Médico <span className="ml-1 text-[10px]">{getSortIcon('referringPhysician')}</span></th>
                <th className="p-3 font-semibold text-center cursor-pointer select-none hover:bg-black/20" onClick={() => requestSort('status')}>Estado <span className="ml-1 text-[10px]">{getSortIcon('status')}</span></th>
                <th className="p-3 font-semibold text-center">Informe</th>
                <th className="p-3 font-semibold text-right rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
          <tbody className={`divide-y divide-secondary-dark transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isLoading && sortedOrders.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-6 text-primary-light">Cargando...</td></tr>
            ) : sortedOrders.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-6 text-primary-light">No hay órdenes que coincidan con la búsqueda.</td></tr>
              ) : paginate(sortedOrders).map((order: any) => (
                <tr key={order._id} className="hover:bg-primary-dark transition-colors">
                  <td className="p-3 font-medium text-primary-light">{order.accessionNumber}</td>
                  <td className="p-3">
                    <button
                      onClick={() => openPatientProfile?.(order.patient)}
                      className="text-primary-light hover:text-white font-bold hover:underline transition-colors text-left"
                      title="Ver Perfil del Paciente"
                    >
                      {order.patient?.firstName} {order.patient?.lastName}
                    </button>
                  </td>
                  <td className="p-3"><span className="px-2 py-1 bg-secondary-dark rounded text-xs font-bold">{order.modality}</span></td>
                  <td className="p-3 whitespace-normal max-w-[200px] sm:max-w-xs break-words text-xs leading-tight text-gray-300">{order.procedureDescription || '-'}</td>
                  <td className="p-3">{new Date(order.scheduledDate).toLocaleString('es-419')}</td>
                  <td className="p-3 text-gray-300">{order.referringPhysician || '-'}</td>
                  <td className="p-3">
                    {order.status === 'CANCELED' ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-red-900/50 text-red-400 border border-red-500/50 rounded-full text-[10px] font-bold uppercase tracking-wider">CANCELADO</span>
                        <button onClick={() => onStatusClick(order, 'SCHEDULED')} className="text-gray-500 hover:text-white text-[10px] underline">Restaurar</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {[
                          { id: 'SCHEDULED', label: 'Agendado', color: 'bg-gray-600', activeRing: 'ring-gray-400' },
                          { id: 'ARRIVED', label: 'Llegó', color: 'bg-blue-600', activeRing: 'ring-blue-400' },
                          { id: 'IN_PROGRESS', label: 'En Equipo', color: 'bg-yellow-600', activeRing: 'ring-yellow-400' },
                          { id: 'COMPLETED', label: 'Terminado', color: 'bg-green-600', activeRing: 'ring-green-400' }
                        ].map((status, index, arr) => {
                          const currentIndex = arr.findIndex(s => s.id === (order.status || 'SCHEDULED'));
                          const isPastOrCurrent = index <= currentIndex;
                          const isCurrent = index === currentIndex;

                          return (
                            <React.Fragment key={status.id}>
                              <button
                                onClick={() => onStatusClick(order, status.id)}
                                title={status.label}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all border relative group ${isPastOrCurrent ? `${status.color} border-transparent text-white shadow-sm` : 'bg-black/40 border-gray-600 text-gray-500 hover:border-gray-400 hover:text-gray-300'} ${isCurrent ? `ring-2 ${status.activeRing} ring-offset-2 ring-offset-black scale-110 z-10` : ''}`}
                              >
                                {isPastOrCurrent && !isCurrent ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                  status.label.charAt(0)
                                )}
                                {/* Tooltip */}
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 border border-gray-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                  {status.label}
                                </span>
                              </button>
                              {/* Connector Line */}
                              {index < arr.length - 1 && (
                                <div className={`h-[2px] w-4 rounded-full ${index < currentIndex ? 'bg-primary-light/50' : 'bg-gray-700'}`}></div>
                              )}
                            </React.Fragment>
                          );
                        })}
                        <button
                          onClick={() => onStatusClick(order, 'CANCELED')}
                          title="Cancelar Cita"
                          className="ml-2 text-gray-600 hover:text-red-500 transition-colors p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {getOrderReport(order._id) ? (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border w-max ${getOrderReport(order._id).status === 'SIGNED' ? 'bg-green-900/50 text-green-300 border-green-600/40' : 'bg-yellow-900/50 text-yellow-300 border-yellow-600/40'}`}>
                          {getOrderReport(order._id).status === 'SIGNED' ? '✓ FIRMADO' : '✎ BORRADOR'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] font-bold border bg-gray-900/50 text-gray-400 border-gray-600/40 w-max">
                          SIN INFORMAR
                        </span>
                      )}
                      <RisUploadDocuments
                        patientName={`${order.patient?.lastName || ''} ${order.patient?.firstName || ''}`.trim()}
                        studyInstanceUid={order.studyInstanceUid}
                        orderId={order._id}
                        onSuccess={loadAll}
                        variant="icon"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleEdit('order', order)} className="text-primary-light hover:text-white mr-3">Editar</button>
                    <button onClick={() => handleDelete('order', order._id)} className="text-red-500 hover:text-red-400">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
      {!isLoading && <PaginationControls totalItems={sortedOrders.length} />}
    </div>
  );
}
