import React, { useState } from 'react'; 

interface CreateTableFormProps {
  tableName: string;
  columnCount: number;
  setTableName: (name: string) => void;
  setColumnCount: (count: number) => void;
  handleCreateTable: () => void;
}

const CreateTableForm: React.FC<CreateTableFormProps> = ({
  tableName,
  columnCount,
  setTableName,
  setColumnCount,
  handleCreateTable,
}) => {
  const [hasError, setHasError] = useState(false); // Para manejar la validación

  const handleCreateClick = () => {
    if (!tableName) {
      setHasError(true); // Mostrar error si el nombre de la tabla está vacío
    } else {
      setHasError(false);
      handleCreateTable(); // Continuar con la creación si hay nombre
    }
  };

  return (
    <div>
      <div className="form-group">
        <label htmlFor="tableName">Nombre de la tabla</label>
        <input
          type="text"
          className={`form-control ${hasError ? 'is-invalid' : ''}`} // aplicamos estilo de error si esta vacip
          id="tableName"
          placeholder="Ingresa el nombre de la tabla"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
        {hasError && (
          <div className="invalid-feedback">
            Favor de poner un nombre a la tabla.
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="columnCount">Número de columnas</label>
        <input
          type="number"
          className="form-control"
          id="columnCount"
          value={columnCount}
          min={1}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value >= 1) {
              setColumnCount(value);
            }
          }}
        />
      </div>

      <button
        type="button"
        className="btn btn-primary mt-3"
        onClick={handleCreateClick} // Llamar a la función con validación
      >
        Crear
      </button>
    </div>
  );
};

export default CreateTableForm;
