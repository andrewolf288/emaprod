import { TextField } from "@mui/material";
import React, { useState } from "react";

export const DialogUpdateDetalleRequisicion = ({
  itemUpdate,
  onClose,
  onUpdateItemSelected,
}) => {
  const [inputValue, setinputValue] = useState(0.0);

  const handleInputValue = ({ target }) => {
    const { value, name } = target;
    setinputValue(value);
  };

  return (
    <div
      className="modal"
      tabIndex="-1"
      role="dialog"
      style={{
        display: itemUpdate !== null ? "block" : "none",
      }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Actualizar detalle requisicion</h5>
            <button
              type="button"
              className="close ms-2"
              data-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <b className="fw-bolder text-danger d-block mb-2">
              ¿Quieres actualizar este detalle?
            </b>
              <b className="me-2 d-block">Materia Prima:</b>
              {itemUpdate.nomProd}
              <b className="me-2 d-block mt-2">Cantidad:</b>
              {itemUpdate.canReqDet}
              <span className="ms-2">{itemUpdate.simMed}</span>
              <b className="me-2 d-block mt-2">Nueva cantidad</b>
              <TextField
                value={inputValue}
                onChange={handleInputValue}
                size="small"
                type="number"
                autoComplete="off"
              />
            {/* ¿Quieres actualizar este detalle?
            <b className="me-2">Materia Prima:</b>
              {itemUpdate.nomProd}
              <b className="me-2">Cantidad:</b>
              {itemUpdate.canReqDet}
              <span className="ms-2">{itemUpdate.itemUpdateUM}</span>
              <b className="me-2">Nueva cantidad</b>
              <TextField
                value={inputValue}
                onChange={handleInputValue}
                size="small"
                type="number"
                autoComplete="off"
              /> */}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-danger"
              data-dismiss="modal"
              onClick={() => {
                onUpdateItemSelected(itemUpdate, inputValue);
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
