import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from '@ohif/ui-next';
import { api } from '../../Users/user';
import { getAuthHeaders } from '../../utils/token';
import RisModal from './RisModal';
import {
  Upload,
  FileUp,
  File,
  FileText,
  Image as ImageIcon,
  X,
  Eye,
  Loader2,
  CloudUpload,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
} from 'lucide-react';

/* ── Helpers ──────────────────────────────────────────────────────────── */

const normalizePatientName = (rawName = '') =>
  rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\^,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const EXT_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-red-400" />,
  jpg: <ImageIcon className="w-4 h-4 text-primary-main" />,
  jpeg: <ImageIcon className="w-4 h-4 text-primary-main" />,
  png: <ImageIcon className="w-4 h-4 text-green-400" />,
  gif: <ImageIcon className="w-4 h-4 text-primary-light" />,
  doc: <FileText className="w-4 h-4 text-blue-500" />,
  docx: <FileText className="w-4 h-4 text-blue-500" />,
};

const getFileIcon = (ext: string) =>
  EXT_ICONS[ext] || <File className="w-4 h-4 text-gray-400" />;

const getFileIconLarge = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const icons: Record<string, React.ReactNode> = {
    pdf: <FileText className="w-5 h-5 text-red-400" />,
    jpg: <ImageIcon className="w-5 h-5 text-primary-main" />,
    jpeg: <ImageIcon className="w-5 h-5 text-primary-main" />,
    png: <ImageIcon className="w-5 h-5 text-green-400" />,
    gif: <ImageIcon className="w-5 h-5 text-primary-light" />,
    doc: <FileText className="w-5 h-5 text-blue-500" />,
    docx: <FileText className="w-5 h-5 text-blue-500" />,
  };
  return icons[ext] || <File className="w-5 h-5 text-gray-400" />;
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* ── Types ─────────────────────────────────────────────────────────────── */

interface UploadedFile {
  filename: string;
  ext: string;
  size?: number;
  uploadedAt?: string;
}

interface RisUploadDocumentsProps {
  patientName: string;
  studyInstanceUid?: string;
  orderId?: string;
  onSuccess?: () => void;
  variant?: 'button' | 'inline' | 'icon';
  label?: string;
}

/* ── Component ────────────────────────────────────────────────────────── */

