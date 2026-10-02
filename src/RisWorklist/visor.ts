// Visor DICOM (MED Viewer, basado en OHIF) donde se abren los estudios del PACS.
// El link usa el mismo StudyInstanceUID que el RIS manda en la worklist y con el que
// el equipo guarda las imágenes. Cada instalación puede cambiarlo con VITE_VIEWER_URL.
const VIEWER_URL = (import.meta.env.VITE_VIEWER_URL || 'https://medviewer.corea.signa-engineering.com').replace(/\/+$/, '');

export const urlEstudio = (studyInstanceUid: string) =>
  `${VIEWER_URL}/viewer?StudyInstanceUIDs=${encodeURIComponent(studyInstanceUid)}`;
