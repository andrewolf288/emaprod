import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  Checkbox,
  Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import { getSalidasLoteStockDisponibles } from "../../helpers/salida-venta/getSalidasLoteStockDisponibles";

const ITEM_HEIGHT = 48;
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2)
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1)
  }
}));

function parseFecha(fecha) {
  const splitFecha = fecha.split(" ");
  return splitFecha[0];
}

export const RowDetalleSalidasOrdenIrradiacionDetalle = ({
  detalle,
  onDeleteSalidaStock,
  onUpdateSalidaStock,
  onAddSalidaStock,
  setfeedbackMessages,
  handleClickFeeback
}) => {
  const [disabledInput, setdisabledInput] = useState(true);
  const { detSal } = detalle;

  return (
    <div className="mt-2">
      <p>
        <b>Detalle</b>
      </p>
      <TableContainer key={detalle.refProdc} component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#FEE7BC" }}>
            <TableRow>
              <TableCell>
                <b>Lote</b>
              </TableCell>
              <TableCell>
                <b>Cantidad</b>
              </TableCell>
              <TableCell>
                <b>Fecha inicio</b>
              </TableCell>
              <TableCell>
                <b>Fecha vencimiento</b>
              </TableCell>
              <TableCell>
                <b>Acciones</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detSal.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.codLotProd}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    onChange={(e) => {
                      onUpdateSalidaStock(detalle.idProdt, item.refProdc, e);
                    }}
                    onWheel={(e) => e.target.blur()}
                    type="number"
                    name="canSalLotProd"
                    value={item.canSalLotProd}
                    disabled={disabledInput}
                  />
                </TableCell>
                <TableCell>{parseFecha(item.fecProdIni)}</TableCell>
                <TableCell>{parseFecha(item.fecVenLotProd)}</TableCell>
                <TableCell>
                  {detalle.fueComSal === 0 ? (
                    <div className="btn-toolbar">
                      {/* <IconButton
                        aria-label="edit"
                        size="large"
                        color="warning"
                        disabled={true}
                        onClick={(e) => {
                          setdisabledInput(!disabledInput);
                        }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton> */}
                      <IconButton
                        aria-label="delete"
                        size="large"
                        color="error"
                        onClick={() => {
                          onDeleteSalidaStock(detalle.idProdt, item.refProdc);
                        }}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </div>
                  ) : (
                    <p>Sin acciones</p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* AÑADIMOS BOTON DE AÑADIR LOTE COMO SALIDA */}
      {detalle.fueComSal === 0 && (
        <div className="d-flex justify-content-center mt-3">
          <DialogSelectLoteSalida
            detalle={detalle}
            onAddSalidaStock={onAddSalidaStock}
            setfeedbackMessages={setfeedbackMessages}
            handleClickFeeback={handleClickFeeback}
          />
        </div>
      )}
    </div>
  );
};

