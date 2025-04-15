import React, { useState, useEffect } from 'react';
import CreateTableForm from './CreateTableForm';
import ColumnConfig from './ColumnConfig';
import config from '../config.json';
import LanguageSelection from './LanguageSelection'; // Importamos el componente de modales
import  TablesCreated from '../Component/TablesCreated';

const Sqlcontent: React.FC = () => {
  const [tableName, setTableName] = useState('');
  const [columnCount, setColumnCount] = useState(1);
  const [columns, setColumns] = useState<any[]>([]);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [formFilled, setFormFilled] = useState(false);
  const [foreignTables, setForeignTables] = useState<string[]>([]); // Para las tablas relacionadas
  const [showModals, setShowModals] = useState(false); // Control para los modales
  const [sessionUUID, setSessionUUID] = useState<string | null>(localStorage.getItem('sessionUUID'));

  const handleCreateTable = () => {
    const newColumns = Array.from({ length: columnCount }, () => ({
      name: '',
      type: 'Texto',
      isNullable: false,
      isPrimaryKey: false,
      isUnique: false,
      isForeignKey: false,
      relatedTable: '',
      relatedColumn: '',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    }));
    setColumns(newColumns);
    setShowColumnConfig(true);

    // Cargar las tablas para llaves foráneas
    fetch(`${config.SERVER_URL_TABLES}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'listTables', databaseName: sessionUUID }),
    })
      .then((response) => response.json())
      .then((data) => setForeignTables(data.tables))
      .catch((error) => console.error('Error al obtener tablas:', error));
  };

  const handleColumnChange = (index: number, key: string, value: any) => {
    const updatedColumns = [...columns];
    updatedColumns[index][key] = value;
    setColumns(updatedColumns);

    // Verificar si el formulario está configurado
    const isFormFilled = updatedColumns.some((col) => col.name || col.type !== 'Texto' || col.isNullable);
    setFormFilled(isFormFilled);
  };

  const addNewColumn = () => {
    const newColumn = {
      name: '',
      type: 'Texto',
      isNullable: false,
      isPrimaryKey: false,
      isUnique: false,
      isForeignKey: false,
      relatedTable: '',
      relatedColumn: '',
      onDelete: 'RESTRICT',
      onUpdate: 'RESTRICT',
    };
    setColumns([...columns, newColumn]);
  };

  const removeLastColumn = () => {
    if (columns.length > 0) {
      setColumns(columns.slice(0, -1));
    }
  };

  const generateSQL = () => {
    if (!tableName || columns.length === 0) {
      alert('Por favor, ingrese un nombre de tabla y al menos una columna.');
      return null;
    }

    let sql = `CREATE TABLE ${tableName} (`;
    const columnNamesSet = new Set();
    const foreignKeys: string[] = [];

    columns.forEach((col, idx) => {
      if (columnNamesSet.has(col.name)) {
        alert(`Error: La columna "${col.name}" está duplicada.`);
        return null;
      }

      columnNamesSet.add(col.name);
      let sqlType = '';

      switch (col.type) {
        case 'Texto':
          sqlType = 'VARCHAR(255)';
          break;
        case 'Número':
          sqlType = 'INT';
          break;
        case 'Fecha':
          sqlType = 'DATE';
          break;
        case 'Fecha y Hora':
          sqlType = 'DATETIME';
          break;
        default:
          sqlType = 'VARCHAR(255)';
      }

      sql += `${col.name} ${sqlType}`;
      if (!col.isNullable) {
        sql += ' NOT NULL';
      }

      if (col.isPrimaryKey) {
        sql += ' PRIMARY KEY';
      }

      if (col.isUnique) {
        sql += ' UNIQUE';
      }

      if (col.isForeignKey) {
        let foreignKeyClause = `FOREIGN KEY (${col.name}) REFERENCES ${col.relatedTable}(${col.relatedColumn})`;

        if (col.onDelete && col.onDelete !== 'RESTRICT') {
          foreignKeyClause += ` ON DELETE ${col.onDelete}`;
        }

        if (col.onUpdate && col.onUpdate !== 'RESTRICT') {
          foreignKeyClause += ` ON UPDATE ${col.onUpdate}`;
        }

        foreignKeys.push(foreignKeyClause);
      }

      if (idx < columns.length - 1) {
        sql += ', ';
      }
    });

    if (foreignKeys.length > 0) {
      sql += ', ' + foreignKeys.join(', ');
    }

    sql += ');';

    console.log(`Sentencia SQL generada: ${sql}`);
    return sql;
  };

  const handleSubmit = async () => {
    const sql = generateSQL();
    if (!sql) return;

    const databaseUUID = sessionUUID;
    if (!databaseUUID) {
      alert('Error: No se encontró el UUID de la base de datos.');
      return;
    }

    try {
      const response = await fetch(`${config.SERVER_URL_TABLES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          databaseName: databaseUUID,
          sqlQuery: sql,
        }),
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        alert('Tabla creada con éxito.');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error al ejecutar la sentencia.');
    }
  };

  const handleNext = () => {
    setShowModals(true); // Mostrar los modales de selección de lenguaje y arquitectura
  };

  const handleModalsClose = () => {
    setShowModals(false); // Cerrar los modales
  };

  const handleNewTable = () => {
    setTableName('');
    setColumnCount(1);
    setColumns([]);
    setShowColumnConfig(false);
    setFormFilled(false);
  };

  return (
    <div>
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Crear nueva tabla</h3>
      </div>
      <div className="card-body">
        {!showColumnConfig && (
          <CreateTableForm
            tableName={tableName}
            columnCount={columnCount}
            setTableName={setTableName}
            setColumnCount={setColumnCount}
            handleCreateTable={handleCreateTable}
          />
        )}

        {showColumnConfig && (
          <div className="mt-4">
            <h4>Configurar columnas</h4>
            <form>
              {columns.map((col, index) => (
                <ColumnConfig
                  key={index}
                  index={index}
                  column={col}
                  handleColumnChange={handleColumnChange}
                  foreignTables={foreignTables}
                />
              ))}

              <button type="button" className="btn btn-success mt-3 me-3" onClick={addNewColumn}>
                Agregar nueva columna
              </button>
              <button type="button" className="btn btn-danger mt-3 me-3" onClick={removeLastColumn}>
                Quitar última columna
              </button>
              <button type="button" className="btn btn-primary mt-3 me-3" onClick={handleSubmit}>
                Crear Tabla
              </button>
              <button type="button" className="btn btn-warning mt-3 me-3" onClick={handleNewTable}>
                Volver
              </button>
              <button type="button" className="btn btn-secondary mt-3 ms-3" onClick={handleNext}>
                Siguiente
              </button>
            </form>
          </div>
        )}
      </div>
      
      {/* Modales de selección de lenguaje y arquitectura */}
      <LanguageSelection 
  sessionUUID={sessionUUID} 
  show={showModals} 
  onClose={handleModalsClose} 
  tableName={tableName} 
  columns={columns} 
/>
      <TablesCreated></TablesCreated>
    
   
    </div>
    </div>
  );
};

export default Sqlcontent;
