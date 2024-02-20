import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
// IMPORTACIONES DE HELPER
import { RowRequisicionLoteProduccion } from "../../components/componentes-lote-produccion/RowRequisicionLoteProduccion";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
// IMPORTACIONES PARA EL PROGRESS LINEAR
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  CircularProgress
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { createSalidasStockAutomaticas } from "./../../helpers/lote-produccion/createSalidasStockAutomaticas";
import { updateProduccionDetalleRequisicion } from "../../helpers/lote-produccion/updateProduccionDetalleRequisicion";
import { deleteProduccionDetalleRequisicion } from "../../helpers/lote-produccion/deleteProduccionDetalleRequisicion";
import { checkFinSalidasParcialesDetalle } from "../../helpers/lote-produccion/checkFinSalidasParcialesDetalle";
import { createSalidasParcialesStockAutomaticas } from "../../helpers/lote-produccion/createSalidasParcialesStockAutomaticas";
import { getOrdenTransformacionById } from "../../helpers/orden-transformacion/getOrdenTransformacionById";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ViewOrdenTransformacion = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const { id } = useParams();
  const navigate = useNavigate();

  const [ordenTransformacionDetalle, setordenTransformacionDetalle] = useState({
    idProdtInt: 0,
    idProdc: 0,
    codLotProd: "",
    idProdtOri: 0,
    nomProd1: "",
    canUndProdtOri: 0,
    idProdtDes: 0,
    nomProd2: "",
    canUndProdtDes: 0,
    fecCreOrdTrans: "",
    prodLotReq: []
  });

  const {
    idProdtOri,
    nomProd1,
    canUndProdtOri,
    canPesProdtOri,
    idProdtDes,
    nomProd2,
    canUndProdtDes,
    canPesProdtDes,
    prodLotReq
  } = ordenTransformacionDetalle;

  const { user } = useAuth();

  // ***** FUNCIONES Y STATES PARA FEEDBACK *****
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

  // ******* ACCIONES DE DETALLES DE REQUISICION *********

  // crear salidas correspondientes
  const onCreateSalidaTotalRequisicionDetalle = async (requisicion_detalle) => {
    // abrimos el loader
    openLoader();
    console.log(requisicion_detalle);
    const resultPeticion = await createSalidasStockAutomaticas(
      requisicion_detalle
    );

    const { message_error, description_error, result } = resultPeticion;

    if (message_error?.length === 0) {
      // volvemos a consultar la data
      obtenerDataProduccionRequisicionesDetalle();
      // cerramos modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se cumplio la requisicion exitosamente"
      });
      handleClickFeeback();
    } else {
      // cerramos el modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
  };

  // funcion para crear salidas parciales
  const onCreateSalidaParcialRequisicionDetalle = async (
    requisicion_detalle,
    inputValue
  ) => {
    // abrimos el loader
    openLoader();
    const resultPeticion = await createSalidasParcialesStockAutomaticas(
      requisicion_detalle,
      inputValue
    );

    const { message_error, description_error, result } = resultPeticion;

    if (message_error?.length === 0) {
      // volvemos a consultar la data
      obtenerDataProduccionRequisicionesDetalle();
      // cerramos modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se cumplio la requisicion exitosamente"
      });
      handleClickFeeback();
    } else {
      // cerramos el modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
  };

  // funcion para terminar el ingreso de salidas parciales
  const onTerminarSalidaParcialRequisicionDetalle = async (
    requisicion_detalle
  ) => {
    // abrimos el loader
    openLoader();
    const resultPeticion = await checkFinSalidasParcialesDetalle(
      requisicion_detalle
    );

    const { message_error, description_error, result } = resultPeticion;

    if (message_error?.length === 0) {
      // volvemos a consultar la data
      obtenerDataProduccionRequisicionesDetalle();
      // cerramos modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se cumplio la requisicion exitosamente"
      });
      handleClickFeeback();
    } else {
      // cerramos el modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
  };

  // actualizar detalle de requisicion
  const onUpdateRequisicionDetalle = async (
    requisicion_detalle,
    cantidadNueva
  ) => {
    // abrimos el loader
    openLoader();
    const { id } = requisicion_detalle;
    let body = {
      id: id,
      cantidadNueva: cantidadNueva
    };
    const resultPeticion = await updateProduccionDetalleRequisicion(body);
    const { message_error, description_error } = resultPeticion;
    if (message_error.length === 0) {
      // actualizamos la cantidad
      obtenerDataProduccionRequisicionesDetalle();
      // cerramos modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error:
          "Se actualizó el detalle de la requisicion con exito"
      });
      handleClickFeeback();
    } else {
      // cerramos modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
  };

  // funcion para eliminar el detalle de la requisicion
  const onDeleteRequisicionDetalle = async (requisicion_detalle) => {
    // abrimos el loader
    openLoader();
    const resultPeticion = await deleteProduccionDetalleRequisicion(
      requisicion_detalle
    );

    const { message_error, description_error, result } = resultPeticion;

    if (message_error?.length === 0) {
      // volvemos a consultar la data
      obtenerDataProduccionRequisicionesDetalle();
      // cerramos modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se cumplio la requisicion exitosamente"
      });
      handleClickFeeback();
    } else {
      // cerramos el modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
  };

  // funcion para obtener la produccion con sus requisiciones y su detalle
  const obtenerDataProduccionRequisicionesDetalle = async () => {
    const resultPeticion = await getOrdenTransformacionById(id);
    const { message_error, description_error, result } = resultPeticion;

    if (message_error.length === 0) {
      setordenTransformacionDetalle(result[0]);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
  };

  useEffect(() => {
    obtenerDataProduccionRequisicionesDetalle();
  }, []);

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Orden Transformación</h1>
        <div className="row mt-4 mx-4">
          {/* Acciones */}
          <div className="card d-flex mb-4">
            <h6 className="card-header">Acciones</h6>
            <div className="card-body align-self-center">
              <div
                onClick={() => {
                  navigate(`/almacen/orden-transformacion/viewIngresos/${id}`);
                }}
                className="btn btn-primary"
              >
                Requisiciones de ingresos
              </div>
              <div
                onClick={() => {
                  navigate(
                    `/almacen/orden-transformacion/viewDevolucion/${id}`
                  );
                }}
                className="btn btn-warning ms-3"
              >
                Requisiciones de devolucion
              </div>
            </div>
          </div>
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de orden de transformación</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* PRODUCTO ORIGEN */}
                <div className="col-md-4 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto origen</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={nomProd1}
                    className="form-control"
                  />
                </div>

                {/* CANTIDAD UNIDADES ORIGEN */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad origen</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${canUndProdtOri} UND`}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DE PESO ORIGEN */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso origen</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${canPesProdtOri} KG`}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3 row d-flex align-items-center">
                {/* PRODUCTO DESTINO */}
                <div className="col-md-4 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto destino</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={nomProd2}
                    className="form-control"
                  />
                </div>

                {/* CANTIDAD UNIDADES DESTINO*/}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad destino</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${canUndProdtDes} UND`}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DE PESO DESTINO*/}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso destino</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${canPesProdtDes} KG`}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* DATOS DE LAS REQUISICIONES */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Requisiciones</h6>
            <div className="card-body">
              {prodLotReq.map((element) => {
                return (
                  <RowRequisicionLoteProduccion
                    key={element.id}
                    requisicion={element}
                    onUpdateDetalleRequisicion={onUpdateRequisicionDetalle}
                    onDeleteDetalleRequisicion={onDeleteRequisicionDetalle}
                    onCreateSalidaTotal={onCreateSalidaTotalRequisicionDetalle}
                    onCreateSalidaParcial={
                      onCreateSalidaParcialRequisicionDetalle
                    }
                    onTerminarSalidaParcial={
                      onTerminarSalidaParcialRequisicionDetalle
                    }
                    show={user.idAre === 1}
                  />
                );
              })}
            </div>
            <div className="btn-toolbar mt-4">
              <button
                type="button"
                onClick={() => {
                  window.close();
                }}
                className="btn btn-secondary me-2"
              >
                Cerrar
              </button>
            </div>
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
          {feedback_description_error}
        </Alert>
      </Snackbar>
    </>
  );
};
