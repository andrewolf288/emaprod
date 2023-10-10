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
                          {/**
                               className={
                              detalle.idReqSelDetEst === 1
                                ? "badge text-bg-danger p-2"
                                : detalle.idReqSelDetEst === 2
                                ? "badge text-bg-primary p-2"
                                : detalle.idReqSelDetEst === 3
                                ? "badge text-bg-warning p-2"
                                : "badge text-bg-success p-2"
                            }
                               */}
                          <span
                            className={
                              (detalle.idReqSelDetEstt === 1 &&
                                " badge text-bg-warning p-2 ") +
                              (detalle.idReqSelDetEst === 2 &&
                                " badge text-bg-primary p-2 ") +
                              // (row.reqSelDet.find(
                              //</TableCell>   (obj) => obj.idReqDet == row.idReqDet
                              // ).idReqSelDetEst === 3 &&
                              //   " badge text-bg-warning p-2 ") +
                              (detalle.idReqSelDetEst === 4 &&
                                " badge text-bg-success p-2 ") +
                              (detalle.idReqSelDetEst === 5 &&
                                " badge text-bg-danger p-2 ")

                              // "badge text-bg-success p-2"
                            }
                          >
                            {detalle.desReqSelDetEst}
                          </span>
                        </TableCell>
                        <TableCell align="left">
                          <div
                            className="btn-toolbar"
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <button
                              onClick={() => {
                                onCreateSalidas(detalle);
                              }}
                              disabled={detalle.idReqSelDetEst !== 1}
                              className={
                                detalle.idReqSelDetEst !== 1
                                  ? "btn btn-secondary me-2"
                                  : "btn btn-success me-2"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-check2"
                                viewBox="0 0 16 16"
                              >
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                              </svg>
                            </button>
                            <Link
                              style={{
                                pointerEvents:
                                  detalle.idReqSelDetEst === 4 ||
                                  detalle.idReqSelDetEst === 1
                                    ? "none"
                                    : "",
                              }}
                              to={`/almacen/requisicion-seleccion/entrada-stock?idReqSelDet=${detalle.id}`}
                              className={
                                detalle.idReqSelDetEst === 4 ||
                                detalle.idReqSelDetEst === 1
                                  ? "btn btn-secondary me-2"
                                  : "btn btn-primary me-2"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-caret-up-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                              </svg>
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
                              disabled={detalle.idReqSelDetEst === 5}
                              className={
                                detalle.idReqSelDetEst === 5
                                  ? "btn btn-secondary me-2"
                                  : "btn btn-primary me-2"
                              }
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
