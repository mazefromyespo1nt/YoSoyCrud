import React, { useState, useEffect } from 'react';
import { generarUUID } from './generadorUUID';
import config from '../config.json';

interface LanguageSelectionProps {
  sessionUUID: string | null;
  show: boolean;
  onClose: () => void;
  tableName: string;  // <-- Agregar
  columns: any[];  
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ sessionUUID, onClose, show }) => {
  const [language, setLanguage] = useState<string | null>(null);
  const [architecture, setArchitecture] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [columns, setColumns] = useState<any[]>([]);
  const [tableName, setTableName] = useState<string>('');
             
  useEffect(() => {
    if (show) {
        fetchTableData();  // Cargar los datos al mostrar el modal
    }
}, [show]);


  useEffect(() => {
    if (show) {
      setLanguage(null);
      setArchitecture(null);
      setShowSaveModal(false);
    }
  }, [show]);

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    setArchitecture(null);
  };

  const fetchTableData = async () => {
    try {
        const response = await fetch('http://localhost/adminlte-dashboard/src/Component/CallerLenguage.php');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Respuesta del servidor:", data);
        
        // Actualizar el estado con los datos obtenidos
        setTableName(data.tableName);
        setColumns(data.columns);
    } catch (error) {
        console.error("Error al obtener datos de la tabla:", error);
    }
};




const callGenerateAngularCrud = async () => {
  console.log("tableName:", tableName);
  console.log("columns:", columns);

  if (!tableName || columns.length === 0) {
      console.error("Error: tableName o columns están vacíos.");
      return;
  }

  try {
      const response = await fetch("http://localhost/adminlte-dashboard/src/Component/generateAngularCrud.php", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
          },
          body: JSON.stringify({ tableName, columns }),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Respuesta de la API:", result);
  } catch (error) {
      console.error("Error al llamar a la API:", error);
  }
};



const handleArchitectureChange = async (selectedArchitecture: string) => {
  setArchitecture(selectedArchitecture);
  setShowSaveModal(true);

  console.log("Arquitectura seleccionada:", selectedArchitecture);
  console.log("Table Name antes de esperar:", tableName);
  console.log("Columns antes de esperar:", columns);

  // Esperar un momento para asegurar la carga de datos
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log("Table Name después de esperar:", tableName);
  console.log("Columns después de esperar:", columns);

  if (selectedArchitecture === 'API Rest') {
      callGenerateAngularCrud();
  }
};


  const handleSave = () => {
    if (sessionUUID && language && architecture) {
      localStorage.setItem(
        'projectConfig',
        JSON.stringify({ sessionUUID, language, architecture })
      );
      console.log(`Configuración guardada: UUID=${sessionUUID}, Lenguaje=${language}, Arquitectura=${architecture}`);
      alert(`Configuración guardada: ${language} - ${architecture}`);
      onClose();
    } else {
      console.error('No se pudo guardar la configuración. Verifica los valores.');
    }
  };

  const handleCancel = () => {
    setArchitecture(null);
    setShowSaveModal(false);
  };

  if (!show) return null;

  return (
    <div>
      {!showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-language-architecture">
            <h2>Configura tu proyecto</h2>
            {!language && (
              <div className="language-selection">
                <button onClick={() => handleLanguageChange('Java')}>
                  <img src="/assets/java.svg" alt="Java Logo" />
                  Java
                </button>
                <button onClick={() => handleLanguageChange('PHP')}>
                  <img src="/assets/php_logo.svg" alt="PHP Logo" />
                  PHP
                </button>
                <button type="button" onClick={onClose} className="close">
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
            {language && !architecture && (
              <div className="architecture-selection">
                <h3>Selecciona la arquitectura para {language}</h3>
                {language === 'Java' && (
                  <>
                    <button onClick={() => handleArchitectureChange('MVC')} className="architecture-btn">MVC</button>
                    <button onClick={() => handleArchitectureChange('API Rest')} className="architecture-btn">API + Front</button>
                  </>
                )}
                {language === 'PHP' && (
                  <>
                    <button onClick={() => handleArchitectureChange('MVC')} className="architecture-btn">MVC</button>
                    <button onClick={() => handleArchitectureChange('Standalone')} className="architecture-btn">Standalone</button>
                  </>
                )}
                <button onClick={() => setLanguage(null)} className="btn btn-secondary back-button">
                  <i className="fas fa-arrow-left"></i> Regresar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {showSaveModal && (
        <>
          <div className="modal-backdrop fade show custom-backdrop"></div>
          <div className="modal fade show" style={{ display: 'block' }} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Guardar Configuración</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={handleCancel}></button>
                </div>
                <div className="modal-body">
                  <p>
                    ¿Estás seguro de que deseas guardar esta configuración?
                    <br />
                    <strong>Lenguaje:</strong> {language}
                    <br />
                    <strong>Arquitectura:</strong> {architecture}
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
                  <button type="button" className="btn btn-primary" onClick={handleSave}>Aceptar</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelection;
