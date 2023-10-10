import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
//IMPORTACIONES PARA DIALOG DELETE
import Button from "@mui/material/Button";
// IMPORTACIONES DE HELPER
import { RowRequisicionLoteProduccion } from "./RowRequisicionLoteProduccion";
import { viewProduccionAgregacionById } from "./../../helpers/lote-produccion/viewProduccionAgregacionById";
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
import { createSalidasStockAgregacion } from "./../../helpers/lote-produccion/createSalidasStockAgregacion";
import { DialogUpdateDetalleRequisicion } from "../../components/componentes-lote-produccion/DialogUpdateDetalleRequisicion";
import { updateProduccionDetalleRequisicion } from "../../helpers/lote-produccion/updateProduccionDetalleRequisicion";
import { useAuth } from "../../../hooks/useAuth";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AtenderAgregaciones = () => {
  const { id, codAgre } = useParams();
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

  const { user } = useAuth();

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
    //return;
    //openLoader();
    console.log(requisicion_detalle);
    const resultPeticion = await createSalidasStockAgregacion(
      requisicion_detalle
    );
    console.log(requisicion_detalle, resultPeticion);

    const { message_error, description_error, result } = resultPeticion;
    obtenerDataProduccionRequisicionesDetalle();

    if (message_error.length === 0) {
      obtenerDataProduccionRequisicionesDetalle();
      closeLoader();
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se cumplio la requisicion exitosamente",
      });
      handleClickFeeback();
    } else {
      closeLoader();
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  const showAndSetDialogUpdateDetalleRequisicion = (item) => {
    setItemSeleccionado(item);
    setshowDialogUpdate(true);
  };

  const closeDialogUpdateDetalleRequisicion = () => {
    setshowDialogUpdate(false);
    setItemSeleccionado(null);
  };

  const updateDetalleRequisicion = async (itemUpdate, cantidadNueva) => {
    const { id } = itemUpdate;
    let body = {
      id: id,
      cantidadNueva: cantidadNueva,
    };
    const resultPeticion = await updateProduccionDetalleRequisicion(body);
    const { message_error, description_error } = resultPeticion;
    if (message_error.length === 0) {
      obtenerDataProduccionRequisicionesDetalle();
      closeDialogUpdateDetalleRequisicion();
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error:
          "Se actualizó el detalle de la requisicion con exito",
      });
      handleClickFeeback();
    } else {
      closeDialogUpdateDetalleRequisicion();
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // funcion para obtener la produccion con sus requisiciones y su detalle
  const obtenerDataProduccionRequisicionesDetalle = async () => {
    const resultPeticion = await viewProduccionAgregacionById(id, codAgre);

    const { message_error, description_error, result } = resultPeticion;

    var sss = [];
    result[0].agregaciones.map((obj) => {
      sss.push({
        canReqDet: obj.canProdAgr,
        desReqDetEst: obj.desReqDetEst ? obj.desReqDetEst : "requerido",
        id: "",
        idProdt: obj.idProdt,
        idReq: "",
        idAgre: obj.idAgre,
        numop: result[0].numop + " - " + codAgre,
        idReqDetEst: obj.idReqDetEst ? obj.idReqDetEst : 1,
        nomProd: obj.nomProd,
        simMed: obj.simMed,
        idAlmDes: obj.idAlm,
      });
    });

    console.log(resultPeticion);
    //console.log(sss);

    var ddd = {};
    ddd.desAre = "";
    ddd.desReqEst = "";
    ddd.fecEntReq = "";
    ddd.fecPedReq = "";
    ddd.id = "";
    ddd.idAre = "";
    ddd.idProdc = "";
    ddd.idReqEst = "";

    ddd.reqDet = sss;
    result[0].agregaciones2 = [];
    result[0].agregaciones2[0] = ddd;

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
        <h1 className="mt-4 text-center">Orden de agregacion</h1>
        <div className="row mt-4 mx-4">
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
                    value={produccionRequisicionDetalle.codLotProd}
                    className="form-control"
                  />
                </div>

                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Codigo Agre.</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={produccionRequisicionDetalle.numop + " - " + codAgre}
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
                    value={produccionRequisicionDetalle.nomProd}
                    className="form-control"
                  />
                </div>

                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={produccionRequisicionDetalle.klgLotProd}
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
                    value={produccionRequisicionDetalle.canLotProd}
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
                    value={produccionRequisicionDetalle.desProdTip}
                    className="form-control"
                  />
                </div>
                {/**
                  <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Estado de Producción</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={produccionRequisicionDetalle.desEstPro}
                    className="form-control"
                  />
                </div>
                 */}

                {/**
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
                   */}
              </div>
            </div>
          </div>
          {/* DATOS DE LAS REQUISICIONES */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Requisiciones</h6>
            <div className="card-body">
              {produccionRequisicionDetalle?.agregaciones2?.map((element) => {
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
