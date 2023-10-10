import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

export const RowProductosAgregadosProduccion = ({ detalle, DetalleProductosFinales, idProduccion }) => {
  return (
    <TableRow
      key={detalle.id}
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell component="th" scope="detalle">
        {detalle.nomProd}
      </TableCell>
      <TableCell align="left">{detalle.simMed}</TableCell>
      <TableCell align="left">{detalle.desCla}</TableCell>
      <TableCell align="left">{detalle.canTotProgProdFin}</TableCell>
      <TableCell align="left">{detalle.canTotIngProdFin}</TableCell>
      <TableCell align="left">{<DetalleProductosFinales row={detalle} idProduccion={idProduccion}/>}</TableCell>

    </TableRow>
  );
};
