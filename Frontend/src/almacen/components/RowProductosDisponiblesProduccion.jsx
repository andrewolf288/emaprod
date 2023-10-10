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
          //disabled={disabledInput}
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
      <TableCell align="left" sx={{ display: "flex" }}>
        {/**
            <IconButton
            aria-label="delete"
            size="large"
            onClick={() => {
              setdisabledInput(!disabledInput);
            }}
            color="primary"
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
           */}

        {showButtonDelete && (
          <IconButton
            aria-label="delete"
            size="large"
            onClick={() => {
              onDeleteDetalle(detalle.idProdt);
            }}
            color="primary"
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        )}
        {DetProdIntermdio && <DetProdIntermdio />}
      </TableCell>
    </TableRow>
  );
};
