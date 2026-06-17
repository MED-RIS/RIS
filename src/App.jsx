import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RisWorklistPanel from './RisWorklist/RisWorklist';
import LoginForm from './auth/Login';

// ➕ Importamos tus componentes del módulo de laboratorio
import RegistrarPaciente from './pages/RegistrarPacientes';
import RegistrarConsulta from './pages/RegistrarConsulta';

const ProtectedRoute = ({ children }) => {
  const localStr = localStorage.getItem('usuario');
  const session = localStr ? JSON.parse(localStr) : null;
  const authSessionStr = localStorage.getItem('authSession');
  const authSession = authSessionStr ? JSON.parse(authSessionStr) : null;

  if (!session || !session.token) {
    return <Navigate to="/login" replace />;
  }

  // Enforce session expiration check (24 hours)
  if (authSession && authSession.expiresAt && Date.now() > authSession.expiresAt) {
    localStorage.removeItem('usuario');
    localStorage.removeItem('authSession');
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const mockServicesManager = {};

const [pacienteDataCompartida, setPacienteDataCompartida] = React.useState(null);

  return (
    <div className="w-full h-screen bg-black">
      <Routes>
        {/* Ruta pública de acceso */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* ➕ PROCEDIMIENTO INTEGRADOR DE LABORATORIO (Rutas Protegidas) */}
        <Route 
          path="/laboratorio/registrar-paciente" 
          element={
            <ProtectedRoute>
              {/* Al terminar el Paso 1, evaluamos el Selector de Servicio (Principio P1) */}
              <RegistrarPaciente onSiguiente={(datosPaciente, servicioSeleccionado) => {
                if (servicioSeleccionado === 'imagenologia') {
                  alert("🗓️ Redireccionando al flujo de Agenda Horaria Fija de Imagenología...");
                  window.location.href = '/'; // Regresa al panel principal de Imagenología
                } else {
                  // Módulo de Laboratorio Clínico (Sin Agenda)
                  setPacienteDataCompartida(datosPaciente);
                  // Usamos la navegación nativa o redirección manual para mover el flujo
                  window.location.hash = '#/laboratorio/cargar-resultados';
                }
              }} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/laboratorio/cargar-resultados" 
          element={
            <ProtectedRoute>
              <RegistrarConsulta 
                pacienteData={pacienteDataCompartida || { nombres: "Ana Gabriela", paterno: "Chambi", cod: "7035539" }} // Fallback seguro para pruebas
                onVolver={() => { window.location.hash = '#/laboratorio/registrar-paciente'; }}
                onGuardarLocal={(nuevoDocumento) => {
                  console.log("Insertando en la arquitectura NoSQL del RIS:", nuevoDocumento);
                  window.location.href = '/'; // Al terminar, regresa a la cola del RIS
                }}
              />
            </ProtectedRoute>
          } 
        />

        {/* Ruta principal existente para Imagenología (Mantiene todo su comportamiento intacto) */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <RisWorklistPanel servicesManager={mockServicesManager} />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
