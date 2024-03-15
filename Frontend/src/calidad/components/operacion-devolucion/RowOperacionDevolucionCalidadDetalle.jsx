import AddCircle from "@mui/icons-material/AddCircle";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography
} from "@mui/material";
import React, { useState } from "react";
import FechaPickerYearAndMonthDynamic from "../../../components/Fechas/FechaPickerYearAndMonthDynamic";
import { searchLoteProduccion } from "../../helpers/operacion-devolucion/searchLoteProduccion";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";

export const RowOperacionDevolucionCalidadDetalle = ({
  nomProd,
  detalle,
  onChangeValueDetalle,
  onAddLoteProduccion,
  onAddDetalleCambioProdutos,
  onChangeDetalleCambioProductos
}) => {
  const {
    index,
    fecVenLotProd,
    codLotProd,
    canLotProd,
    pH,
    consistencia30,
    consistencia60,
    color,
    sabor,
    olor,
    observacion,
    esReproceso,
    esDetCamProd,
    detCamProd
  } = detalle;

  // HANDLE CHANGE INPUT NAME
  const handleChangeInputName = ({ target }) => {
    const { name, value } = target;
    onChangeValueDetalle(index, name, value);
  };

  // HANDLE GENERAR DETALLE CAMBIO DE PRODUCTOS
  const handleGenerarDetalleCambio = () => {
    onAddDetalleCambioProdutos(index, detalle);
  };

  //HANDLE CHANGE DETALLE DE CAMBIO DE PRODUCTOS
  const handleChangeCheckDetalleCambio = ({ target }) => {
    onChangeDetalleCambioProductos(index, target);
  };

  return (
    <div className="card mb-5">
      <div className="card-header">
        <div className="form-group row">
          <div className="col">
            <div className="row d-flex align-items-center">
              <label htmlFor="lote" className="col-form-label col-2">
                LOTE:
              </label>
              <div className="col-2">
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={codLotProd}
                />
              </div>
              {codLotProd.length !== 0 && (
                <div className="col-3">{mostrarMesYAnio(fecVenLotProd)}</div>
              )}
              <div className="col-2">
                <DialogSearchCreateionLote
                  dataDetalle={detalle}
                  handleConfirm={onAddLoteProduccion}
                />
              </div>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <label htmlFor="lote" className="col-form-label col-3">
                CANTIDAD:
              </label>
              <div className="col-3">
                <input
                  type="number"
                  name="canLotProd"
                  className="form-control"
                  value={canLotProd}
                  onChange={handleChangeInputName}
                  onWheel={(e) => e.target.blur()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col">
            <h5 className="card-title mb-4">C. Fisicoquímicas</h5>
            <div className="form-group row mb-3">
              <label htmlFor="ph" className="col-sm-4 col-form-label">
                pH:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={pH}
                  name="pH"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
            <div className="form-group row mb-3">
              <label
                htmlFor="consistencia30"
                className="col-sm-4 col-form-label"
              >
                Consistencia 30:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={consistencia30}
                  name="consistencia30"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
            <div className="form-group row mb-3">
              <label
                htmlFor="consistencia60"
                className="col-sm-4 col-form-label"
              >
                Consistencia 60:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={consistencia60}
                  name="consistencia60"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
          </div>
          <div className="col">
            <h5 className="card-title mb-4">C. Organoeléctricas</h5>
            <div className="form-group row mb-3">
              <label htmlFor="color" className="col-sm-4 col-form-label">
                Color:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={color}
                  name="color"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
            <div className="form-group row mb-3">
              <label htmlFor="sabor" className="col-sm-4 col-form-label">
                Sabor:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={sabor}
                  name="sabor"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
            <div className="form-group row mb-3">
              <label htmlFor="olor" className="col-sm-4 col-form-label">
                Olor:
              </label>
              <div className="col-sm-8">
                <input
                  type="text"
                  className="form-control"
                  value={olor}
                  name="olor"
                  onChange={handleChangeInputName}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col">
            <textarea
              className="form-control"
              placeholder="Observaciones"
              value={observacion}
              name="observacion"
              onChange={handleChangeInputName}
            ></textarea>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6 d-flex align-items-center">
            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">
                Acción
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="esReproceso"
                value={esReproceso}
                onChange={handleChangeInputName}
              >
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Reproceso"
                />
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label="Desmedro"
                />
              </RadioGroup>
            </FormControl>
          </div>
          <div className="col-6 d-flex align-items-center">
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="esDetCamProd"
                    checked={esDetCamProd}
                    onChange={(e) => {
                      const auxE = {
                        target: {
                          name: e.target.name,
                          value: e.target.checked
                        }
                      };
                      handleChangeCheckDetalleCambio(auxE);
                    }}
                  />
                }
                label="Detalle cambio producto"
              />
            </FormGroup>
            {esDetCamProd && (
              <Button
                color="primary"
                variant="contained"
                startIcon={<AddCircle fontSize="small" />}
                onClick={handleGenerarDetalleCambio}
              >
                Generar
              </Button>
            )}
          </div>
        </div>
        {/* card de detalle de cambio */}
        {esDetCamProd && detCamProd.length !== 0 && (
          <div className="card mt-4">
            <div className="card-header">
              <h5>Detalle de cambio de producto</h5>
            </div>
            <div className="card-body">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Lote</th>
                    <th scope="col">Fecha vencimiento</th>
                    <th scope="col">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {detCamProd.map((element, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{nomProd}</td>
                      <td>{element["codLotProd"]}</td>
                      <td>{element["fecVenLotProd"]}</td>
                      <td>{element["canSalLotProd"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// DIALOGO DE CREACION/BUSQUEDA DE LOTES DE PRODUCCION
const DialogSearchCreateionLote = ({ dataDetalle, handleConfirm }) => {
  // manejador de dialog
  const [open, setOpen] = useState(false);
  // manejador de datos
  const [dataProduccion, setDataProduccion] = useState({
    codLotProd: "",
    fecProdIni: "",
    fecVenLotProd: "",
    creacionAutomatica: false,
    sensibleMes: false
  });

  const {
    codLotProd,
    fecProdIni,
    fecVenLotProd,
    creacionAutomatica,
    sensibleMes
  } = dataProduccion;

  const [flagDateChange, setFlagDateChange] = useState(true);

  const handleFlagDateChange = () => {
    console.log(dataProduccion);
    // hablamos de fecha de inicio
    setDataProduccion((prevData) => {
      if (flagDateChange) {
        return {
          ...prevData,
          fecProdIni: ""
        };
      } else {
        return {
          ...prevData,
          fecVenLotProd: ""
        };
      }
    });
    setFlagDateChange((prevFlag) => !prevFlag);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // handle text lote
  const handleChangeLote = ({ target }) => {
    const { name, value } = target;
    setDataProduccion({
      ...dataProduccion,
      [name]: value
    });
  };

  // handle fecha inicio produccion
  const handleChangeDateInicioProduccion = (newfec) => {
    setDataProduccion({
      ...dataProduccion,
      fecProdIni: newfec
    });
  };

  // handle fecha vencimiento produccion
  const handleChangeDateVencimientoProduccion = (newfec) => {
    setDataProduccion({
      ...dataProduccion,
      fecVenLotProd: newfec
    });
  };

  // handle check creacion automatica
  const handleChangeCheckCreacionAutomatica = ({ target }) => {
    const { name, checked } = target;
    setDataProduccion({
      ...dataProduccion,
      [name]: checked
    });
  };

  // handle check sensible mes
  const handleChangeCheckSensibleMes = ({ target }) => {
    const { name, checked } = target;
    setDataProduccion({
      ...dataProduccion,
      [name]: checked
    });
  };

  const handleFormSubmit = async () => {
    let handleErrors = "";
    if (
      codLotProd.length === 0 ||
      (fecProdIni.length === 0 && fecVenLotProd.length === 0) ||
      codLotProd.length > 3
    ) {
      if (codLotProd.length === 0) {
        handleErrors += "No proporcionaste un lote\n";
      }

      if (codLotProd.length > 3) {
        handleErrors += "El lote tiene más de 3 dígitos\n";
      }

      if (fecProdIni.length === 0 && fecVenLotProd.length === 0) {
        handleErrors +=
          "Debes proporcionar al menos una fecha (inicio o vencimiento)\n";
      }
      alert(handleErrors);
    } else {
      const formatData = {
        idProdt: dataDetalle["idProdt"],
        ...dataProduccion
      };
      console.log(formatData);
      const resultPeticion = await searchLoteProduccion(formatData);
      console.log(resultPeticion);
      const { message_error, description_error, result } = resultPeticion;
      if (message_error.length === 0) {
        console.log(result);
        // llamamos al handleConfirm
        handleConfirm(dataDetalle.index, result);
        // cerramos el dialogo
        handleClose();
      } else {
        alert(description_error);
      }
    }
  };

  return (
    <>
      <IconButton color="primary" onClick={handleClickOpen}>
        <AddCircle fontSize="large" />
      </IconButton>
      <Dialog open={open} onClose={handleClose} maxWidth="xs">
        <DialogTitle>
          <Typography>Creación o busqueda de lotes</Typography>
        </DialogTitle>
        <DialogContent>
          <div className="row">
            <div className="d-flex">
              <label htmlFor="lote" className="col-form-label col-2">
                Lote:
              </label>
              <div className="col-3">
                <input
                  type="number"
                  name="codLotProd"
                  className="form-control"
                  value={codLotProd}
                  onChange={handleChangeLote}
                />
              </div>
            </div>
            <div className="col mt-3">
              <div className="row d-flex align-items-center">
                <div className="col-md-4">
                  <label className="col-form-label">
                    {flagDateChange
                      ? "Fecha de inicio producción"
                      : "Fecha de vencimiento producción"}
                  </label>
                </div>
                {flagDateChange ? (
                  <div className="col-md-6">
                    <FechaPickerYearAndMonthDynamic
                      dateValue={fecProdIni}
                      onNewfecEntSto={handleChangeDateInicioProduccion}
                    />
                  </div>
                ) : (
                  <div className="col-md-6">
                    <FechaPickerYearAndMonthDynamic
                      dateValue={fecVenLotProd}
                      onNewfecEntSto={handleChangeDateVencimientoProduccion}
                    />
                  </div>
                )}
                <div className="col-md-2">
                  <IconButton onClick={handleFlagDateChange} color="primary">
                    <ChangeCircleIcon />
                  </IconButton>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-start pe-0 ps-0 mt-2">
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Checkbox
                    name="creacionAutomatica"
                    checked={creacionAutomatica}
                    onChange={handleChangeCheckCreacionAutomatica}
                  />
                }
                label="Crear si no se encuentra"
              />
            </div>
            <div className="d-flex justify-content-start pe-0 ps-0 mt-2">
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Checkbox
                    name="sensibleMes"
                    checked={sensibleMes}
                    onChange={handleChangeCheckSensibleMes}
                  />
                }
                label="Sensible al mes"
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose} color="error">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            color="primary"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

function mostrarMesYAnio(fechaString) {
  const fecha = new Date(fechaString);
  const mes = fecha.toLocaleString("default", { month: "long" });
  const año = fecha.getFullYear();
  return `${mes} ${año}`;
}
