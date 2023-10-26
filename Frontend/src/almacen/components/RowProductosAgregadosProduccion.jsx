import React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { DetalleProductosFinalesV2 } from "../pages/productos_lote/DetalleProductosFinalesV2";
import { IconButton } from "@mui/material";
import CheckCircle from "@mui/icons-material/CheckCircle";

export const RowProductosAgregadosProduccion = ({ detalle, idProduccion }) => {
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
      <TableCell align="left">{detalle.canTotProgProdFin}</TableCell>
      <TableCell align="left">{detalle.canTotIngProdFin}</TableCell>
      <TableCell align="left">
        {
          <DetalleProductosFinalesV2
            detalleProductoFinal={detalle}
            idProduccion={idProduccion}
          />
        }

        <IconButton
          aria-label="delete"
          size="large"
          onClick={() => {
            console.log("Click");
          }}
          color="success"
        >
          <CheckCircle fontSize="inherit" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
