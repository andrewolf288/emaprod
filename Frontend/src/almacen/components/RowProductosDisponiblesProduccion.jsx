import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { TextField } from "@mui/material";
import FechaPicker from "../../../src/components/Fechas/FechaPicker";
import FechaPickerYear from "../../../src/components/Fechas/FechaPickerYear";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
export const RowProductosDisponiblesProduccion = ({
  detalle,
  onDeleteDetalle,
  onChangeDetalle,
  showButtonDelete,
  DetProdIntermdio,
}) => {
  const [disabledInput, setdisabledInput] = useState(true);

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
      <TableCell align="left">
        <FechaPicker
          onNewfecEntSto={(data) => {
            var event = {
              target: {
                value: data,
                name: "fecEntSto",
              },
            };
            onChangeDetalle(event, detalle.idProdt);
          }}
          date={detalle.fecEntSto}
        />
      </TableCell>
      <TableCell align="left">
        <FechaPickerYear
          onNewfecEntSto={(data) => {
            var event = {
              target: {
                value: data,
                name: "fecVenEntProdFin",
              },
            };
            onChangeDetalle(event, detalle.idProdt);
          }}
          date={detalle.fecVenEntProdFin}
        />
      </TableCell>
      <TableCell align="left">
        <TextField
          type="number"
          autoComplete="off"
          size="small"
          value={detalle.canProdFin}
          name="canProdFin"
          onChange={(e) => {
            onChangeDetalle(e, detalle.idProdt);
          }}
        />
      </TableCell>
      <TableCell align="left">
        <div className="btn-toolbar">
          <button
            onClick={() => {
              onDeleteDetalle(detalle.idProdt);
            }}
            className="btn btn-danger"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-trash-fill"
              viewBox="0 0 16 16"
            >
              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
            </svg>
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};
