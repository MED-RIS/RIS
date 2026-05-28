import React, { useState, useEffect } from 'react';
import { toast } from '@ohif/ui-next';
import { GraduationCap, Eye, EyeOff, Tag, Search, BookMarked } from 'lucide-react';
import { fetchTeachingFiles, toggleTeachingFile } from '../risService';

export default function TeachingFileTab({ reports, navigate, appConfig }: any) {
  const [teachingFiles, setTeachingFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anonymized, setAnonymized] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKeywords, setEditKeywords] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const loadTeachingFiles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTeachingFiles();
      setTeachingFiles(data);
    } catch {
      // Fallback: filter local reports
      setTeachingFiles(reports.filter((r: any) => r.isTeachingFile));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadTeachingFiles(); }, []);

  const filtered = teachingFiles.filter((r: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const kw = (r.teachingKeywords || []).join(' ').toLowerCase();
    const notes = (r.teachingNotes || '').toLowerCase();
    const mod = (r.order?.modality || '').toLowerCase();
    const desc = (r.order?.procedureDescription || '').toLowerCase();
    return kw.includes(q) || notes.includes(q) || mod.includes(q) || desc.includes(q);
  });

  const handleSaveKeywords = async (reportId: string) => {
    try {
      await toggleTeachingFile(reportId, {
        isTeachingFile: true,
        teachingKeywords: editKeywords.split(',').map(k => k.trim()).filter(Boolean),
        teachingNotes: editNotes,
      });
      toast.success('Caso de docencia actualizado');
      setEditingId(null);
      loadTeachingFiles();
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  const handleRemoveFromTeaching = async (reportId: string) => {
    try {
      await toggleTeachingFile(reportId, { isTeachingFile: false });
      toast.success('Retirado de docencia');
      loadTeachingFiles();
    } catch (err) {
      toast.error('Error: ' + (err as any).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-amber-400" />
            Archivo de Casos de Docencia
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Estudios anonimizados para enseñanza, congresos e investigación</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAnonymized(!anonymized)}
            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${anonymized ? 'bg-purple-600/30 text-primary-light border-purple-500/50' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
          >
            {anonymized ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {anonymized ? 'Anonimizado' : 'Mostrar Nombres'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por keyword, modalidad, descripción..."
          className="w-full bg-black/60 border border-white/10 text-white rounded-full px-4 py-2.5 pl-10 text-sm focus:border-amber-400/70 outline-none transition-all placeholder:text-gray-500"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border bg-amber-900/40 border-amber-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400/70">Casos en Archivo</span>
          <span className="text-3xl font-black text-white">{teachingFiles.length}</span>
        </div>
        <div className="rounded-xl p-4 border bg-purple-900/40 border-purple-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-light/70">Keywords Únicos</span>
          <span className="text-3xl font-black text-white">
            {new Set(teachingFiles.flatMap((f: any) => f.teachingKeywords || [])).size}
          </span>
        </div>
        <div className="rounded-xl p-4 border bg-blue-900/40 border-blue-600/30 flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-main/70">Modalidades</span>
          <span className="text-3xl font-black text-white">
            {new Set(teachingFiles.map((f: any) => f.order?.modality).filter(Boolean)).size}
          </span>
        </div>
      </div>

      {/* Files List */}
      <div className="bg-plom-main border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <BookMarked className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Casos de Interés ({filtered.length})</h3>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No hay casos marcados para docencia.</p>
            <p className="text-xs mt-1">Use el botón "Guardar para Docencia" en la pestaña de Informes para agregar casos.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((r: any) => {
              const isEditing = editingId === r._id;
              return (
                <div key={r._id} className="p-4 hover:bg-white/[.02] transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Modality badge */}
                    <span className="px-2 py-1 rounded bg-primary-dark/30 text-primary-light text-xs font-sans tracking-wide border border-primary-light/20 flex-shrink-0">
                      {r.order?.modality || 'N/A'}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">
                        {anonymized ? 'Paciente Anónimo' : `${r.order?.patient?.lastName || '—'}, ${r.order?.patient?.firstName || ''}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.order?.procedureDescription || 'Sin descripción'} · {new Date(r.createdAt).toLocaleDateString('es')}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="flex gap-1 flex-wrap hidden md:flex">
                      {(r.teachingKeywords || []).map((kw: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-300 text-[10px] font-bold border border-amber-600/20">
                          <Tag className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />{kw}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {navigate && (
                        <button
                          onClick={() => navigate(`/viewer?StudyInstanceUIDs=${r.studyInstanceUid}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                        >
                          Ver
                        </button>
                      )}
                      <button
                        onClick={() => { setEditingId(isEditing ? null : r._id); setEditKeywords((r.teachingKeywords || []).join(', ')); setEditNotes(r.teachingNotes || ''); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
                      >
                        {isEditing ? 'Cancelar' : 'Editar'}
                      </button>
                      <button
                        onClick={() => handleRemoveFromTeaching(r._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                  {/* Editing Keywords & Notes */}
                  {isEditing && (
                    <div className="mt-3 ml-10 bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Keywords (separadas por coma)</label>
                        <input
                          type="text"
                          value={editKeywords}
                          onChange={e => setEditKeywords(e.target.value)}
                          placeholder="neumonía, tórax, hallazgo incidental"
                          className="w-full p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-amber-400/70 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Notas de Docencia</label>
                        <textarea
                          value={editNotes}
                          onChange={e => setEditNotes(e.target.value)}
                          rows={2}
                          placeholder="Descripción del caso, relevancia académica..."
                          className="w-full p-2.5 rounded-lg bg-black/60 border border-white/10 text-white text-sm focus:border-amber-400/70 outline-none resize-none"
                        />
                      </div>
                      <button
                        onClick={() => handleSaveKeywords(r._id)}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  )}

                  {/* Teaching Notes (non-editing) */}
                  {!isEditing && r.teachingNotes && (
                    <p className="mt-2 ml-10 text-xs text-gray-400 italic">{r.teachingNotes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
