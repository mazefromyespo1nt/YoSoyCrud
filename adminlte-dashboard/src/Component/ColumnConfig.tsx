import React, { useState, useEffect } from 'react';
import config from '../config.json'; // Importamos la configuración

interface ColumnConfigProps {
  index: number;
  column: any;
  handleColumnChange: (index: number, key: string, value: any) => void;
  foreignTables: string[];
}

const ColumnConfig: React.FC<ColumnConfigProps> = ({
  index,
  column,
  handleColumnChange,
  foreignTables,
}) => {
  const [hasError, setHasError] = useState(false);
  const [foreignColumns, setForeignColumns] = useState<string[]>([]);
  const [showForeignOptions, setShowForeignOptions] = useState(false);

  useEffect(() => {
    setHasError(!column.name);
  }, [column.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHasError(!newValue);
    handleColumnChange(index, 'name', newValue);
  };

  const handleRelatedTableChange = (selectedTable: string) => {
    handleColumnChange(index, 'relatedTable', selectedTable);
    if (selectedTable) {
      fetch(`${config.SERVER_URL_TABLES}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'listColumns',
          databaseName: localStorage.getItem('sessionUUID'),
          tableName: selectedTable,
        }),
      })
        .then((response) => response.json())
        .then((data) => setForeignColumns(data.columns || []))
        .catch((error) => console.error('Error al obtener columnas:', error));
    } else {
      setForeignColumns([]);
    }
  };

  const dataTypes = ['Texto', 'Número', 'Fecha', 'Fecha y Hora'];
  const deleteUpdateOptions = ['RESTRICT', 'CASCADE', 'SET NULL'];

  useEffect(() => {
    if (!showForeignOptions) {
      handleColumnChange(index, 'onDelete', '');
      handleColumnChange(index, 'onUpdate', '');
    }
  }, [showForeignOptions]);

  return (
    <div className="row mb-4">
      <div className="col-md-3">
        <input
          type="text"
          className={`form-control ${hasError ? 'is-invalid' : ''}`}
          placeholder="Nombre de la columna"
          value={column.name}
          onChange={handleNameChange}
        />
        {hasError && <div className="invalid-feedback">Por favor, ingrese un nombre para la columna.</div>}
      </div>

      <div className="col-md-3">
        <select
          className="form-control"
          value={column.type}
          onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
        >
          {dataTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-6">
        <div className="d-flex justify-content-around align-items-center">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={column.isNullable}
              onChange={(e) => handleColumnChange(index, 'isNullable', e.target.checked)}
            />
            <label className="form-check-label">Nulo</label>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={column.isPrimaryKey}
              onChange={(e) => handleColumnChange(index, 'isPrimaryKey', e.target.checked)}
            />
            <label className="form-check-label">Llave Primaria</label>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={column.isUnique}
              onChange={(e) => handleColumnChange(index, 'isUnique', e.target.checked)}
            />
            <label className="form-check-label">Índice Único</label>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={column.isForeignKey}
              onChange={(e) => handleColumnChange(index, 'isForeignKey', e.target.checked)}
            />
            <label className="form-check-label">Llave Foránea</label>
          </div>
        </div>
      </div>

      {column.isForeignKey && (
        <>
          <div className="col-md-6 mt-3">
            <select
              className="form-control"
              value={column.relatedTable}
              onChange={(e) => handleRelatedTableChange(e.target.value)}
            >
              <option value="">Selecciona la tabla relacionada</option>
              {foreignTables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mt-3">
            <select
              className="form-control"
              value={column.relatedColumn}
              onChange={(e) => handleColumnChange(index, 'relatedColumn', e.target.value)}
            >
              <option value="">Selecciona la columna relacionada</option>
              {foreignColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-12 mt-3">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={showForeignOptions}
                onChange={(e) => setShowForeignOptions(e.target.checked)}
              />
              <label className="form-check-label">Configurar Llave Foránea</label>
            </div>
          </div>

          {showForeignOptions && (
            <>
              <div className="col-md-3 mt-3">
                <label>ON DELETE</label>
                <select
                  className="form-control"
                  value={column.onDelete}
                  onChange={(e) => handleColumnChange(index, 'onDelete', e.target.value)}
                >
                  {deleteUpdateOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 mt-3">
                <label>ON UPDATE</label>
                <select
                  className="form-control"
                  value={column.onUpdate}
                  onChange={(e) => handleColumnChange(index, 'onUpdate', e.target.value)}
                >
                  {deleteUpdateOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ColumnConfig;
