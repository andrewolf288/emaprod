import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { DialogUpdateDetalleRequisicionAgregacion } from "./DialogUpdateDetalleRequisicionAgregacion";
import { DialogDeleteDetalleRequisicionAgregacion } from "./DialogDeleteDetalleRequisicionAgregacion";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export const RowDetalleRequisicionAgregacion = ({
  detalles,
  onUpdateDetalle,
  onDeleteDetalle,
  onCheckDetalle,
}) => {
  return (
    <div className="mt-2">
      <p>
        <b>Detalle</b>
      </p>
      <TableContainer key={detalles.id} component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#FEE7BC" }}>
            <TableRow>
              <TableCell>
                <b>#</b>
              </TableCell>
              <TableCell>
                <b>Producto</b>
              </TableCell>
              <TableCell>
                <b>Medida</b>
              </TableCell>
              <TableCell>
                <b>Cantidad</b>
              </TableCell>
              <TableCell>
                <b>Estado</b>
              </TableCell>
              <TableCell>
                <b>Acciones</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalles.map((detalle, index) => (
              <TableRow key={`${detalle.id} - ${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{detalle.nomProd}</TableCell>
                <TableCell>{detalle.simMed}</TableCell>
                <TableCell>{detalle.canReqAgrDet}</TableCell>
                <TableCell>
                  <span
                    className={
                      detalle.esComReqAgrDet === 0
                        ? "badge text-bg-danger"
                        : "badge text-bg-success"
                    }
                  >
                    {detalle.esComReqAgrDet === 0 ? "Requerido" : "Completo"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="btn-toolbar">
                    <DialogUpdateDetalleRequisicionAgregacion
                      itemUpdate={detalle}
                      onUpdateItemSelected={onUpdateDetalle}
                    />
                    <DialogDeleteDetalleRequisicionAgregacion
                      itemDelete={detalle}
                      onDeleteItemSelected={onDeleteDetalle}
                    />
                    <IconButton
                      aria-label="delete"
                      size="large"
                      color="success"
                      disabled={detalle.esComReqAgrDet === 1}
                      onClick={() => {
                        onCheckDetalle(detalle);
                      }}
                    >
                      <CheckCircleRoundedIcon fontSize="inherit" />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
