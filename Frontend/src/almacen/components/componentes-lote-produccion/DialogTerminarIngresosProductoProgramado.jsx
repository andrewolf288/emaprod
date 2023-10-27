import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { IconButton } from "@mui/material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { styled } from "@mui/material/styles";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export const DialogTerminarIngresosProductoProgramado = ({
  data,
  handleAccept,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const cantidadIngresada = parseInt(data.canTotIngProdFin);
  const cantidadProgramada = parseInt(data.canTotProgProdFin);
  const variacion = cantidadProgramada - cantidadIngresada;

  return (
    <div>
      <IconButton
        aria-label="delete"
        size="large"
        onClick={handleClickOpen}
        color="success"
        // detalle.esTerIngProFin
      >
        <CheckCircle fontSize="inherit" />
      </IconButton>

      <BootstrapDialog
        maxWidth={"lg"}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle>Confirmación de finalización de entradas</DialogTitle>
        <DialogContent>
          <strong>Cantidad Programada: </strong>
          {cantidadProgramada}
          <br />
          <strong>Cantidad Ingresada: </strong>
          {cantidadIngresada}
          <br />
          <strong>Variacion: </strong>
          {variacion}
          <br />
          <br />
          <strong
            className={
              variacion < 0
                ? "text-danger"
                : variacion === 0
                ? "text-success"
                : "text-primary"
            }
          >
            {variacion < 0
              ? "La cantidad ingresada es mayor a la programada, ¿Quieres realizar un cuadre?"
              : variacion === 0
              ? "La cantidad ingresa es igual a la cantidad programada. No se necesita realizar devoluciones"
              : "La cantidad ingresa es menor a la cantidad programada. Se deben realizar devoluciones"}
          </strong>
        </DialogContent>
        <DialogActions>
          {/* BOTON PARA CERRAR EL DIALOG */}
          <Button onClick={handleClose} color="inherit" variant="contained">
            Cerrar
          </Button>

          {/* BOTON PARA REALIZAR CUADRE */}
          {variacion < 0 && (
            <Button
              onClick={() => {
                handleClose();
                handleAccept(data, true);
              }}
              color="warning"
              variant="contained"
            >
              Realizar cuadre
            </Button>
          )}

          {/* BOTON PARA ACEPTAR EL TERMINO DE LA ENTREGA DE PRESENTACION FINAL*/}
          <Button
            onClick={() => {
              handleClose();
              handleAccept(data, false, variacion === 0);
            }}
            color="info"
            variant="contained"
          >
            Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
};
