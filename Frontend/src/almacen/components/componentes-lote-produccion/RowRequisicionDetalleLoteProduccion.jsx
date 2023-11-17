import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { ComponentActionRequisicionDetalle } from "../../../components/Otros/ComponentActionRequisicionDetalle";

export const RowRequisicionDetalleLoteProduccion = ({
  detalle,
  onUpdateDetalleRequisicion,
  onDeleteDetalleRequisicion,
  onCreateSalidaTotal,
  onCreateSalidaParcial,
  onTerminarSalidaParcial,
  show,
}) => {
  return (
    <TableRow>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>
        <span
          className={
            detalle.idReqDetEst === 1
              ? "badge text-bg-danger p-2"
              : detalle.idReqDetEst === 3
              ? "badge text-bg-warning p-2"
              : "badge text-bg-success p-2"
          }
        >
          {detalle.desReqDetEst}
        </span>
      </TableCell>
      <TableCell>{detalle.simMed}</TableCell>
      <TableCell align="center">{detalle.canReqDet}</TableCell>
      <TableCell align="center">
        {parseFloat(detalle.canTotSalParc).toFixed(3)}
      </TableCell>
      {show && (
        <TableCell>
          <ComponentActionRequisicionDetalle
            detalle={detalle}
            onCreateSalidaParcial={onCreateSalidaParcial}
            onCreateSalidaTotal={onCreateSalidaTotal}
            onDeleteDetalleRequisicion={onDeleteDetalleRequisicion}
            onUpdateDetalleRequisicion={onUpdateDetalleRequisicion}
            onTerminarSalidaParcial={onTerminarSalidaParcial}
          />
        </TableCell>
      )}
    </TableRow>
  );
};
