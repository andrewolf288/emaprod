import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

export const DialogConfirmarEntradaParcial = (props) => {
  const {
    open,
    handleClose,
    handleAccept,
    handleAcceptFinEntPar,
    data,
    canTotEnt,
  } = props;
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>¿Quieres terminar las entradas parciales?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <strong>Cantidad de ingreso: </strong>
          {parseFloat(canTotEnt).toFixed(3)}
          <br />
          <strong>Cantidad total de orden de compra: </strong>
          {parseFloat(data.canTotCom).toFixed(3)}
          <br />
          <strong>Cantidad acumulada antes de la entrada parcial: </strong>
          {parseFloat(data.cantAcuIngPar).toFixed(3)}
          <br />
          <strong>Cantidad acumulada despues de la entrada parcial: </strong>
          {(parseFloat(data.cantAcuIngPar) + parseFloat(canTotEnt)).toFixed(3)}
          <br />
          <strong>Restante despues de la entrada parcial: </strong>
          {(
            parseFloat(data.canTotCom) -
            (parseFloat(data.cantAcuIngPar) + parseFloat(canTotEnt))
          ).toFixed(3)}
          <br />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleAccept(data);
          }}
          color="error"
          variant="contained"
        >
          Solo ingreso parcial
        </Button>
        <Button
          onClick={() => {
            handleAcceptFinEntPar(data);
          }}
          color="warning"
          variant="contained"
        >
          Terminar entradas parciales
        </Button>
        <Button onClick={handleClose} color="inherit" variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
