import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { DetalleDevolucionProduccion } from "./DetalleDevolucionProduccion";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { IconButton } from "@mui/material";

export const RowDetalleDevolucionLoteProduccion = ({
  detalle,
  onRenderPDF,
}) => {
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
          <IconButton
            aria-label="delete"
            size="large"
            onClick={() => {
              onRenderPDF(detalle);
            }}
            color="error"
          >
            <PictureAsPdfIcon fontSize="inherit" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
};
