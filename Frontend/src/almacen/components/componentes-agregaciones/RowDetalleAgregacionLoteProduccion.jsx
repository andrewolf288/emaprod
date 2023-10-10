import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

export const RowDetalleAgregacionLoteProduccion = ({ detalle, _parseInt }) => {
  {/** detalle.canProdAgr */}
  return (
    <TableRow >
      <TableCell>{detalle.flag}</TableCell>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>{detalle.fechaInicio}</TableCell>
      <TableCell>{detalle.fechaFin}</TableCell>
      <TableCell>{detalle.simMed}</TableCell>
      <TableCell>{detalle.nomAlm}</TableCell>
      <TableCell>{detalle.desProdAgrMot}</TableCell>
      <TableCell>{_parseInt(detalle)}</TableCell> 
    </TableRow>
  );
};
