import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

export const RowStockAlmacen = ({ detalle }) => {
  return (
    <TableRow>
      <TableCell>{detalle.codProd2}</TableCell>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>{detalle.desCla}</TableCell>
      <TableCell>{detalle.simMed}</TableCell>
      <TableCell>{detalle.nomAlm}</TableCell>
      <TableCell>{detalle.canSto}</TableCell>
      <TableCell>{detalle.canStoDis}</TableCell>
      <TableCell>
        <div className="btn-toolbar">No actions</div>
      </TableCell>
    </TableRow>
  );
};