// componente dialog
const DialogSelectLoteSalida = ({
  detalle,
  onAddSalidaStock,
  setfeedbackMessages,
  handleClickFeeback
}) => {
  const { idProdt, detSal } = detalle;
  const [dataSalidasStock, setDataSalidasStock] = useState([]);
  const [cantidadTotal, setCantidadTotal] = useState(0);

  // manejadores de dialogo
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    const dataReset = dataSalidasStock.map((element) => {
      return {
        ...element,
        canSalLotProdAct: 0
      };
    });
    setDataSalidasStock(dataReset);
  };

  // manejadores de acciones
  // funcion de traer lotes disponibles
  const traerLoteDisponibles = async () => {
    const resultPeticion = await getSalidasLoteStockDisponibles(
      idProdt,
      detSal
    );
    const { result } = resultPeticion;
    console.log(result);
    setDataSalidasStock(result);
    // setCantidadTotal(parseInt(detalle.canOpeIrraAct));
  };

  // funcion de actualizar cantidad de lote
  const updateCantidadLoteDisponible = ({ target }, refProdc) => {
    const { value } = target;
    const updateDataSalidasLote = dataSalidasStock.map((element) => {
      if (element.refProdc === refProdc) {
        return {
          ...element,
          canSalLotProdAct: value
        };
      } else {
        return element;
      }
    });
    setDataSalidasStock(updateDataSalidasLote);
  };

  // guardamos los lotes de salida
  const guardarLotesSalida = () => {
    // primero debemos comprobar que la cantidad total sea igual a la cantidad requerida
    if (detalle.canOpeIrra !== cantidadTotal) {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error:
          "Asegurate de completar la cantidad requerida"
      });
      handleClickFeeback();
    } else {
      // enviamos la informacion de las salidas de stock
      const filterSalidas = dataSalidasStock.filter((element) => {
        const parseCantidad = parseInt(element.canSalLotProdAct);
        if (!isNaN(parseCantidad) && parseCantidad > 0) {
          return true;
        } else {
          return false;
        }
      });

      const arrayAdvertencias = [];
      // ahora comprobamos que las salidas no superen la cantidad disponible
      filterSalidas.forEach((element) => {
        if (element.canSalLotProdAct > element.canSalLotProd) {
          arrayAdvertencias.push(
            `Se sobrepaso la cantidad disponible en el lote: ${element.codLotProd}`
          );
        }
      });

      if (arrayAdvertencias.length === 0) {
        onAddSalidaStock(detalle.idProdt, filterSalidas);
        handleClose();
      } else {
        const stringConSaltosDeLinea = arrayAdvertencias.join("\n");
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: stringConSaltosDeLinea
        });
        handleClickFeeback();
      }
    }
  };

  useEffect(() => {
    let cantidadLotes = 0;
    dataSalidasStock.forEach((element) => {
      const parserCantidad = parseInt(element.canSalLotProdAct);
      cantidadLotes += isNaN(parserCantidad) ? 0 : parserCantidad;
    });
    setCantidadTotal(cantidadLotes + parseInt(detalle.canOpeIrraAct));
  }, [dataSalidasStock]);

  useEffect(() => {
    traerLoteDisponibles();
  }, [detalle]);

  return (
    <div className="d-flex justify-content-center mt-3">
      <button className="btn btn-primary" onClick={handleClickOpen}>
        Añadir lote
      </button>

      <BootstrapDialog
        maxWidth={"lg"}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Lotes disponibles
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: "flex", gap: 4 }}>
            <div className="border p-2">
              <p>
                <strong>Cantidad requerida: </strong>
                <span className="text-success">{detalle.canOpeIrra}</span>
              </p>
            </div>
            <div className="border p-2">
              <p>
                <strong>Cantidad actual: </strong>
                <span
                  className={
                    detalle.canOpeIrraAct === detalle.canOpeIrra
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {detalle.canOpeIrraAct}
                </span>
              </p>
            </div>
            <div className="border p-2">
              <p>
                <strong>Cantidad total: </strong>
                <span
                  className={
                    cantidadTotal === detalle.canOpeIrra
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {cantidadTotal}
                </span>
              </p>
            </div>
          </Box>

          <TableSalidasStockDisponibles
            dataSalidasStock={dataSalidasStock}
            onChangeCantidadLote={updateCantidadLoteDisponible}
          />
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={guardarLotesSalida}
            color="primary"
            disabled={dataSalidasStock.length === 0}
            variant="contained"
          >
            Guardar
          </Button>
          <Button
            autoFocus
            onClick={handleClose}
            color="inherit"
            variant="contained"
          >
            Cerrar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
};

const TableSalidasStockDisponibles = ({
  dataSalidasStock,
  onChangeCantidadLote
}) => {
  return dataSalidasStock.length !== 0 ? (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <b>#</b>
            </TableCell>
            <TableCell align="left">
              <b>Lote</b>
            </TableCell>
            <TableCell align="center">
              <b>Cantidad Disponible</b>
            </TableCell>
            <TableCell align="center">
              <b>Cantidad salida</b>
            </TableCell>
            <TableCell align="left">
              <b>Fecha Inicio</b>
            </TableCell>
            <TableCell align="left">
              <b>Fecha Vencimiento</b>
            </TableCell>
            <TableCell align="right">
              <b>Acciones</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSalidasStock.map((salida, index) => (
            <TableRowSalidaStockDisponible
              key={index}
              salida={salida}
              index={index}
              onChangeCantidadLote={onChangeCantidadLote}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <p>No hay sugerencias de salidas de lote</p>
  );
};

const TableRowSalidaStockDisponible = ({
  salida,
  index,
  onChangeCantidadLote
}) => {
  const [checked, setChecked] = useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
    const format = {
      target: {
        value: 0
      }
    };
    onChangeCantidadLote(format, salida.refProdc);
  };

  return (
    <TableRow
      key={index}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell align="center">{index + 1}</TableCell>
      <TableCell align="left">{salida.codLotProd}</TableCell>
      <TableCell align="center">{salida.canSalLotProd}</TableCell>
      <TableCell>
        <TextField
          type="number"
          autoComplete="off"
          variant="outlined"
          size="small"
          onWheel={(e) => e.target.blur()}
          inputProps={{
            style: {
              color:
                salida.canSalLotProd < salida.canSalLotProdAct ? "red" : "green"
            }
          }}
          value={salida.canSalLotProdAct}
          disabled={!checked}
          onChange={(e) => {
            onChangeCantidadLote(e, salida.refProdc);
          }}
        />
      </TableCell>
      <TableCell align="left">{parseFecha(salida.fecProdIni)}</TableCell>
      <TableCell align="left">{parseFecha(salida.fecVenLotProd)}</TableCell>
      <TableCell align="center">
        <Checkbox
          checked={checked}
          onChange={handleChange}
          inputProps={{ "aria-label": "controlled" }}
        />
      </TableCell>
    </TableRow>
  );
};
