import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { DialogDevolucionByMotivo } from "../../../produccion/components/DialogDevolucionByMotivo";
import { DetalleDevolucionProduccion } from "./DetalleDevolucionProduccion";

export const RowDetalleDevolucionLoteProduccion = ({ detalle }) => {
  return (
    <TableRow
      key={detalle.id}
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell component="th" scope="detalle">
        {detalle.idProdFin}
      </TableCell>
      <TableCell align="left">{detalle.nomProd}</TableCell>
      <TableCell align="left">{detalle.canTotUndReqDev}</TableCell>
      <TableCell align="left">{detalle.desReqEst}</TableCell>
      <TableCell align="center">
        <div className="btn-toolbar">
          {
            <DetalleDevolucionProduccion
              detalleDevolucionProduccion={detalle}
            />
          }
        </div>
      </TableCell>
    </TableRow>
  );
};
