import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { TextField } from "@mui/material";
import { FilterAlmacen } from "./../../../components/ReferencialesFilters/Almacen/FilterAlmacen";

export const RowEditDetalleProductosFinales = ({
  detalle,
  onDeleteItemProductoFinal,
  onChangeItemDetalle,
}) => {
  const [disabledButton, setdisabledButton] = useState(true);

  const onChangeInput = ({ target }) => {
    setdisabledButton(false);
    const { value, name } = target;
    console.log(value, name);
  };

  return (
    <TableRow
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
      }}
    >
      <TableCell component="th" scope="row">
        {detalle.index}
      </TableCell>
      <TableCell component="th" scope="row">
        {detalle.nomProd}
      </TableCell>
      <TableCell component="th" scope="row">
        {detalle.simMed}
      </TableCell>
     
      <TableCell component="th" scope="row">
        <TextField
          value={detalle.canUnd}
          name={"canUnd"}
          onChange={onChangeInput}
        />
      </TableCell>
      <TableCell component="th" scope="row">
        <TextField
          value={detalle.canKlg}
          name={"canKlg"}
          onChange={onChangeInput}
        />
      </TableCell>
      <TableCell align="left">
        <div className="btn-toolbar">
          <button
            onClick={() => {
              onDeleteItemProductoFinal(detalle.idProdFin);
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