export default function RisUploadDocuments({
  patientName,
  studyInstanceUid = '',
  orderId = '',
  onSuccess,
  variant = 'button',
  label = 'Subir Documento',
}: RisUploadDocumentsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalized = normalizePatientName(patientName);

  /* ── Fetch existing files when modal opens ─────────────────────── */

  const fetchFiles = useCallback(async () => {
    if (!normalized) return;
    setLoadingFiles(true);
    try {
      const res = await fetch(`${api}/api/subida/files/${encodeURIComponent(normalized)}`);
      if (res.ok) {
        const data = await res.json();
        setExistingFiles(data);
      } else {
        setExistingFiles([]);
      }
    } catch {
      setExistingFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }, [normalized]);

  useEffect(() => {
    if (isModalOpen) fetchFiles();
  }, [isModalOpen, fetchFiles]);

  // Clean up preview URL on unmount / file change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ── File selection ──────────────────────────────────────────────── */

  const handleFileSelect = useCallback(
    (file: File) => {
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    },
    [previewUrl]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  /* ── Drag & Drop ─────────────────────────────────────────────────── */

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  /* ── Upload logic ────────────────────────────────────────────────── */

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('Selecciona un archivo para subir');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('paciente', normalized);

      const res = await fetch(`${api}/api/subida/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const result = await res.json();

      // Sync with RIS reports — always create/update report for this order
      try {
        const headers = getAuthHeaders();
        const effectiveUid = studyInstanceUid || `UPLOAD-${orderId || Date.now()}`;
        await fetch(`${api}/api/ris/reports`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            studyInstanceUid: effectiveUid,
            orderId,
            status: 'SIGNED',
            contentHtml: '',
          }),
        });
      } catch (err) {
        console.error('[RIS Upload] Error syncing with RIS:', err);
      }

      toast.success(result.message || 'Documento subido exitosamente');
      clearFile();
      await fetchFiles(); // Refresh file list
      onSuccess?.();
    } catch (error: any) {
      toast.error('Error al subir: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  /* ── Delete a specific file ──────────────────────────────────────── */

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`¿Eliminar "${filename}"?`)) return;
    setDeletingFile(filename);
    try {
      const res = await fetch(
        `${api}/api/subida/files/${encodeURIComponent(filename)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Archivo eliminado');
      await fetchFiles();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeletingFile(null);
    }
  };

  /* ── Modal controls ──────────────────────────────────────────────── */

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    clearFile();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ── Render trigger ──────────────────────────────────────────────── */

  const renderTrigger = () => {
    // Badge for file count
    const badge =
      existingFiles.length > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary-light text-black text-[9px] font-bold flex items-center justify-center">
          {existingFiles.length}
        </span>
      ) : null;

    if (variant === 'icon') {
      return (
        <button
          onClick={handleOpen}
          className="relative p-2 rounded-lg bg-white/5 hover:bg-primary-light/20 border border-white/5 hover:border-primary-light/30 text-gray-400 hover:text-primary-light transition-all"
          title={label}
        >
          <CloudUpload className="w-4 h-4" />
          {badge}
        </button>
      );
    }

    if (variant === 'inline') {
      return (
        <button
          onClick={handleOpen}
          className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-black/40 border border-white/10 hover:border-primary-light/30 hover:bg-primary-light/10 text-gray-400 hover:text-primary-light transition-all text-xs font-bold uppercase tracking-wider"
        >
          <CloudUpload className="w-4 h-4" />
          {label}
          {existingFiles.length > 0 && (
            <span className="bg-primary-light/20 text-primary-light text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {existingFiles.length}
            </span>
          )}
        </button>
      );
    }

    return (
      <button
        onClick={handleOpen}
        className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-dark border border-secondary-dark hover:bg-primary-light hover:text-black text-white transition-all text-sm font-medium"
      >
        <Upload className="w-4 h-4" />
        {label}
        {badge}
      </button>
    );
  };

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {renderTrigger()}

      <RisModal
        isOpen={isModalOpen}
        onClose={handleClose}
        title="Documentos del Paciente"
        maxWidth="max-w-lg"
      >
        <div className="space-y-5">
          {/* Patient info bar */}
          <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-main to-secondary-main flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {patientName.split(' ')[0]?.charAt(0) || '?'}
              {patientName.split(' ').pop()?.charAt(0) || ''}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{patientName}</p>
              <p className="text-gray-500 text-[10px] font-sans tracking-wide truncate">
                {orderId ? `Orden: ${orderId.slice(-8)}` : 'Sin orden vinculada'}
              </p>
            </div>
          </div>

          {/* ── Existing Files List ───────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Archivos Subidos
                {existingFiles.length > 0 && (
                  <span className="ml-2 text-primary-light">({existingFiles.length})</span>
                )}
              </h4>
              <button
                onClick={fetchFiles}
                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
                title="Refrescar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingFiles ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
              </div>
            ) : existingFiles.length === 0 ? (
              <div className="bg-black/20 rounded-lg border border-white/5 p-4 text-center">
                <p className="text-gray-500 text-xs">No hay archivos subidos para este paciente.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {existingFiles.map((f) => (
                  <div
                    key={f.filename}
                    className="flex items-center gap-3 bg-black/30 rounded-lg px-3 py-2.5 border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    {/* File icon */}
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      {getFileIcon(f.ext)}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{f.filename}</p>
                      <p className="text-gray-500 text-[10px] font-sans tracking-wide">
                        {formatFileSize(f.size || 0)}
                        {f.uploadedAt && (
                          <span className="ml-2">
                            · {new Date(f.uploadedAt).toLocaleDateString('es-419')}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {/* View / Download */}
                      <a
                        href={`${api}/api/subida/files/download/${encodeURIComponent(f.filename)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-primary-light transition-colors"
                        title="Descargar"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(f.filename);
                        }}
                        disabled={deletingFile === f.filename}
                        className="p-1.5 rounded-md hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Eliminar"
                      >
                        {deletingFile === f.filename ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Upload Zone ───────────────────────────────────────── */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Subir Nuevo Archivo
            </h4>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? 'border-primary-light bg-primary-light/10 scale-[1.01]'
                  : selectedFile
                  ? 'border-green-500/30 bg-green-900/10'
                  : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleInputChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xlsx,.csv"
              />

              {!selectedFile ? (
                <div className="space-y-2">
                  <div
                    className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-colors ${
                      isDragOver
                        ? 'bg-primary-light/20 text-primary-light'
                        : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">
                      {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz click'}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      PDF, Imágenes, Word, Excel · Máx. 50MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Preview thumbnail */}
                  {previewUrl && selectedFile.type.startsWith('image/') ? (
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : previewUrl && selectedFile.type === 'application/pdf' ? (
                    <div className="w-14 h-14 rounded-lg bg-red-900/20 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-red-400" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {getFileIconLarge(selectedFile.name)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white font-bold text-sm truncate">{selectedFile.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Quitar archivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Replacement warning */}
            {existingFiles.length > 0 && selectedFile && (
              <div className="flex items-start gap-2 mt-2 bg-amber-900/15 border border-amber-500/15 rounded-lg p-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-400/80 text-[11px]">
                  Si el archivo tiene la misma extensión que uno existente, lo reemplazará.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-black border border-gray-600 text-gray-300 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors text-sm"
            >
              CERRAR
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all text-sm ${
                selectedFile && !isUploading
                  ? 'bg-primary-light text-black hover:bg-white shadow-[0_0_15px_rgba(94,203,255,0.15)]'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo…
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  SUBIR
                </>
              )}
            </button>
          </div>
        </div>
      </RisModal>
    </div>
  );
}
