import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { DialogDevolucionByMotivo } from "../../../produccion/components/DialogDevolucionByMotivo";

export const RowDetalleDevolucionLoteProduccion = ({ detalle }) => {
  return (
    <TableRow>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>{detalle.simMed}</TableCell>
      <TableCell>{detalle.nomAlm}</TableCell>
      <TableCell>{detalle.desProdDevMot}</TableCell>
      <TableCell>{detalle.canProdDev}</TableCell>
      {/**
         <TableCell>{detalle.acumulado}</TableCell>
       */}
      {/* <TableCell>{detalle.cantDev}</TableCell> */}
      <TableCell>{<DialogDevolucionByMotivo detalle={detalle} />}</TableCell>
    </TableRow>
  );
};
