import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { viewEntradaStockById } from "./../../helpers/entradas-stock/viewEntradaStockById";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ViewEntradaStock = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const { id } = useParams();

  const [entradaStock, setentradaStock] = useState({
    id: 0,
    idProd: 0,
    nomProd: "",
    codProd: "",
    codProd2: "",
    codProd3: "",
    desCla: "",
    idProv: 0,
    nomProv: "",
    apeProv: "",
    codProv: "",
    idAlm: 0,
    nomAlm: "",
    codAlm: "",
    idEntStoEst: 0,
    desEntStoEst: "",
    codEntSto: "",
    fecEntSto: "",
    fecVenEntSto: "",
    esSel: 0,
    canSel: 0,
    canPorSel: 0,
    merDis: 0,
    merTot: 0,
    canTotCom: 0,
    canTotEnt: 0,
    canTotDis: 0,
    canVar: 0,
    fecFinSto: "",
  });

  const {
    nomProd,
    codProd,
    codProd2,
    codProd3,
    nomProv,
    apeProv,
    codProv,
    nomAlm,
    codAlm,
    desEntStoEst,
    codEntSto,
    fecEntSto,
    fecVenEntSto,
    esSel,
    canSel,
    canPorSel,
    merDis,
    merTot,
    canTotCom,
    canTotEnt,
    canTotDis,
    canVar,
    fecFinSto,
  } = entradaStock;

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

  // funcion para obtener la produccion con sus requisiciones y su detalle
  const obtenerDataEntradaStock = async () => {
    const resultPeticion = await viewEntradaStockById(id);
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      setentradaStock(result[0]);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    window.close();
    //navigate(-1);
  };

  useEffect(() => {
    obtenerDataEntradaStock();
  }, []);

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Entrada Stock</h1>
        <div className="row mt-4 mx-4">
          {/* Datos de producto */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de producto</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* NOMBRE PRODUCTO */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Nombre producto</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={nomProd ? nomProd : "No establecido"}
                    className="form-control"
                  />
                </div>
                {/* CODIGO SIGO */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Codigo SIGO</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codProd === null ? "No establecido" : codProd}
                    className="form-control"
                  />
                </div>
                {/* CODIGO EMAPROD */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Codigo EMAPROD</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codProd2 === null ? "No establecido" : codProd2}
                    className="form-control"
                  />
                </div>
                {/* OTROS CODIGO */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Codigo (otros)</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codProd3 === null ? "No establecido" : codProd3}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Datos de proveedor */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Datos de proveedor</h6>
            <div className="card-body">
              <div className="mb-4 row">
                {/* NOMBRE DE PROVEEDOR */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Nombre proveedor</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={nomProv}
                    className="form-control"
                  />
                </div>
                {/* APELLIDO DE PROVEEDOR */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Apellido proveedor</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={apeProv}
                    className="form-control"
                  />
                </div>
                {/* CODIGO PROVEEDOR */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Codigo proveedor</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codProv}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Datos de almacen */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Datos de almacen</h6>
            <div className="card-body">
              <div className="mb-4 row">
                {/* NOMBRE DE ALMACEN */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Nombre almacen</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={nomAlm}
                    className="form-control"
                  />
                </div>
                {/* CODIGO DE ALMACEN */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Codigo almacen</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codAlm}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Datos de entrada */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Datos de entrada de stock</h6>
            <div className="card-body">
              {/* FILA DE DATOS GENERALES */}
              <div className="mb-4 row">
                {/* ESTADO DE ENTRADA */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Estado</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desEntStoEst}
                    className="form-control"
                  />
                </div>
                {/* CODIGO DE ENTRADA */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Codigo entrada</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codEntSto}
                    className="form-control"
                  />
                </div>
                {/* FECHA DE ENTRADA */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha entrada</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecEntSto}
                    className="form-control"
                  />
                </div>
                {/* FECHA DE VENCIMIENTO */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha vencimiento</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecVenEntSto}
                    className="form-control"
                  />
                </div>
              </div>
              {/* FILA DE CANTIDADES DE ENTRADA STOCK */}
              <div className="mb-4 row">
                {/* CANTIDAD TOTAL */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad total</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={canTotEnt}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DISPONIBLE */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad Disponible</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={canTotDis}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD SELECCIONADA */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad seleccionada</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={canSel}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD POR SELECCIONAR */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad por seleccionar</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={canPorSel}
                    className="form-control"
                  />
                </div>
              </div>
              {/* FILA DE INFORMACION DE MERMA */}
              <div className="mb-4 row">
                {/* ES SELECCION */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Es seleccion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={esSel === 0 ? "No es seleccion" : "Es seleccion"}
                    className="form-control"
                  />
                </div>
                {/* MERMA TOTAL */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Merma total</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={merTot}
                    className="form-control"
                  />
                </div>
                {/* MERMA DISPONIBLE */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Merma disponible</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={merDis}
                    className="form-control"
                  />
                </div>
                {/* FECHA DE TERMINO */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha termino</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={
                      fecFinSto === null ? "Entrada no terminada" : fecFinSto
                    }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-4 row">
                {/* CANTIDAD COMPRA */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad compra</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={canTotCom}
                    className="form-control"
                  />
                </div>
                {/* MERMA TOTAL */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad variacion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={canVar}
                    className={`form-control ${
                      parseFloat(canVar) < 0 ? "text-danger" : "text-success"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* BOTONES DE CANCELAR Y GUARDAR */}
          <div className="btn-toolbar mt-4">
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn btn-secondary me-2"
            >
              Cerrar
            </button>
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
          {feedback_description_error}
        </Alert>
      </Snackbar>
    </>
  );
};
