import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { CardRequisicionDevolucion } from "../../components/componentes-devoluciones/CardRequisicionDevolucion";
import { deleteRequisicionDevolucionDetalleById } from "../../helpers/devoluciones-lote-produccion/deleteRequisicionDevolucionDetalleById";
import { updateRequisicionDevolucionDetalleById } from "../../helpers/devoluciones-lote-produccion/updateRequisicionDevolucionDetalleById";
import { createEntradasStockRequisicionDevolucionDetalle } from "../../helpers/devoluciones-lote-produccion/createEntradasStockRequisicionDevolucionDetalle";
import { getDevolucionOrdenTransformacion } from "../../helpers/orden-transformacion/getDevolucionOrdenTransformacion";
import { createDevolucionOrdenTransformacion } from "../../helpers/orden-transformacion/createDevolucionOrdenTransformacion";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ViewDevolucionesOrdenTransformacion = () => {
  const { id } = useParams();
  // ESTADOS PARA LA DATA DE DEVOLUCIONES
  const [ordenTransformacionDevolucion, setordenTransformacionDevolucion] =
    useState({
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
      prodDetDev: []
    });

  const {
    idProdc,
    idProdtOri,
    nomProd1,
    canUndProdtOri,
    canPesProdtOri,
    idProdtDes,
    nomProd2,
    canUndProdtDes,
    canPesProdtDes,
    prodDetDev
  } = ordenTransformacionDevolucion;

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
  const onDeleteDetalleRequisicionDevolucion = async (detalle) => {
    console.log(detalle);
    // abrimos el loader
    openLoader();
    const { message_error, description_error, result } =
      await deleteRequisicionDevolucionDetalleById(detalle);
    if (message_error.length === 0) {
      // llamamos a la data
      traerDatosProduccionLoteWithDevoluciones();
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
  const onUpdateDetalleRequisicionDevolucion = async (detalle, inputValue) => {
    console.log(detalle, inputValue);
    // abrimos el loader
    openLoader();
    // canReqAgrDetNew
    const { message_error, description_error, result } =
      await updateRequisicionDevolucionDetalleById(detalle, inputValue);
    if (message_error.length === 0) {
      // llamamos a la data
      traerDatosProduccionLoteWithDevoluciones();
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
  const onCheckDetalleRequisicionDevolucion = async (detalle, requisicion) => {
    const { idProdFin } = requisicion;
    const formatData = {
      ...detalle,
      idProdc,
      idProdFin
    };
    console.log(formatData);
    // abrimos el loader
    openLoader();
    const resultPeticion = await createDevolucionOrdenTransformacion(
      formatData
    );
    console.log(resultPeticion);
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      // llamamos a la data
      traerDatosProduccionLoteWithDevoluciones();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
    // // cerramos el loader
    closeLoader();
  };

  // FUNCION PARA TRAES DATOS DE PRODUCCION LOTE
  const traerDatosProduccionLoteWithDevoluciones = async () => {
    if (id.length !== 0) {
      const resultPeticion = await getDevolucionOrdenTransformacion(id);
      const { message_error, description_error, result } = resultPeticion;

      if (message_error.length === 0) {
        // seteamos la informacion de produccion de lote
        setordenTransformacionDevolucion(result[0]);
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
    traerDatosProduccionLoteWithDevoluciones();
  }, []);

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Atender requisiciones devolución</h1>
        <div className="row mt-4 mx-4">
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
          {/* REQUISICIONES DE AGREGACION REGISTRADAS */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Requisiciones</h6>
            {prodDetDev.map((requisicion, index) => (
              <CardRequisicionDevolucion
                key={requisicion.id}
                correlativo={requisicion["correlativo"]}
                requisicion={requisicion}
                onDeleteRequisicionDevolucionDetalle={
                  onDeleteDetalleRequisicionDevolucion
                }
                onUpdateRequisicionDevolucionDetalle={
                  onUpdateDetalleRequisicionDevolucion
                }
                onCheckRequisicionDevolucionDetalle={
                  onCheckDetalleRequisicionDevolucion
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
