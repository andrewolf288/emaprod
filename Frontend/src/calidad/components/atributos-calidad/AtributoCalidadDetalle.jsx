import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "../../styles/style-modal.css";

export const AtributoCalidadDetalle = ({ detalle, onClose }) => {
  return (
    <div
      className="modal"
      tabIndex="-1"
      role="dialog"
      style={{
        display: detalle !== null ? "block" : "none"
      }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalle de atributos de calidad</h5>
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
                          backgroundColor: "#f5f5f5"
                        }
                      }}
                    >
                      <TableCell align="left" width={170}>
                        <b>Nombre atributo</b>
                      </TableCell>
                      <TableCell align="left" width={100}>
                        <b>Tipo atributo</b>
                      </TableCell>
                      <TableCell align="left" width={220}>
                        <b>Opciones atributo</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Fecha actualización</b>
                      </TableCell>
                      <TableCell align="left" width={70}>
                        <b>Fecha creación</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalle.map((row, i) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.nomProdAtr}
                        </TableCell>
                        <TableCell align="left">
                          {row.tipProdAtr === "N"
                            ? "Numérico"
                            : row.tipProdAtr === "T"
                            ? "Texto"
                            : row.tipProdAtr === "B"
                            ? "Booleano"
                            : "Opciones"}
                        </TableCell>
                        <TableCell align="left">{row.opcProdAtr}</TableCell>
                        <TableCell align="left">
                          {row.fecActProAtrCal}
                        </TableCell>
                        <TableCell align="left">
                          {row.fecCreProAtrCal}
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
