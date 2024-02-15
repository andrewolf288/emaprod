import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from "@mui/material";
import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import { getLotesDisponiblesByProductoIntermedio } from "../../helpers/requisicion-transformacion/getLotesDisponiblesByProductoIntermedio";
import { FilterLotesDisponibles } from "./FilterLotesDisponibles";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2)
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1)
  }
}));

export const ComponentSearchLotesDisponibles = ({
  idProdtInt,
  onConfirmOperation,
  disabled = false,
  setfeedbackMessages,
  handleClickFeeback
}) => {
  const [dataLotesDisponibles, setDataLotesDisponibles] = useState([]);
  const [idProdc, setIdProdc] = useState(0);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    // debemos consultar data
    seachLotesDisponibles();
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // funcion para buscar lotes disponibles del producto intermedio
  const seachLotesDisponibles = async () => {
    if (idProdtInt !== 0) {
      console.log(idProdtInt);
      // debemos buscar aquellos lotes de producción que sean del producto intermedio seleccionado
      const resultPeticion = await getLotesDisponiblesByProductoIntermedio(
        idProdtInt
      );
      const { result, message_error, description_error } = resultPeticion;
      if (message_error.length === 0) {
        setDataLotesDisponibles(result);
      } else {
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error:
            "No hay lotes creados para este producto intermedio"
        });
        handleClickFeeback();
      }
    } else {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Seleccione un producto intermedio"
      });
      handleClickFeeback();
    }
  };

  // SELECCIONAR LOTE DISPONIBLE
  const handleChangeLoteDisponible = ({ id }) => {
    setIdProdc(id);
  };

  return (
    <div>
      <IconButton
        aria-label="edit"
        size="large"
        disabled={disabled}
        color="primary"
        onClick={handleClickOpen}
      >
        <SearchIcon fontSize="inherit" />
      </IconButton>
      <BootstrapDialog
        maxWidth={"lg"}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle>SELECCION DE LOTE PARA TRANSFORMACION</DialogTitle>
        <DialogContent>
          {/* {JSON.stringify(dataLotesDisponibles)} */}
          {dataLotesDisponibles.length !== 0 && (
            <FilterLotesDisponibles
              lotesDisponibles={dataLotesDisponibles}
              defaultValue={idProdc}
              onNewInput={handleChangeLoteDisponible}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            color="error"
            autoFocus
            onClick={() => {
              // terminamos de procesar la salida parcial
              onConfirmOperation(idProdc);
              // cerramos el cuadro de dialogo
              handleClose();
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
};
