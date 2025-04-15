import React, { useState, useEffect } from 'react';
import '../estilos.css';
import config from '../config.json'; // importar el archivo de configuración
import LanguageSelection from './LanguageSelection'; // importar el componente de selección de lenguaje
import { generarUUID } from '../Component/generadorUUID'; // importar la función para generar UUID

const TablesCreated: React.FC = () => {

  const [isLoading, setIsLoading] = useState(false); //estado para el spinner
  const [foreignTables, setForeignTables] = useState<string[]>([]); // Para las tablas relacionadas
  const [sessionUUID, setSessionUUID] = useState<string | null>(localStorage.getItem('sessionUUID'));

  //console.log("Session UUID antes de enviar:", sessionUUID);


  useEffect(() => {
    if (!sessionUUID) {
      const newUUID = generarUUID();
      localStorage.setItem('sessionUUID', newUUID);
      setSessionUUID(newUUID);
      console.log("Nuevo UUID generado:", newUUID);
    }
  }, [sessionUUID]); // Se ejecuta cuando sessionUUID cambia


  useEffect(() => {
    setIsLoading(true);
    
    const requestData = {
      action: 'listTables',
      databaseName: sessionUUID
    };
  
    console.log("Enviando solicitud a:", config.SERVER_URL_TABLES);
    console.log("Cuerpo de la solicitud:", JSON.stringify(requestData));
    
  
    fetch(`${config.SERVER_URL_TABLES}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })
      .then(async (response) => {
        const text = await response.text();
        console.log("Respuesta del servidor (cruda):", text);
  
        try {
          return JSON.parse(text);
        } catch (error) {
          throw new Error("La respuesta no es JSON válido");
        }
      })
      .then((data) => {
        setForeignTables(data.tables || []);
        setIsLoading(false);
        console.log("Datos procesados:", data);
      })
      .catch((error) => {
        console.error('Error al obtener tablas:', error);
        setIsLoading(false);
      });
  }, []);
  




  return (
    <div className='tableslist'>
      <hr></hr>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tablas creadas</h3>
        </div>
        <div className="card-body">
          {isLoading && <div className="spinner">Cargando...</div>}
          <ul className="list-group">

          {foreignTables.map((row, index) => (
  <li key={index} className="list-group-item">
    {row} <span className='deleteTable'><i className="fas fa-window-close"></i>Eliminar</span>
  </li>
))}


          </ul>
        </div>
      </div>

    </div>
  );
};

export default TablesCreated;
