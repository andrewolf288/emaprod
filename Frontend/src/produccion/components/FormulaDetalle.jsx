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

export const FormulaDetalle = ({ detalle, onClose }) => {
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
            <h5 className="modal-title">Detalle de la formula</h5>
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
                      <TableCell align="left" width={70}>
                        <b>Materia Prima</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Clase</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Sub clase</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Area responsable</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Cantidad (kg)</b>
                      </TableCell>
                      {/* <TableCell align="left" width={50}>
                        <b>Acciones</b>
                      </TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalle.map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.nomProd}
                        </TableCell>
                        <TableCell align="left">{row.desCla}</TableCell>
                        <TableCell align="left">{row.desSubCla}</TableCell>
                        <TableCell align="left">{row.desAre}</TableCell>
                        <TableCell align="left">{row.canMatPriFor}</TableCell>
                        {/* <TableCell align="left">
                          <div className="btn-toolbar">
                            <Link
                              className={
                                row.idReqMolDetEst !== 1
                                  ? "btn btn-secondary me-2 btn-lg"
                                  : "btn btn-warning me-2 btn-lg"
                              }
                              style={{
                                pointerEvents:
                                  row.idReqMolDetEst !== 1 ? "none" : "",
                              }}
                              data-toggle="modal"
                              to={`/almacen/salidas-stock/crear?idReqMolDet=${row.id}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-ui-checks"
                                viewBox="0 0 16 16"
                              >
                                <path d="M7 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-1zM2 1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2zm0 8a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H2zm.854-3.646a.5.5 0 0 1-.708 0l-1-1a.5.5 0 1 1 .708-.708l.646.647 1.646-1.647a.5.5 0 1 1 .708.708l-2 2zm0 8a.5.5 0 0 1-.708 0l-1-1a.5.5 0 0 1 .708-.708l.646.647 1.646-1.647a.5.5 0 0 1 .708.708l-2 2zM7 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-1zm0-5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
                              </svg>
                            </Link>
                            <button
                              disabled={row.idReqMolDetEst !== 1 ? true : false}
                              className={
                                row.idReqMolDetEst !== 1
                                  ? "btn btn-secondary btn-lg"
                                  : "btn btn-success btn-lg"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-check"
                                viewBox="0 0 16 16"
                              >
                                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                              </svg>
                            </button>
                          </div>
                        </TableCell> */}
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
