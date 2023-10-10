import React from "react";

export const DialogDeleteDetalle = ({
  itemDelete,
  onClose,
  onDeleteItemSelected,
}) => {
  return (
    <div
      className="modal"
      tabIndex="-1"
      role="dialog"
      style={{
        display: itemDelete !== null ? "block" : "none",
      }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Eliminar detalle de formula</h5>
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
            <p className="fw-bolder text-danger">
              ¿Quieres eliminar este detalle?
            </p>
            <p>
              <b className="me-2">Materia Prima:</b>
              {itemDelete.nomProd}
            </p>
            <p>
              <b className="me-2">Cantidad:</b>
              {itemDelete.canMatPriFor}
              <span className="ms-2">{itemDelete.simMed}</span>
            </p>
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
                onDeleteItemSelected(itemDelete.id);
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
