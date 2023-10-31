import React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export const DialogDeleteDetalleRequisicionDevolucion = ({
  itemDelete,
  onDeleteItemSelected,
}) => {
  const [open, setOpen] = React.useState(false);

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
        color="error"
        disabled={itemDelete.esComReqDevDet === 1}
      >
        <DeleteRoundedIcon fontSize="inherit" />
      </IconButton>
      <BootstrapDialog
        maxWidth={"lg"}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Actualizar detalle requisicion devolucion
        </DialogTitle>
        <DialogContent dividers>
          <b className="fw-bolder text-danger d-block mb-2">
            ¿Quieres actualizar este detalle?
          </b>
          <b className="me-2 d-block">Producto:</b>
          {itemDelete.nomProd}
          <b className="me-2 d-block mt-2">Cantidad:</b>
          {itemDelete.canReqDevDet}
          <span className="ms-2">{itemDelete.simMed}</span>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            color="error"
            autoFocus
            onClick={() => {
              handleClose();
              onDeleteItemSelected(itemDelete);
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
};
