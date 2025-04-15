import React, { useState } from 'react';

import configData from '../config.json'
const RemoteContent: React.FC = () => {
  
  const databaseUUID = localStorage.getItem('sessionUUID');
  // Función para crear una nueva tabla y reiniciar los formularios

  return (
  
      <div className="App">
              <iframe src={configData.server_generador+databaseUUID} width="100%" height="100%"></iframe>
      </div>


  );
};

export default RemoteContent;
