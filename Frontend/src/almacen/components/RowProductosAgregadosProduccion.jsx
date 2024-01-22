import React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { DetalleProductosFinalesV2 } from "../pages/productos_lote/DetalleProductosFinalesV2";
import { DialogTerminarIngresosProductoProgramado } from "./componentes-lote-produccion/DialogTerminarIngresosProductoProgramado";

export const RowProductosAgregadosProduccion = ({
  detalle,
  onTerminarIngresos
}) => {
  return (
    <TableRow
      key={detalle.id}
      sx={{
        "&:last-child td, &:last-child th": { border: 0 }
      }}
    >
      <TableCell component="th" scope="detalle">
        {detalle.nomProd}
      </TableCell>
      <TableCell align="left">{detalle.simMed}</TableCell>
      <TableCell align="left">{detalle.canTotProgProdFin}</TableCell>
      <TableCell align="left">{detalle.cantidad_ingresada}</TableCell>
      <TableCell align="left">
        {detalle.esTerIngProFin ? (
          <span className="badge text-bg-success p-1">Finalizado</span>
        ) : (
          <span className="badge text-bg-warning p-1">Pendiente</span>
        )}
      </TableCell>
      <TableCell align="center">
        <div className="btn-toolbar">
          {<DetalleProductosFinalesV2 detalleProductoFinal={detalle} />}
          {!detalle.esTerIngProFin && (
            <DialogTerminarIngresosProductoProgramado
              data={detalle}
              handleAccept={onTerminarIngresos}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
