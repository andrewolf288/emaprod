import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const RowDetalleSalidasVentaDetalle = ({ detalle }) => {
  const { detSal } = detalle;
  return (
    <div className="mt-2">
      <p>
        <b>Detalle</b>
      </p>
      <TableContainer key={detalle.refProdc} component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#FEE7BC" }}>
            <TableRow>
              <TableCell>
                <b>Lote</b>
              </TableCell>
              <TableCell>
                <b>Cantidad</b>
              </TableCell>
              <TableCell>
                <b>Fecha inicio</b>
              </TableCell>
              <TableCell>
                <b>Fecha vencimiento</b>
              </TableCell>
              <TableCell>
                <b>Acciones</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detSal.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.codLotProd}</TableCell>
                <TableCell>{item.canSalLotProd}</TableCell>
                <TableCell>{item.fecProdIni}</TableCell>
                <TableCell>{item.fecVenLotProd}</TableCell>
                <TableCell>
                  <div className="btn-toolbar">
                    <IconButton
                      aria-label="edit"
                      size="large"
                      color="warning"
                      onClick={() => {
                        console.log("editamos");
                      }}
                    >
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      size="large"
                      color="error"
                      onClick={() => {
                        console.log("eliminamos");
                      }}
                    >
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* AÑADIMOS BOTON DE AÑADIR LOTE COMO SALIDA */}
      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-primary">Añadir lote</button>
      </div>
    </div>
  );
};
