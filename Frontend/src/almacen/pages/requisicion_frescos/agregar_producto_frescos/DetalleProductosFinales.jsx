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
import { getEntradasStockByProdcFinal } from "./../../../helpers/entradas-stock/getEntradasStockByProdcFinal";
import CheckIcon from "@mui/icons-material/Check";
import DetailsIcon from "@mui/icons-material/Details";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export function DetalleProductosFinales({ row = {}, idProduccion }) {
  const [open, setOpen] = React.useState(false);
  const [entradas, setEntradas] = React.useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    if (open && idProduccion) {
      //detail
      //console.log(row, idProduccion);
      getEntradas({ idProduccion: idProduccion });
    }
  }, [row, idProduccion, open]);

  async function getEntradas(body) {
    const resultPeticion = await getEntradasStockByProdcFinal(body);
    const { message_error, description_error, result } = resultPeticion;
    setEntradas(result);
  }

  return (
    <div>
      <IconButton
        aria-label="delete"
        size="large"
        onClick={handleClickOpen}
        color="primary"
      >
        <DetailsIcon fontSize="inherit" />
      </IconButton>

      <BootstrapDialog
        maxWidth={"lg"}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Detalle producto intermedio
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
  React.useEffect(() => {
    // console.log(row);
  }, [row, idProdt]);

  return (
    <TableContainer component={Paper}>
      <br />
      <Typography gutterBottom>Productos programados</Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Cod Aso.</TableCell>
            <TableCell align="left">Codigo</TableCell>
            <TableCell align="left">Orden Prodc.</TableCell>
            <TableCell align="left">Descripción</TableCell>
            <TableCell align="left">U.M</TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell align="right">Acumulado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {row.detail?.map((row, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell align="right">{row.id}</TableCell>
              <TableCell align="left">{row.codProd2}</TableCell>
              <TableCell align="left">
                {!row.isAgregation ? <CheckIcon /> : <CloseIcon />}
              </TableCell>
              <TableCell align="left">{row.nomProd}</TableCell>
              <TableCell align="left">{row.simMed}</TableCell>
              <TableCell align="right">{row.canTotProgProdFin}</TableCell>
              <TableCell align="right">{row.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TableEntradas({ rows, idProdt }) {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    var result = [];
    var total = 0;
    rows.map((obj) => {
      //console.log(obj.idProd, idProdt )
      if (obj.idProd == idProdt) {
        //console.log(obj.canTotDis)
        total += parseFloat(obj.canTotDis);
        obj.acumulado = total.toFixed(2);
        //data.canTotDis = parseFloat(data.canTotDis)
        result.push(obj);
      }
    });
    setData(result);
  }, [rows, idProdt]);

  return (
    <TableContainer component={Paper}>
      <br />
      <Typography gutterBottom>Productos ingresados</Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="right">#</TableCell>
            <TableCell align="left">Producto</TableCell>
            <TableCell align="left">Provedor</TableCell>
            <TableCell align="left">Almacen</TableCell>
            <TableCell align="left">Codigo</TableCell>
            <TableCell align="left">Fecha entrada</TableCell>
            <TableCell align="right">Ingresado</TableCell>
            <TableCell align="right">Disponible</TableCell>
            <TableCell align="right">Acumulado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row"></TableCell>
              <TableCell align="left">{row.nomProd}</TableCell>
              <TableCell align="left">{row.nomProv}</TableCell>
              <TableCell align="left">{row.nomAlm}</TableCell>
              <TableCell align="left">{row.codEntSto}</TableCell>
              <TableCell align="left">{row.fecEntSto}</TableCell>
              <TableCell align="right">{row.canTotEnt}</TableCell>
              <TableCell align="right">{row.canTotDis}</TableCell>
              <TableCell align="right">{row.acumulado}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
