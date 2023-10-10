import React, { useState } from "react";
import FechaPicker from "../../components/Fechas/FechaPicker";
import "../styles/style-modal.css";

export const AccionesProduccionLote = ({
  detalle,
  onClose,
  onUpdateDatesProduccion,
}) => {
  const [disabledButton, setDisabledButton] = useState(true);
  const [fechasProduccion, setFechasProduccion] = useState({
    fecFinMolProd: detalle.fecFinMolProd,
    fecFinEnvProd: detalle.fecFinEnvProd,
    fecFinEncProd: detalle.fecFinEncProd,
    fecProdFin: detalle.fecProdFin,
  });

  const { fecFinMolProd, fecFinEnvProd, fecFinEncProd, fecProdFin } =
    fechasProduccion;

  // manejadores de las horas
  const onChangeFecFinMolProd = (newFec) => {
    setDisabledButton(false);
    setFechasProduccion({ ...fechasProduccion, fecFinMolProd: newFec });
  };

  const onChangeFecFinEnvProd = (newFec) => {
    setDisabledButton(false);
    setFechasProduccion({ ...fechasProduccion, fecFinEnvProd: newFec });
  };

  const onChangeFecFinEncProd = (newFec) => {
    setDisabledButton(false);
    setFechasProduccion({ ...fechasProduccion, fecFinEncProd: newFec });
  };

  const onChangeFecProdFin = (newFec) => {
    setDisabledButton(false);
    setFechasProduccion({ ...fechasProduccion, fecProdFin: newFec });
  };

  return (
    <div
      className="modal"
      tabIndex="-1"
      role="dialog"
      style={{
        display: detalle !== null ? "block" : "none",
      }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Actualizar información</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              {detalle.esEnv === 0 && (
                <div className="row mb-2 mt-2 d-flex justify-content-start align-items-center">
                  <label className="col-md-4 col-form-label">
                    <b>Fin proceso molienda</b>
                  </label>
                  <div className="col-md-4">
                    {detalle.fecFinMolProd === null &&
                    fecFinMolProd === null ? (
                      <p className="text-danger">Aun no terminado</p>
                    ) : fecFinMolProd !== null &&
                      detalle.fecFinMolProd !== null ? (
                      <p className="text-success">{fecFinMolProd}</p>
                    ) : (
                      <p className="text-primary">{fecFinMolProd}</p>
                    )}
                  </div>
                  {!detalle.fecFinMolProd && (
                    <div className="col-md-4">
                      <FechaPicker onNewfecEntSto={onChangeFecFinMolProd} />
                    </div>
                  )}
                </div>
              )}
              <div className="row mb-2 d-flex justify-content-start align-items-center">
                <label className="col-md-4 col-form-label">
                  <b>Fin proceso envasado</b>
                </label>
                <div className="col-md-4">
                  {detalle.fecFinEnvProd === null && fecFinEnvProd === null ? (
                    <p className="text-danger">Aun no terminado</p>
                  ) : fecFinEnvProd !== null &&
                    detalle.fecFinEnvProd !== null ? (
                    <p className="text-success">{fecFinEnvProd}</p>
                  ) : (
                    <p className="text-primary">{fecFinEnvProd}</p>
                  )}
                </div>
                {!detalle.fecFinEnvProd && (
                  <div className="col-md-4">
                    <FechaPicker
                      disabled={fecFinMolProd === null}
                      onNewfecEntSto={onChangeFecFinEnvProd}
                    />
                  </div>
                )}
              </div>
              <div className="row mb-2 d-flex justify-content-start align-items-center">
                <label className="col-md-4 col-form-label">
                  <b>Fin proceso encajonado</b>
                </label>
                <div className="col-md-4">
                  {detalle.fecFinEncProd === null && fecFinEncProd === null ? (
                    <p className="text-danger">Aun no terminado</p>
                  ) : fecFinEncProd !== null &&
                    detalle.fecFinEncProd !== null ? (
                    <p className="text-success">{fecFinEncProd}</p>
                  ) : (
                    <p className="text-primary">{fecFinEncProd}</p>
                  )}
                </div>
                {!detalle.fecFinEncProd && (
                  <div className="col-md-4">
                    <FechaPicker
                      disabled={
                        fecFinMolProd === null || fecFinEnvProd === null
                      }
                      onNewfecEntSto={onChangeFecFinEncProd}
                    />
                  </div>
                )}
              </div>
              <div className="row mb-2 d-flex justify-content-start align-items-center">
                <label className="col-md-4 col-form-label">
                  <b>Fin proceso</b>
                </label>
                <div className="col-md-4">
                  {detalle.fecProdFin === null && fecProdFin === null ? (
                    <p className="text-danger">Aun no terminado</p>
                  ) : fecProdFin !== null && detalle.fecProdFin !== null ? (
                    <p className="text-success">{fecProdFin}</p>
                  ) : (
                    <p className="text-primary">{fecProdFin}</p>
                  )}
                </div>
                {!detalle.fecProdFin && (
                  <div className="col-md-4">
                    <FechaPicker
                      disabled={
                        fecFinMolProd === null ||
                        fecFinEnvProd === null ||
                        fecFinEncProd === null
                      }
                      onNewfecEntSto={onChangeFecProdFin}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              disabled={disabledButton}
              type="button"
              className="btn btn-success"
              data-dismiss="modal"
              onClick={() => {
                onUpdateDatesProduccion(detalle.id, fechasProduccion);
              }}
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
