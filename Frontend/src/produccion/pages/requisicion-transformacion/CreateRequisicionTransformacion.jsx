import React, { useState } from "react";
import { FilterProductoProduccionDynamic } from "../../../components/ReferencialesFilters/Producto/FilterProductoProduccionDynamic";
import { Snackbar, Typography } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { ComponentSearchLotesDisponibles } from "../../components/componentes-transdormacion/ComponentSearchLotesDisponibles";
import { getProductosDisponiblesByLote } from "../../helpers/requisicion-transformacion/getProductosDisponiblesByLote";
import { getProductosDisponiblesByProductoIntermedio } from "../../helpers/requisicion-transformacion/getProductosDisponiblesByProductoIntermedio";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const CreateRequisicionTransformacion = () => {
  // data productos finales por lote
  const [productosFinalesDisponiblesLote, setProductosFinalesDisponiblesLote] =
    useState([]);
  const [valueProductoOrigenSeleccionado, setValueProductoOrigenSeleccionado] =
    useState(null);
  // data productos finales por producto intermedio
  const [
    productosFinalesDisponiblesProductoIntermedio,
    setProductosFinalesDisponiblesProductoIntermedio
  ] = useState([]);
  const [
    valueProductoDestinoSeleccionado,
    setValueProductoDestinoSeleccionado
  ] = useState(null);
  // data de requisicion de transformacion
  const [requisicionTransformacion, setRequisicionTransformacion] = useState({
    idProdtInt: 0,
    idProdc: 0,
    codLotProd: "",
    idProdtOri: 0,
    canUndProdtOri: 0,
    canPesProdtOri: 0,
    idProdtDes: 0,
    canUndProdtDes: 0,
    canPesProdtDes: 0
  });
  const {
    idProdtInt,
    idProdc,
    codLotProd,
    idProdtOri,
    canUndProdtOri,
    canPesProdtOri,
    idProdtDes,
    canUndProdtDes,
    canPesProdtDes
  } = requisicionTransformacion;

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackCreate, setfeedbackCreate] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: ""
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackCreate(true);
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackCreate(false);
  };

  // funcion para producto intermedio
  const onAddProductoProduccion = async ({ id }) => {
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      idProdtInt: id
    });
  };

  // cambiar producto origen
  const onAddProductoFinalOrigen = (event) => {
    const { target } = event;
    console.log(target.value);
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      idProdtOri: target.value
    });
    // buscamos el elemento de origen
    const valueFind = productosFinalesDisponiblesLote.find(
      (element) => element.idProd === target.value
    );
    setValueProductoOrigenSeleccionado(valueFind);
  };

  // cambiar producto destino
  const onAddProductoFinalDestino = (event) => {
    const { target } = event;
    console.log(target.value);
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      idProdtDes: target.value
    });
    // buscamos el elemento de origen
    const valueFind = productosFinalesDisponiblesProductoIntermedio.find(
      (element) => element.idProdFin === target.value
    );
    setValueProductoDestinoSeleccionado(valueFind);
  };
  // funcion que selecciona un lote de produccion y trae sus productos finales disponibles
  const onAddLoteProduccion = async (idProdc) => {
    console.log(idProdc);
    // primero seteamos el valor
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      idProdc: idProdc
    });
    // ahora debemos consultar los productos finales por lote
    const resultPeticionA = await getProductosDisponiblesByLote(idProdc);
    const {
      result: resultA,
      message_error: message_errorA,
      description_error: description_errorA
    } = resultPeticionA;
    if (message_errorA.length === 0) {
      console.log(resultA);
      setProductosFinalesDisponiblesLote(resultA);
      // reset producto destino
      resetProductoOrigen();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_errorA
      });
      handleClickFeeback();
    }

    console.log(idProdtInt);
    // ahora debemos consultar los posibles productos finales por producto intermedio
    const resultPeticionB = await getProductosDisponiblesByProductoIntermedio(
      idProdtInt
    );
    const {
      result: resultB,
      message_error: message_errorB,
      description_error: description_errorB
    } = resultPeticionB;
    if (message_errorB.length === 0) {
      console.log(resultB);
      setProductosFinalesDisponiblesProductoIntermedio(resultB);
      // reseteamos el producto
      resetProductoDestino();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_errorB
      });
      handleClickFeeback();
    }
  };

  // reset producto origen
  const resetProductoOrigen = () => {
    // reseteamos el valor del producto
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      idProdtOri: 0
    });

    // reseteamos el elemento seleccionado
    setValueProductoOrigenSeleccionado(null);
  };

  // reset producto destino
  const resetProductoDestino = () => {
    // reseteamos el valor del producto
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      idProdtDes: 0
    });
    // reseteamos el elemento seleccionado
    setValueProductoDestinoSeleccionado(null);
  };

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Crear Orden de transformacion</h1>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de Producción</h6>
            <div className="card-body">
              <form>
                <div className="mb-3 row">
                  <div className="col-md-6 me-4">
                    <label htmlFor="nombre" className="form-label">
                      <b>Producto Intermedio</b>
                    </label>
                    <FilterProductoProduccionDynamic
                      defaultValue={idProdtInt}
                      onNewInput={onAddProductoProduccion}
                    />
                  </div>
                  <div className="col-md-2 d-flex">
                    <div className="col">
                      <label htmlFor="nombre" className="form-label">
                        <b>Número de Lote</b>
                      </label>
                      <input
                        type="text"
                        name="codLotProd"
                        value={codLotProd}
                        className="form-control"
                        readOnly
                      />
                    </div>
                    <ComponentSearchLotesDisponibles
                      idProdtInt={idProdtInt}
                      handleClickFeeback={handleClickFeeback}
                      setfeedbackMessages={setfeedbackMessages}
                      onConfirmOperation={onAddLoteProduccion}
                      disabled={idProdtInt === 0}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Detalle de transformacion</h6>
            <div className="card-body row">
              <div className="col">
                <div className="card d-flex">
                  <h6 className="card-header">Producto origen</h6>
                  <div className="card-body">
                    {/* MANEJADORES DE CANTIDADES EN PRODUCTOS DE ORIGEN */}
                    <div className="row mb-4">
                      <div className="col">
                        <label htmlFor="nombre" className="form-label">
                          <b>Can. unidades</b>
                        </label>
                        <input
                          type="number"
                          value={canUndProdtOri}
                          disabled={idProdtOri === 0}
                        />
                      </div>
                      <div className="col">
                        <label htmlFor="nombre" className="form-label">
                          <b>Can. peso</b>
                        </label>
                        <input
                          type="number"
                          value={canPesProdtOri}
                          disabled={idProdtOri === 0}
                        />
                      </div>
                    </div>
                    {/* PRODUCTOS */}
                    <FormControl>
                      <FormLabel id="demo-radio-buttons-group-label">
                        Productos
                      </FormLabel>
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        name="radio-buttons-group"
                        value={idProdtOri}
                        onChange={onAddProductoFinalOrigen}
                      >
                        {productosFinalesDisponiblesLote.map((element) => (
                          <FormControlLabel
                            key={element.idProd}
                            value={element.idProd}
                            control={<Radio />}
                            label={`${element.nomProd} / can: ${element.canTotDis}`}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card d-flex">
                  <h6 className="card-header">Productos destino</h6>
                  <div className="card-body">
                    {/* MANEJADORES DE CANTIDADES EN PRODUCTOS DE DESTINO */}
                    <div className="row mb-4">
                      <div className="col">
                        <label htmlFor="nombre" className="form-label">
                          <b>Can. unidades</b>
                        </label>
                        <input
                          type="number"
                          value={canUndProdtDes}
                          disabled={idProdtDes === 0}
                        />
                      </div>
                      <div className="col">
                        <label htmlFor="nombre" className="form-label">
                          <b>Can. peso</b>
                        </label>
                        <input
                          type="number"
                          value={canPesProdtDes}
                          disabled={idProdtDes === 0}
                        />
                      </div>
                    </div>
                    {/* PRODUCTOS */}
                    <FormControl>
                      <FormLabel id="demo-radio-buttons-group-label">
                        Productos
                      </FormLabel>
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        name="radio-buttons-group"
                        value={idProdtDes}
                        onChange={onAddProductoFinalDestino}
                      >
                        {productosFinalesDisponiblesProductoIntermedio.map(
                          (element) => (
                            <FormControlLabel
                              key={element.idProdFin}
                              value={element.idProdFin}
                              control={<Radio />}
                              label={element.nomProd}
                            />
                          )
                        )}
                      </RadioGroup>
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>
            {/* BOTON DE GENERACION */}
          </div>
        </div>
      </div>

      {/* FEEDBACK AGREGAR MATERIA PRIMA */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={feedbackCreate}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={style_message}
          sx={{ width: "100%" }}
        >
          <Typography whiteSpace={"pre-line"}>
            {feedback_description_error}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};
