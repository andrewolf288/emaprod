import React, { useEffect, useState } from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { TextField } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";

export const RowDevolucionLoteProduccionEdit = ({
  detalle,
  onChangeInputDetalle,
  onDeleteItemDetalle,
}) => {
  const [open, setOpen] = React.useState(false);
  const [valueTotal, setvalueTotal] = useState(0);

  const calculateTotalMotivos = () => {
    let totalAcu = 0;
    detalle?.motivos?.forEach((item, index) => {
      // los exedentes no deben sumar
      if (index !== 2) {
        const canProdDev = parseFloat(item.canProdDev);

        if (!isNaN(canProdDev)) {
          totalAcu += canProdDev;
        }
      }
    });

    setvalueTotal(totalAcu.toFixed(2));
  };

  useEffect(() => {
    calculateTotalMotivos();
  }, [detalle]);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>{detalle.nomProd}</TableCell>
        <TableCell>{detalle.simMed}</TableCell>
        <TableCell>{detalle.canReqProdLot}</TableCell>
        <TableCell>
          <TextField
            disabled={true}
            type="number"
            autoComplete="off"
            size="small"
            value={valueTotal}
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
            <DeleteIcon sx={{ fontSize: 30 }} color="error" />
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
                            calculateTotalMotivos();
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
