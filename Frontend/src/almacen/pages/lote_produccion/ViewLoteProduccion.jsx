import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
//IMPORTACIONES PARA DIALOG DELETE
import Button from "@mui/material/Button";
// IMPORTACIONES DE HELPER
import { RowRequisicionLoteProduccion } from "../../components/componentes-lote-produccion/RowRequisicionLoteProduccion";
import { viewProduccionRequisicionDetalleById } from "./../../helpers/lote-produccion/viewProduccionRequisicionDetalleById";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
// IMPORTACIONES PARA EL PROGRESS LINEAR
import {
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  CircularProgress,
  TextField,
} from "@mui/material";
import { createSalidasStockAutomaticas } from "./../../helpers/lote-produccion/createSalidasStockAutomaticas";
import { DialogUpdateDetalleRequisicion } from "../../components/componentes-lote-produccion/DialogUpdateDetalleRequisicion";
import { updateProduccionDetalleRequisicion } from "../../helpers/lote-produccion/updateProduccionDetalleRequisicion";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ViewLoteProduccion = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const { id } = useParams();
  const navigate = useNavigate();

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

  // ****** MANEJADORES DE DIALOG UPDATE CANTIDAD *******
  const [showDialogUpdate, setshowDialogUpdate] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

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
  const onCreateSalidasStock = async (requisicion_detalle) => {
    openLoader();
    const resultPeticion = await createSalidasStockAutomaticas(
      requisicion_detalle
    );

    //console.log(requisicion_detalle, resultPeticion);
    //return;
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
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

  // mostrar y setear dialog update de detalle de requisicion
  const showAndSetDialogUpdateDetalleRequisicion = (item) => {
    // establecemos los valores
    setItemSeleccionado(item);
    // abrimos el modal
    setshowDialogUpdate(true);
  };

  const closeDialogUpdateDetalleRequisicion = () => {
    setshowDialogUpdate(false);
    setItemSeleccionado(null);
  };

  // actualizar detalle de requisicion
  const updateDetalleRequisicion = async (itemUpdate, cantidadNueva) => {
    const { id } = itemUpdate;
    let body = {
      id: id,
      cantidadNueva: cantidadNueva,
    };
    const resultPeticion = await updateProduccionDetalleRequisicion(body);
    const { message_error, description_error } = resultPeticion;
    if (message_error.length === 0) {
      // actualizamos la cantidad
      obtenerDataProduccionRequisicionesDetalle();
      // cerramos el modal
      closeDialogUpdateDetalleRequisicion();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error:
          "Se actualizó el detalle de la requisicion con exito",
      });
      handleClickFeeback();
    } else {
      // cerramos el modal
      closeDialogUpdateDetalleRequisicion();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // funcion para obtener la produccion con sus requisiciones y su detalle
  const obtenerDataProduccionRequisicionesDetalle = async () => {
    const resultPeticion = await viewProduccionRequisicionDetalleById(id);

    //numop

    const { message_error, description_error, result } = resultPeticion;

    // console.log(result[0].prodLotReq);

    //result[0].prodLotReq = result[0].prodLotReq.reverse();
    result[0].prodLotReq.map((obj) => {
      obj.reqDet.map((obj) => {
        obj.numop = result[0].numop;
      });
    });

    console.log(result[0].prodLotReq);

    if (message_error.length === 0) {
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
        <h1 className="mt-4 text-center">Produccion Lote</h1>
        <div className="row mt-4 mx-4">
          {/* Acciones */}
          <div className="card d-flex mb-4">
            <h6 className="card-header">Acciones</h6>
            <div className="card-body align-self-center">
              {/* <div
                onClick={() => {
                  //console.log(prodLotReq);
                  let result = prodLotReq.every(
                    (value) => value.idReqEst === 3 // estado completado
                  );
                  if (result) {
                    navigate(`/almacen/productos-lote/crear?idLotProdc=${id}`);
                  }
                }}
                className="btn btn-primary"
              >
                Registrar Productos Finales
              </div> */}
              <div
                onClick={() => {
                  // navigate(
                  //   `/almacen/produccion-devoluciones/crear?idLotProdc=${id}`
                  // );
                  console.log("Requisicion de devolucion");
                }}
                className="btn btn-warning ms-3"
              >
                Requisiciones de devolucion
              </div>
              <div
                onClick={() => {
                  navigate(
                    `/almacen/produccion-agregaciones/atender-requisiciones?idLotProdc=${id}`
                  );
                }}
                className="btn btn-danger ms-3"
              >
                Requisiciones de Agregacion
              </div>
            </div>
          </div>
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de Producción</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* NUMERO DE LOTE */}
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

                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Número OP</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={numop}
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

                {/* CANTIDAD DE LOTE      swap [catidad,pesolote]******************************/}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={klgLotProd}
                    className="form-control"
                  />
                </div>

                {/* KILOGRAMOS DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso de Lote Total</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={canLotProd}
                    className="form-control"
                  />
                </div>

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
                    <b>Estado de Producción</b>
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
          {/* DATOS DE LAS REQUISICIONES */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Requisiciones</h6>
            <div className="card-body">
              {prodLotReq.map((element) => {
                {
                  /**  
               if(user.idAre === 4 && element.idAre == 2){
                } */
                }
                return (
                  <RowRequisicionLoteProduccion
                    key={element.id}
                    onCreateSalidasStock={onCreateSalidasStock}
                    onUpdateDetalleRequisicion={
                      showAndSetDialogUpdateDetalleRequisicion
                    }
                    requisicion={element}
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

      {/* DIALOG UPDATE DETALLE REQUISICION */}
      {showDialogUpdate && (
        <DialogUpdateDetalleRequisicion
          itemUpdate={itemSeleccionado}
          onClose={closeDialogUpdateDetalleRequisicion}
          onUpdateItemSelected={updateDetalleRequisicion}
        />
      )}

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
