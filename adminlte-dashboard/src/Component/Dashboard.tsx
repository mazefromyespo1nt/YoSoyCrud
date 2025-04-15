import React, { useState, useEffect } from 'react';
import Consola from './Consola'; 
import Tutorial from './Tutorial';
import Sqlcontent from './Sqlcontent';
import RemoteContent from './RemoteContent';
import { generarUUID } from './generadorUUID';
import LoginModal from './Login';

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'terminal' | 'sql' | 'remote'>('dashboard');
  const [sessionUUID, setSessionUUID] = useState<string | null>(null);

  useEffect(() => {
    let storedUUID = localStorage.getItem('sessionUUID');
    if (!storedUUID) {
      storedUUID = generarUUID();
      localStorage.setItem('sessionUUID', storedUUID);
    }
    setSessionUUID(storedUUID);
    console.log(`UUID de la sesión: ${storedUUID}`);
  }, []);

  const regenerateUUID = () => {
    const currentUUID = localStorage.getItem('sessionUUID');
    const newUUID = generarUUID();
    
    if (currentUUID !== newUUID) {
      localStorage.setItem('sessionUUID', newUUID);
      setSessionUUID(newUUID);
      console.log(`Nuevo UUID generado manualmente: ${newUUID}`);
    } else {
      console.log('El UUID no ha cambiado, no se genera un nuevo UUID.');
    }
  };

  return (
    <div className="wrapper">
      {/* Barra lateral */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="/" className="brand-link">
          <span className="brand-text font-weight-light">AdminLTE</span>
        </a>
        <div className="sidebar">
          <nav className="mt-2">
            <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
              <li className="nav-item">
                <a href="#" className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveSection('dashboard')}>
                  <i className="nav-icon fas fa-chalkboard-teacher"></i>
                  <p>Tutorial</p>
                </a>
              </li>

              <li className="nav-item">
                <a href="#" className={`nav-link ${activeSection === 'terminal' ? 'active' : ''}`}
                  onClick={() => setActiveSection('terminal')}>
                  <i className="nav-icon fas fa-terminal"></i>
                  <p>Terminal</p>
                </a>
              </li>

              <li className="nav-item">
                <a href="#" className={`nav-link ${activeSection === 'sql' ? 'active' : ''}`}
                  onClick={() => setActiveSection('sql')}>
                  <i className="nav-icon fas fa-magic"></i>
                  <p>Form Wizard</p>
                </a>
              </li>

              <li className="nav-item">
                <a href="#" className={`nav-link ${activeSection === 'remote' ? 'active' : ''}`}
                  onClick={() => setActiveSection('remote')}>
                  <i className="nav-icon fas fa-server"></i>
                  <p>Remote Connection</p>
                </a>
              </li>
            <li className="nav-item">
              <a
                href="#"
                className="nav-link"
                onClick={() => {
                  const modalElement = document.getElementById('loginModal');
                  if (modalElement) {
                    const modal = new window.bootstrap.Modal(modalElement);
                    modal.show();
                  } else {
                    console.error("El modal con id 'loginModal' no fue encontrado en el DOM.");
                  }
                }}
              >
                <i className="nav-icon fas fa-download"></i>
                <p>Descargar Proyecto</p>
              </a>
            </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1>
                  {activeSection === 'dashboard' ? 'Tutorial' : activeSection === 'terminal' ? 'Terminal' : 'SQL'}
                </h1>
              </div>
            </div>
          </div>
        </section>

        <section className="content appcontenido">
          <div className="container-fluid">
            {activeSection === 'dashboard' && <Tutorial />}
            {activeSection === 'terminal' && <Consola />}
            {activeSection === 'sql' && <Sqlcontent />}
            {activeSection === 'remote' && <RemoteContent />}
          </div>
        </section>
      </div>

      {/* Importación del modal */}
      <LoginModal />
    </div>
  );
};

export default Dashboard;
