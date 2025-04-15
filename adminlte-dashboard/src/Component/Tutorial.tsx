import React from 'react';

const Tutorial: React.FC = () => {
  return (
    <><div className="row">

      <div className="col-4  arrow-container  arrowtuto">
        <i className="fas fa-arrow-left arrow-tutorial"></i>
        <span className="arrow-tutorial-text">Tutorial</span>
      </div>
      <div className="col-4"></div>
      <div className="col-4"></div>
    </div><div className="row">

        <div className="col-12 arrow-container arrowterminal">
          <i className="fas fa-arrow-left arrow-terminal"></i>
          <span className="arrow-terminal-text">En esta seccion pueder ejecutar tu codigo SQL directamente <b>solo admite sentencias CREATE TABLE</b>, puedes hacer un export de tus tablas </span>
        </div>

      </div>
      <div className="row">

        <div className="col-8 arrow-container arrowsql">
          <i className="fas fa-arrow-left arrow-sql"></i>
          <span className="arrow-sql-text"><b>¿Sin conocimiento en SQL?</b> Genera tus tablas usando un formulario sencillo</span>
        </div>
        <div className="col-4"></div>

      </div>
      <div className="row">

        <div className="col-8 arrow-container arrowremote">
          <i className="fas fa-arrow-left arrow-remote"></i>
          <span className="arrow-sql-text">Conexion remota a tu servidor, no adminte localhost, no almacenamos tu informacion</span>
        </div>
        <div className="col-4"></div>
      </div>
    </>
  );
};

export default Tutorial;
