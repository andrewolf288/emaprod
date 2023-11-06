import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export const DetalleDevolucionProduccion = ({
  detalleDevolucionProduccion,
}) => {
  const [open, setOpen] = React.useState(false);
  const { detReqDev } = detalleDevolucionProduccion;

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
          Detalle requisicion devolución
        </DialogTitle>
        <DialogContent dividers>
          <TableDevolucionProduccion
            devolucionProduccion={detalleDevolucionProduccion}
          />
          <TableDevolucionDetalleProduccion detalle={detReqDev} />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
};

function TableDevolucionProduccion({ devolucionProduccion }) {
  return (
    <TableContainer component={Paper}>
      <br />
      <Typography gutterBottom>
        <b>Información devolución</b>
      </Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <b>Ref.</b>
            </TableCell>
            <TableCell align="left">
              <b>Presentación</b>
            </TableCell>
            <TableCell align="left">
              <b>Cantidad unidades</b>
            </TableCell>
            <TableCell align="left">
              <b>Estado</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell align="center">
              {devolucionProduccion.idProdFin}
            </TableCell>
            <TableCell align="left">{devolucionProduccion.nomProd}</TableCell>
            <TableCell align="left">
              {parseInt(devolucionProduccion.canTotUndReqDev)}
            </TableCell>
            <TableCell align="left">
              <span
                className={
                  devolucionProduccion.idReqEst === 1
                    ? "badge text-bg-danger"
                    : devolucionProduccion.idReqEst === 2
                    ? "badge text-bg-warning"
                    : "badge text-bg-success"
                }
              >
                {devolucionProduccion.desReqEst}
              </span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TableDevolucionDetalleProduccion({ detalle }) {
  return (
    <TableContainer component={Paper}>
      <br />
      <Typography gutterBottom>
        <b>Información devolución</b>
      </Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <b>#</b>
            </TableCell>
            <TableCell align="left">
              <b>Producto</b>
            </TableCell>
            <TableCell align="left">
              <b>Motivo</b>
            </TableCell>
            <TableCell align="left">
              <b>Estado</b>
            </TableCell>
            <TableCell align="right">
              <b>Cantidad</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {detalle.map((element, index) => (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              key={index}
            >
              <TableCell align="center">{index + 1}</TableCell>
              <TableCell align="left">{element.nomProd}</TableCell>
              <TableCell align="left">{element.desProdDevMot}</TableCell>
              <TableCell align="left">
                <span
                  className={
                    element.esComReqDevDet == 0
                      ? "badge text-bg-danger"
                      : "badge text-bg-success"
                  }
                >
                  {element.esComReqDevDet === 0 ? "Requerido" : "Completo"}
                </span>
              </TableCell>
              <TableCell align="center">{element.canReqDevDet}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
