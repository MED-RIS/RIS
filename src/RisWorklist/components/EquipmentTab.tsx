import React, { useState, useEffect } from 'react';
import RisModal from './RisModal';
import { probarConexionEquipo, probarTodosLosEquipos } from '../risService';

export default function EquipmentTab({
  equipmentList,
  fuzzySearch,
  paginate,
  isCreatingEquipment,
  setIsCreatingEquipment,
  isEditing,
  editingItem,
  handleCreateEquipment,
  handleUpdate,
  handleCancelEdit,
  handleEdit,
  handleDelete,
  newEquipment,
  setNewEquipment,
  PaginationControls,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** Resultado de la última prueba de conexión de cada equipo. */
  const [pruebas, setPruebas] = useState<Record<string, any>>({});
  const [probando, setProbando] = useState<string | null>(null);
  const [probandoTodos, setProbandoTodos] = useState(false);

  useEffect(() => {
    if (isEditing && editingItem?.type === 'equipment') setIsModalOpen(true);
  }, [isEditing, editingItem]);

  const probarUno = async (id: string) => {
    setProbando(id);
    try {
      const r = await probarConexionEquipo(id);
      setPruebas(prev => ({ ...prev, [id]: r }));
    } catch (e: any) {
      setPruebas(prev => ({ ...prev, [id]: { ok: false, message: e.message } }));
    } finally {
      setProbando(null);
    }
  };

  const probarTodos = async () => {
    setProbandoTodos(true);
    try {
      const r = await probarTodosLosEquipos();
      const nuevos: Record<string, any> = {};
      for (const eq of r.equipos || []) nuevos[eq.equipmentId] = eq;
      setPruebas(nuevos);
    } catch (e: any) {
      console.error(e);
    } finally {
      setProbandoTodos(false);
    }
  };

  /** Muestra el resultado con el motivo al pasar el mouse. */
  const renderPrueba = (id: string) => {
    const r = pruebas[id];
    if (probando === id) return <span className="text-[11px] text-gray-400">probando…</span>;
    if (!r) return null;

    return (
      <span
        className={`text-[11px] font-bold ${r.ok ? 'text-green-400' : 'text-red-400'}`}
        title={r.detail ? `${r.message}\n\n${r.detail}` : r.message}
      >
        {r.ok ? `✓ responde (${r.elapsedMs} ms)` : `✗ ${r.message}`}
      </span>
    );
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
    setIsCreatingEquipment(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCreatingEquipment(false);
    if (isEditing) handleCancelEdit();
  };

  const isEditingEquipment = isEditing && editingItem?.type === 'equipment';

  return (
    <div className="bg-primary-main rounded-lg border border-secondary-dark p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Equipos</h2>
        <div className="flex gap-2">
          <button
            onClick={probarTodos}
            disabled={probandoTodos}
            title="Hace un C-ECHO contra cada equipo activo para ver cuál responde"
            className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded text-sm hover:bg-primary-light hover:text-black transition-colors disabled:opacity-50"
          >
            {probandoTodos ? 'Probando…' : 'Probar todos'}
          </button>
          <button
            onClick={openCreateModal}
            className="bg-primary-dark border border-secondary-dark px-4 py-2 rounded text-sm hover:bg-primary-light hover:text-black transition-colors"
          >
            + Nuevo
          </button>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      <RisModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditingEquipment ? 'Editar Equipo' : 'Nuevo Equipo'}
      >
        <form
          onSubmit={(e) => {
            isEditingEquipment ? handleUpdate(e) : handleCreateEquipment(e);
            setIsModalOpen(false);
            setIsCreatingEquipment(false);
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            required
            placeholder="Nombre del Equipo"
            value={newEquipment.name || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors col-span-2"
          />
          <input
            placeholder="Fabricante"
            value={newEquipment.manufacturer || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            placeholder="Modelo"
            value={newEquipment.model || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
          />
          <input
            placeholder="Número de Serie (S/N)"
            value={newEquipment.serial_number || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, serial_number: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors col-span-2"
          />

          {/* ── Identidad DICOM en la red ─────────────────────────────
              Estos datos salen del DICOM Conformance Statement del equipo.
              Sin el AE Title correcto el equipo no encuentra su worklist. */}
          <div className="col-span-2 pt-4 mt-2 border-t border-secondary-dark">
            <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider">
              Conexión DICOM
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              Estos datos salen del DICOM Conformance Statement del equipo. Si el AE Title no
              coincide exactamente, el equipo muestra la worklist vacía sin dar ningún error.
            </p>
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 mb-1 font-bold">AE TITLE</label>
            <input
              placeholder="Ej. CT01"
              maxLength={16}
              value={newEquipment.aeTitle || ''}
              onChange={(e) =>
                setNewEquipment({ ...newEquipment, aeTitle: e.target.value.toUpperCase() })
              }
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors font-mono"
            />
            <p className="text-[10px] text-gray-600 mt-1">
              Máximo 16 caracteres. Distingue mayúsculas.
            </p>
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 mb-1 font-bold">MODALIDAD DICOM</label>
            <select
              value={newEquipment.modality || ''}
              onChange={(e) => setNewEquipment({ ...newEquipment, modality: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors"
            >
              <option value="">— Seleccionar —</option>
              <option value="CT">CT — Tomografía</option>
              <option value="DX">DX — Rayos X digital (detector directo)</option>
              <option value="CR">CR — Rayos X de placa computarizada</option>
              <option value="US">US — Ecografía</option>
              <option value="MR">MR — Resonancia</option>
              <option value="MG">MG — Mamografía</option>
            </select>
            <p className="text-[10px] text-gray-600 mt-1">
              Confirmar DX o CR según el equipo. No asumir.
            </p>
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 mb-1 font-bold">DIRECCIÓN IP</label>
            <input
              placeholder="Ej. 192.168.50.20"
              value={newEquipment.ipAddress || ''}
              onChange={(e) => setNewEquipment({ ...newEquipment, ipAddress: e.target.value })}
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-gray-400 mb-1 font-bold">PUERTO DICOM</label>
            <input
              type="number"
              placeholder="104"
              value={newEquipment.dicomPort ?? ''}
              onChange={(e) =>
                setNewEquipment({
                  ...newEquipment,
                  dicomPort: e.target.value === '' ? '' : Number(e.target.value),
                })
              }
              className="w-full p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors font-mono"
            />
          </div>

          <label className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-black border border-secondary-dark cursor-pointer hover:border-primary-light transition-colors">
            <input
              type="checkbox"
              checked={newEquipment.supportsMwl !== false}
              onChange={(e) => setNewEquipment({ ...newEquipment, supportsMwl: e.target.checked })}
              className="w-4 h-4 accent-[#00bfa5]"
            />
            <span className="text-xs text-gray-300">
              El equipo consulta la Worklist (Modality Worklist SCU)
              <span className="block text-[10px] text-gray-600">
                Desmarcar si el paciente se carga a mano en la consola.
              </span>
            </span>
          </label>

          <textarea
            placeholder="Notas del Conformance Statement: versión, particularidades, qué se probó…"
            rows={2}
            value={newEquipment.conformanceNotes || ''}
            onChange={(e) => setNewEquipment({ ...newEquipment, conformanceNotes: e.target.value })}
            className="p-3 rounded-lg bg-black border border-secondary-dark text-white focus:border-primary-light outline-none transition-colors col-span-2 resize-y"
          />

          <div className="col-span-2 flex gap-3 pt-4 border-t border-secondary-dark mt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 bg-black border border-gray-600 text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-light text-black py-3 rounded-lg font-bold hover:bg-white transition-colors"
            >
              {isEditingEquipment ? 'ACTUALIZAR' : 'GUARDAR'}
            </button>
          </div>
        </form>
      </RisModal>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary-dark">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">AE Title</th>
              <th className="p-3">Modalidad</th>
              <th className="p-3">Dirección DICOM</th>
              <th className="p-3 text-center">Worklist</th>
              <th className="p-3">Conexión</th>
              <th className="p-3">Fabricante</th>
              <th className="p-3">Modelo</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-dark">
            {equipmentList.filter(fuzzySearch).length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-primary-light">
                  No hay equipos que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              paginate(equipmentList.filter(fuzzySearch)).map((e: any) => (
                <tr key={e._id} className="hover:bg-primary-dark">
                  <td className="p-3">{e.name}</td>
                  <td className="p-3">
                    {e.aeTitle ? (
                      <span className="font-mono text-primary-light">{e.aeTitle}</span>
                    ) : (
                      <span
                        className="text-yellow-500 text-[11px]"
                        title="Sin AE Title el equipo no puede recibir la worklist"
                      >
                        ⚠ sin configurar
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {e.modality ? (
                      <span className="px-2 py-1 bg-secondary-dark rounded text-xs font-bold">
                        {e.modality}
                      </span>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs text-gray-300">
                    {e.ipAddress ? `${e.ipAddress}:${e.dicomPort || 104}` : '-'}
                  </td>
                  <td className="p-3 text-center">
                    {e.supportsMwl === false ? (
                      <span
                        className="text-gray-500 text-[11px]"
                        title="El paciente se carga a mano en la consola"
                      >
                        manual
                      </span>
                    ) : (
                      <span className="text-green-400 text-[11px]">sí</span>
                    )}
                  </td>
                  <td className="p-3 min-w-[190px]">{renderPrueba(e._id)}</td>
                  <td className="p-3 text-gray-300">{e.manufacturer}</td>
                  <td className="p-3 text-gray-300">{e.model}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => probarUno(e._id)}
                      disabled={probando === e._id}
                      title="Verifica por DICOM si el equipo responde (C-ECHO)"
                      className="text-primary-light hover:text-white mr-3 disabled:opacity-50"
                    >
                      Probar
                    </button>
                    <button
                      onClick={() => { handleEdit('equipment', e); setIsModalOpen(true); }}
                      className="text-primary-light hover:text-white mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete('equipment', e._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationControls totalItems={equipmentList.filter(fuzzySearch).length} />
    </div>
  );
}
