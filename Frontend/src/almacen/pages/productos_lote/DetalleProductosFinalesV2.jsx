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
import VisibilityIcon from "@mui/icons-material/Visibility";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CheckIcon from "@mui/icons-material/Check";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export function DetalleProductosFinalesV2({
  detalleProductoFinal,
  idProduccion,
}) {
  console.log(detalleProductoFinal);
  const [open, setOpen] = React.useState(false);
  const { entradas_parciales, idProdt } = detalleProductoFinal;

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <IconButton
        aria-label="delete"
        size="large"
        onClick={handleClickOpen}
        color="primary"
      >
        <VisibilityIcon fontSize="inherit" />
      </IconButton>

      <BootstrapDialog
        maxWidth={"lg"}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Detalle productos finales
        </DialogTitle>

        <DialogContent dividers>
          <TableProductoProduccion
            productoFinal={detalleProductoFinal}
            idProdt={idProdt}
          />
          <TableEntradas rows={entradas_parciales} idProdt={idProdt} />
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

// detalle del producto final programado
function TableProductoProduccion({ productoFinal, idProdt }) {
  return (
    <TableContainer component={Paper}>
      <br />
      <Typography gutterBottom>
        {" "}
        <b>Productos programados</b>{" "}
      </Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="right">
              <b>Cod Aso.</b>
            </TableCell>
            <TableCell align="left">
              <b>Codigo</b>
            </TableCell>
            <TableCell align="left">
              <b>Orden Prodc.</b>
            </TableCell>
            <TableCell align="left">
              <b>Descripción</b>
            </TableCell>
            <TableCell align="left">
              <b>U.M</b>
            </TableCell>
            <TableCell align="right">
              <b>Cantidad</b>
            </TableCell>
            <TableCell align="right">
              <b>Acumulado</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="right">{productoFinal.id}</TableCell>
            <TableCell align="left">{productoFinal.codProd2}</TableCell>
            <TableCell align="left">
              {!productoFinal.isAgregation ? <CheckIcon /> : <CloseIcon />}
            </TableCell>
            <TableCell align="left">{productoFinal.nomProd}</TableCell>
            <TableCell align="left">{productoFinal.simMed}</TableCell>
            <TableCell align="right">
              {parseInt(productoFinal.canTotProgProdFin)}
            </TableCell>
            <TableCell align="right">
              {productoFinal.cantidad_ingresada}
            </TableCell>
          </TableRow>
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
      <Typography gutterBottom>
        <b>Productos ingresados</b>
      </Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="right">#</TableCell>
            <TableCell align="left">
              <b>Producto</b>
            </TableCell>
            <TableCell align="left">
              <b>Provedor</b>
            </TableCell>
            <TableCell align="left">
              <b>Almacen</b>
            </TableCell>
            <TableCell align="left">
              <b>Codigo</b>
            </TableCell>
            <TableCell align="left">
              <b>Fecha entrada</b>
            </TableCell>
            <TableCell align="right">
              <b>Ingresado</b>
            </TableCell>
            <TableCell align="right">
              <b>Disponible</b>
            </TableCell>
            <TableCell align="right">
              <b>Acumulado</b>
            </TableCell>
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
