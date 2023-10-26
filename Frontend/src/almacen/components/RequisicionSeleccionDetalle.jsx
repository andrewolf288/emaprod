import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Link } from "react-router-dom";
import "../styles/style-modal.css";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import Tooltip from "@mui/material/Tooltip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";

export const RequisicionSeleccionDetalle = ({
  detalle,
  onClose,
  onCreateSalidas,
  anular,
}) => {
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
            <h5 className="modal-title">Detalle de la requisicion</h5>
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
            <Paper>
              <TableContainer>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          color: "rgba(96, 96, 96)",
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    >
                      <TableCell align="left" width={50}>
                        <b>Materia Prima</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Cantidad</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Estado</b>
                      </TableCell>
                      <TableCell align="left" width={120}>
                        <b>Acciones</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalle.map((detalle, i) => (
                      <TableRow
                        key={detalle.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="detalle">
                          {detalle.nomProd}
                        </TableCell>
                        <TableCell align="left">
                          {detalle.canReqSelDet}
                        </TableCell>
                        <TableCell align="left">
                          <span
                            className={
                              detalle.idReqSelDetEst === 1 // requerido
                                ? "badge text-bg-secondary p-2"
                                : detalle.idReqSelDetEst === 2 // por seleccionar
                                ? "badge text-bg-primary p-2"
                                : detalle.idReqSelDetEst === 3 // en proceso
                                ? "badge text-bg-warning p-2"
                                : detalle.idReqSelDetEst === 4 // seleccionado
                                ? "badge text-bg-success p-2"
                                : "badge text-bg-danger p-2" // anulado
                            }
                          >
                            {detalle.desReqSelDetEst}
                          </span>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ minWidth: "150px", border: "1px solid black" }}
                        >
                          <div
                            className="btn-toolbar"
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <button
                              onClick={() => {
                                if (detalle.idReqSelDetEst === 1) {
                                  onCreateSalidas(detalle);
                                } else {
                                }
                              }}
                              disabled={detalle.idReqSelDetEst !== 1}
                              className={"btn btn-success me-2"}
                            >
                              {
                                <Tooltip
                                  title={
                                    detalle.idReqSelDetEst == 1
                                      ? "Atender solicitud"
                                      : "La solicitud ya fue atendida"
                                  }
                                >
                                  <CheckCircleIcon />
                                </Tooltip>
                              }
                            </button>

                            <Link
                              style={{
                                pointerEvents:
                                  detalle.idReqSelDetEst === 4 || // seleccionado
                                  detalle.idReqSelDetEst === 5 || // anulado
                                  detalle.idReqSelDetEst === 1 // requerido
                                    ? "none"
                                    : "",
                              }}
                              to={`/almacen/requisicion-seleccion/entrada-stock?idReqSelDet=${detalle.id}`}
                              className={"btn btn-primary me-2"}
                            >
                              <Tooltip
                                title={
                                  detalle.idReqSelDetEst === 4 ||
                                  detalle.idReqSelDetEst === 1
                                    ? "La entrada ya ha sido seleccionada"
                                    : "Registro de entrada de selección"
                                }
                              >
                                <AppRegistrationIcon />
                              </Tooltip>
                            </Link>

                            <button
                              onClick={() => {
                                let result = window.confirm(
                                  "Estás seguro de anular este registro?"
                                );

                                if (result) {
                                  anular(detalle.id);
                                }
                              }}
                              disabled={detalle.idReqSelDetEst !== 1}
                              className={"btn btn-danger me-2"}
                            >
                              <Tooltip title="Anular">
                                <DoNotDisturbOnIcon />
                              </Tooltip>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
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
          </div>
        </div>
      </div>
    </div>
  );
};
