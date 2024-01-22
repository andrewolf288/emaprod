import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import { deleteRequisicionAgregacionDetalleById } from "../../helpers/agregaciones-lote-produccion/deleteRequisicionAgregacionDetalleById";
import { updateRequisicionAgregacionDetalleById } from "../../helpers/agregaciones-lote-produccion/updateRequisicionAgregacionDetalleById";
import { createSalidasStockRequisicionAgregacionDetalleById } from "../../helpers/agregaciones-lote-produccion/createSalidasStockRequisicionAgregacionDetalleById";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { Typography } from "@mui/material";
import { getRequisicionIngresosProductosByProduccion } from "../../helpers/producto-produccion/getRequisicionIngresosProductosByProduccion";
import { CardRequisicionIngresoProductos } from "../../components/componentes-productos-lote/CardRequisicionIngresoProductos";
import { deleteRequisicionIngresoProductoDetalleById } from "../../helpers/producto-produccion/deleteRequisicionIngresoProductoDetalleById";
import { updateRequisicionIngresoProductoDetalleById } from "../../helpers/producto-produccion/updateRequisicionIngresoProductoDetalleById";
import { createEntradaRequisicionIngresoProducto } from "../../helpers/producto-produccion/createEntradaRequisicionIngresoProducto";
import { DiaJuliano, letraAnio } from "../../../utils/functions/FormatDate";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// esta interfaz esta hecha para atender las requisiciones de agregaciones de un proceso de produccion
export const RequisicionIngresoProductos = () => {
  const location = useLocation();
  const { idLotProdc = "" } = queryString.parse(location.search);

  // ESTADOS PARA LA DATA DE DEVOLUCIONES
  const [agregacionesProduccionLote, setagregacionesProduccionLote] = useState({
    id: 0,
    canLotProd: 0,
    codLotProd: "",
    desEstPro: "",
    desProdTip: "",
    fecVenLotProd: "",
    idProdEst: 0,
    idProdTip: 0,
    idProdt: 0,
    klgLotProd: "",
    nomProd: "",
    prodDetIng: []
  });

  const {
    id,
    idProdt,
    canLotProd,
    codLotProd,
    desEstPro,
    desProdTip,
    fecVenLotProd,
    klgLotProd,
    nomProd,
    prodDetIng
  } = agregacionesProduccionLote;

  // ****** MANEJADORES DE PROGRESS LINEAR CON DIALOG ********
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // ***** FUNCIONES PARA EL MANEJO DE ACCIONES *****
  const openLoader = () => {
    setOpenDialog(true);
    setLoading(true);
  };
  const closeLoader = () => {
    setLoading(false);
    setOpenDialog(false);
  };

  // ************ ESTADO PARA CONTROLAR EL FEEDBACK **************
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

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  // funcion para editar la requisicion de agregacion
  const onDeleteDetalleRequisicionAgregacion = async (detalle) => {
    console.log(detalle);
    // abrimos el loader
    openLoader();
    const { message_error, description_error, result } =
      await deleteRequisicionIngresoProductoDetalleById(detalle);
    if (message_error.length === 0) {
      // llamamos a la data
      traerDatosProduccionLoteWithIngresosProducto();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
    // cerramos el loader
    closeLoader();
  };

  // funcion para eliminar la requisicion de agregacion
  const onUpdateDetalleRequisicionAgregacion = async (detalle, inputValue) => {
    console.log(detalle, inputValue);
    // abrimos el loader
    openLoader();
    // canReqAgrDetNew
    const { message_error, description_error, result } =
      await updateRequisicionIngresoProductoDetalleById(detalle, inputValue);
    if (message_error.length === 0) {
      // llamamos a la data
      traerDatosProduccionLoteWithIngresosProducto();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
    // cerramos el loader
    closeLoader();
  };

  // funcion para cumplir la requisicion de agregacion
  const onCheckDetalleRequisicionIngresoProducto = async (detalle) => {
    const letAniEntSto = letraAnio(detalle.fecProdIng);
    const diaJulEntSto = DiaJuliano(detalle.fecProdIng);
    const formatData = {
      ...detalle,
      letAniEntSto,
      diaJulEntSto
    };
    console.log(formatData);
    // abrimos el loader
    openLoader();
    const { message_error, description_error, result } =
      await createEntradaRequisicionIngresoProducto(formatData);
    if (message_error.length === 0) {
      // llamamos a la data
      traerDatosProduccionLoteWithIngresosProducto();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }

    // cerramos el loader
    closeLoader();
  };

  // FUNCION PARA TRAES DATOS DE PRODUCCION LOTE
  const traerDatosProduccionLoteWithIngresosProducto = async () => {
    if (idLotProdc.length !== 0) {
      const resultPeticion = await getRequisicionIngresosProductosByProduccion(
        idLotProdc
      );
      const { message_error, description_error, result } = resultPeticion;
      console.log(result);

      if (message_error.length === 0) {
        // seteamos la informacion de produccion de lote
        setagregacionesProduccionLote(result[0]);
      } else {
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error: description_error
        });
        handleClickFeeback();
      }
    }
  };

  useEffect(() => {
    // TRAEMOS LA DATA DE REQUSICION DETALLE
    traerDatosProduccionLoteWithIngresosProducto();
  }, []);

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">
          Atender requisiciones ingreso productos
        </h1>
        <div className="row mt-4 mx-4">
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de produccion</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* NUMERO DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Numero de Lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codLotProd}
                    className="form-control"
                  />
                </div>
                {/* PRODUCTO */}
                <div className="col-md-4 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={nomProd}
                    className="form-control"
                  />
                </div>
                {/* KILOGRAMOS DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso de Lote</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={klgLotProd}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={canLotProd}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3 row d-flex align-items-center">
                {/* TIPO DE PRODUCCION */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Tipo de produccion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desProdTip}
                    className="form-control"
                  />
                </div>
                {/* ESTADO DE PRODUCCION */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Estado de produccion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desEstPro}
                    className="form-control"
                  />
                </div>
                {/* FECHA DE VENCIMIENTO */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha vencimiento lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecVenLotProd}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* REQUISICIONES DE AGREGACION REGISTRADAS */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Requisiciones</h6>
            {prodDetIng.map((requisicion) => (
              <CardRequisicionIngresoProductos
                key={requisicion.id}
                requisicion={requisicion}
                onDeleteRequisicionAgregacionDetalle={
                  onDeleteDetalleRequisicionAgregacion
                }
                onUpdateRequisicionAgregacionDetalle={
                  onUpdateDetalleRequisicionAgregacion
                }
                onCheckRequisicionAgrgeacionDetalle={
                  onCheckDetalleRequisicionIngresoProducto
                }
              />
            ))}
          </div>

          {/* BOTONES DE CANCELAR Y GUARDAR */}
          <div className="btn-toolbar mt-4 mb-4">
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn btn-secondary me-2"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
      {/* LOADER CON DIALOG */}
      <Dialog open={openDialog}>
        <DialogTitle>Cargando...</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor, espere mientras se procesa la solicitud.
          </DialogContentText>
          <CircularProgress />
        </DialogContent>
      </Dialog>

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
