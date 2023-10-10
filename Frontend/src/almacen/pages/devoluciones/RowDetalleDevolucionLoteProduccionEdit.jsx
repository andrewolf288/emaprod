import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { FilterMotivoDevolucion } from "../../../components/ReferencialesFilters/MotivoDevolucion/FilterMotivoDevolucion";
import { TextField } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import Typography from "@mui/material/Typography";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";

export const RowDetalleDevolucionLoteProduccionEdit = ({
  detalle,
  onChangeInputDetalle,
  onChangeMotivoDevolucion,
  onDeleteItemDetalle,
}) => {
  const [disabledInput, setdisabledInput] = useState(true);
  const [open, setOpen] = React.useState(false);

  const handleDetalleChangeMotivoDevolucion = (value) => {
    onChangeMotivoDevolucion(value.id, detalle.idProdt);
  };
  return (
    <React.Fragment>
      <TableRow>
        {/**
       <TableCell>{detalle.nomProdFin}</TableCell>
      */}
        <TableCell>{detalle.nomProd}</TableCell>
        <TableCell>{detalle.desCla}</TableCell>
        <TableCell>{detalle.simMed}</TableCell>
        {/**
          <TableCell>
          <FilterMotivoDevolucion
            onNewInput={handleDetalleChangeMotivoDevolucion}
          />
        </TableCell>
         */}
        <TableCell>
          <TextField
            disabled={disabledInput}
            onChange={(e) => {
              onChangeInputDetalle(e, detalle.idProdt);
            }}
            type="number"
            autoComplete="off"
            size="small"
            value={detalle.canProdDev}
          />
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            sx={{ marginRight: 3 }}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <KeyboardArrowUpIcon sx={{ fontSize: 30 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ fontSize: 30 }} />
            )}
          </IconButton>

          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => {
              onDeleteItemDetalle(detalle.idProdt);
            }}
          >
            <DeleteIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Motivo</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalle?.motivos?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align="left">
                        <input
                          type="text"
                          defaultValue={item.motivo}
                          className="form-control"
                          readOnly
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          onChange={(e) => {
                            onChangeInputDetalle(e, detalle, index);
                          }}
                          type="number"
                          autoComplete="off"
                          size="small"
                          name="cantidad"
                          value={item.canProdDev}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
{
  /**
        <TableCell>
        <div className="btn-toolbar">
          <button
            onClick={() => {
              setdisabledInput(!disabledInput);
            }}
            className="btn btn-success me-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-pencil-fill"
              viewBox="0 0 16 16"
            >
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
            </svg>
          </button>

          <button
            onClick={() => {
              onDeleteItemDetalle(detalle.idProdt);
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
       */
}
