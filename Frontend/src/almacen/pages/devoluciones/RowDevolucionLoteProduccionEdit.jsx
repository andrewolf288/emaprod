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

export const RowDevolucionLoteProduccionEdit = ({
  detalle,
  onChangeInputDetalle,
  onDeleteItemDetalle,
}) => {
  const [disabledInput, setdisabledInput] = useState(true);
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>{detalle.nomProd}</TableCell>
        <TableCell>{detalle.simMed}</TableCell>
        <TableCell>
          <TextField
            disabled={disabledInput}
            type="number"
            autoComplete="off"
            size="small"
            value={detalle.canReqProdLot}
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
              onDeleteItemDetalle(detalle.idProd);
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
                          defaultValue={item.nomDevMot}
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
