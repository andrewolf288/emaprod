import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { getEntradasStockByProdcFinal } from "./../../helpers/entradas-stock/getEntradasStockByProdcFinal";
import CheckIcon from "@mui/icons-material/Check";
import TableRowsIcon from "@mui/icons-material/TableRows";
import Tooltip from "@mui/material/Tooltip";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export function DetalleSalReqSel({ row, idProduccion }) {
  const [open, setOpen] = React.useState(false);
  const [entradas, setEntradas] = React.useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Tooltip title="Salidas seleccion">
        <IconButton onClick={handleClickOpen}>
          <TableRowsIcon fontSize="medium" sx={{ color: "white" }} />
        </IconButton>
      </Tooltip>
      <BootstrapDialog
        maxWidth={"lg"}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Detalle salidas requisición selección
        </DialogTitle>

        <DialogContent dividers>
          <TableEntradas2 row={row} idProdt={row.idProdt} />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
}

function TableEntradas2({ row, idProdt }) {
  const [entrada, setEntrada] = React.useState([]);

  React.useEffect(() => {
    var totalCantidadDev = 0;
    row.devoluciones.map((obj) => {
      totalCantidadDev = totalCantidadDev + parseFloat(obj.canProdDevTra);
    });

    row.devoluciones.map((obj) => {
      obj.canTotDis = parseFloat(totalCantidadDev) - parseFloat(row.canTotDis);
    });

    var total = 0;
    row.devoluciones.map((obj) => {
      console.log(obj);
      total = total + parseFloat(obj.canProdDevTra);
      obj.acumulado = total;
    });
    setEntrada(row);
  }, [row, idProdt]);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Codigo</TableCell>
            <TableCell align="left">nombre</TableCell>
            {/**
            <TableCell align="left">Cant. Disponible</TableCell>
             
             */}
            {/**
               <TableCell align="left">Entrada</TableCell>
            <TableCell align="left">Merma</TableCell>
             */}
            <TableCell align="left">Fecha sal req.</TableCell>
            <TableCell align="right">Salida</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entrada.salidasSeleccion?.map((item, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="left">{item.codProd2}</TableCell>
              <TableCell align="left">{item.nomProd}</TableCell>
              {/**
                 <TableCell align="right">{item.canEntStoReqSel}</TableCell>
              <TableCell align="right">{item.merReqSel}</TableCell>
                 */}
              <TableCell align="left">{item.fecSalStoReqSel}</TableCell>
              <TableCell align="right">{item.canSalStoReqSel}</TableCell>

              {/**
                <TableCell align="right">{item.fecEntStoReqSel}</TableCell>
               */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
