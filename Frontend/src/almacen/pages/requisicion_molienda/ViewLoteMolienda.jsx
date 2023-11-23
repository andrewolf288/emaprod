import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
//IMPORTACIONES PARA DIALOG DELETE
// IMPORTACIONES DE HELPER
import { RowRequisicionLoteProduccion } from "../../components/componentes-lote-produccion/RowRequisicionLoteProduccion";
import { viewMoliendaRequisicionId } from "./../../helpers/requisicion-molienda/viewMoliendaRequisicionId";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
// IMPORTACIONES PARA EL PROGRESS LINEAR
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import { createSalidasStockAutomaticas } from "./../../helpers/lote-produccion/createSalidasStockAutomaticas";
import { updateProduccionDetalleRequisicion } from "../../helpers/lote-produccion/updateProduccionDetalleRequisicion";
import { createSalidasParcialesStockAutomaticas } from "../../helpers/lote-produccion/createSalidasParcialesStockAutomaticas";
import { checkFinSalidasParcialesDetalle } from "../../helpers/lote-produccion/checkFinSalidasParcialesDetalle";
import { deleteProduccionDetalleRequisicion } from "../../helpers/lote-produccion/deleteProduccionDetalleRequisicion";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ViewLoteMolienda = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const { idReq } = useParams();
  const [produccionRequisicionDetalle, setproduccionRequisicionDetalle] =
    useState({
      idProdt: 0,
      nomProd: "",
      idProdEst: 0,
      desEstPro: "",
      idProdTip: 0,
      desProdTip: "",
      codLotProd: "",
      klgLotProd: "",
      canLotProd: "",
      fecVenLotProd: "",
      prodLotReq: [],
    });

  const {
    nomProd,
    desEstPro,
    desProdTip,
    codLotProd,
    idProdEst,
    klgLotProd,
    canLotProd,
    fecVenLotProd,
    prodLotReq,
    numop,
  } = produccionRequisicionDetalle;

  const { user } = useAuth();

  // ***** FUNCIONES Y STATES PARA FEEDBACK *****
  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackCreate, setfeedbackCreate] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
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
    requisicion_detalle.numop = numop;
    // abrimos el loader
    openLoader();
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
        feedback_description_error: "Se cumplio la requisicion exitosamente",
      });
      handleClickFeeback();
    } else {
      // cerramos el modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // funcion para crear salidas parciales
  const onCreateSalidaParcialRequisicionDetalle = async (
    requisicion_detalle,
    inputValue
  ) => {
    requisicion_detalle.numop = numop;
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
        feedback_description_error: "Se cumplio la requisicion exitosamente",
      });
      handleClickFeeback();
    } else {
      // cerramos el modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
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
        feedback_description_error: "Se cumplio la requisicion exitosamente",
      });
      handleClickFeeback();
    } else {
      // cerramos el modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
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
      cantidadNueva: cantidadNueva,
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
          "Se actualizó el detalle de la requisicion con exito",
      });
      handleClickFeeback();
    } else {
      // cerramos modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
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
        feedback_description_error: "Se cumplio la requisicion exitosamente",
      });
      handleClickFeeback();
    } else {
      // cerramos el modal
      closeLoader();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  /* 
    FUNCIONES PARA TRAER LOS DATOS DE LAS REQUISICIONES
  */
  const obtenerDataProduccionRequisicionesDetalle = async () => {
    const resultPeticion = await viewMoliendaRequisicionId(idReq);

    const { message_error, description_error, result } = resultPeticion;

    if (message_error.length === 0) {
      if (!result[0].desProdTip) {
        result[0].desProdTip = "POLVOS";
      }
      if (!result[0].id) {
        result[0].id = "-1";
      }
      result[0].numop = result[0].prodLotReq[0].codReq;
      result[0].canLotProd = result[0].prodLotReq[0].cantProg;
      result[0].nomProd = result[0].prodLotReq[0].nomProd;
      result[0].idProdEst = result[0].prodLotReq[0].idReqEst;
      // ordenamos la requisicion
      result[0].prodLotReq[0].reqDet.sort(function (a, b) {
        if (a.nomProd < b.nomProd) {
          return -1;
        }
        if (a.nomProd > b.nomProd) {
          return 1;
        }
        return 0;
      });
      setproduccionRequisicionDetalle(result[0]);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
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
        <h1 className="mt-4 text-center"> Orden Molienda</h1>
        <div className="row mt-4 mx-4">
          {/* Acciones */}
          {user.idAre === 4 && (
            <div className="card d-flex mb-4">
              <h6 className="card-header">Acciones</h6>
              <div className="card-body align-self-center">
                <Link
                  to={
                    idProdEst !== 3
                      ? "#"
                      : `/almacen/requisicion-molienda/agregar?idReq=${idReq}`
                  }
                  className={`btn btn-primary ${
                    idProdEst !== 3 ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  Registrar producto intermedio
                </Link>
              </div>
            </div>
          )}
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de Producción</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* NUMERO DE LOTE */}
                {codLotProd && (
                  <div className="col-md-2">
                    <label htmlFor="nombre" className="form-label">
                      <b>Número de Lote</b>
                    </label>
                    <input
                      type="text"
                      disabled={true}
                      value={codLotProd}
                      className="form-control"
                    />
                  </div>
                )}

                {numop && (
                  <div className="col-md-2">
                    <label htmlFor="nombre" className="form-label">
                      <b>Codigo</b>
                    </label>
                    <input
                      type="text"
                      disabled={true}
                      value={numop}
                      className="form-control"
                    />
                  </div>
                )}

                {/* PRODUCTO */}
                {nomProd && (
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
                )}

                {/* KILOGRAMOS DE LOTE */}

                {canLotProd && (
                  <div className="col-md-2">
                    <label htmlFor="nombre" className="form-label">
                      <b>Peso programado</b>
                    </label>
                    <input
                      type="number"
                      disabled={true}
                      value={canLotProd}
                      className="form-control"
                    />
                  </div>
                )}

                {/* KILOGRAMOS DE LOTE 
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
                </div>*/}
                {/* CANTIDAD DE LOTE 
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
                </div>*/}
              </div>
              <div className="mb-3 row d-flex align-items-center">
                {/* TIPO DE PRODUCCION */}
                {desProdTip && (
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
                )}
                {/* ESTADO DE PRODUCCION */}
                {desEstPro && (
                  <div className="col-md-4">
                    <label htmlFor="nombre" className="form-label">
                      <b>Estado de Producción</b>
                    </label>
                    <input
                      type="text"
                      disabled={true}
                      value={desEstPro}
                      className="form-control"
                    />
                  </div>
                )}
                {/* FECHA DE VENCIMIENTO */}
                {fecVenLotProd && (
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
                )}
              </div>
            </div>
          </div>
          {/* DATOS DE LAS REQUISICIONES */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Requisiciones</h6>
            <div className="card-body">
              {prodLotReq.map((element) => (
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
              ))}
            </div>
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
