import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProveedor } from "./../../helpers/proveedor/createProveedor";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AgregarProveedor = () => {
  // ESTADO DE FORMULARIO DE PROVEEDOR
  const [proveedor, setproveedor] = useState({
    codPro: "",
    nomPro: "",
    apePro: "",
    desPro: "",
  });
  const { codPro, nomPro, apePro, desPro } = proveedor;

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

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false);

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  // CONTROLADOR DE FORMULARIO DE PROVEEDOR
  const handledForm = ({ target }) => {
    const { name, value } = target;
    setproveedor({
      ...proveedor,
      [name]: value,
    });
  };

  // FUNCION PARA CREAR MATERIA PRIMA
  const crearProveedor = async () => {
    const { message_error, description_error } = await createProveedor(
      proveedor
    );
    if (message_error.length === 0) {
      console.log("Se creo exitosamente");
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se creó exitosamente",
      });
      handleClickFeeback();
    } else {
      console.log("No se pudo crear");
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
    setdisableButton(false);
  };

  const handleSubmitProveedor = (e) => {
    e.preventDefault();
    if (codPro.length === 0 || nomPro.length === 0 || apePro.length === 0) {
      console.log("Asegurese de completar los campos requeridos");
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Asegurese de llenar los datos requeridos",
      });
      handleClickFeeback();
    } else {
      console.log(proveedor);
      setdisableButton(true);
      // LLAMAMOS A LA FUNCION CREAR MATERIA PRIMA
      crearProveedor();
    }
  };

  return (
    <>
      <div className="container">
        <h1 className="mt-4 text-center">Agregar proveedor</h1>
        <form className="mt-4">
          <div className="mb-3 row">
            <label
              htmlFor="codigo_referencia"
              className="col-sm-2 col-form-label"
            >
              Codigo de referencia
            </label>
            <div className="col-md-2">
              <input
                type="text"
                onChange={handledForm}
                value={codPro}
                name="codPro"
                className="form-control"
              />
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="nombre" className="col-sm-2 col-form-label">
              Nombres
            </label>
            <div className="col-md-4">
              <input
                type="text"
                onChange={handledForm}
                value={nomPro}
                name="nomPro"
                className="form-control"
              />
            </div>
          </div>
          <div className="mb-3 row">
            <label htmlFor="nombre" className="col-sm-2 col-form-label">
              Apellidos
            </label>
            <div className="col-md-4">
              <input
                type="text"
                onChange={handledForm}
                value={apePro}
                name="apePro"
                className="form-control"
              />
            </div>
          </div>

          <div className="mb-3 row">
            <label htmlFor="descripcion" className="col-sm-2 col-form-label">
              Descripción
            </label>
            <div className="col-md-4">
              <div className="form-floating">
                <textarea
                  value={desPro}
                  onChange={handledForm}
                  name="desPro"
                  className="form-control"
                  placeholder="Leave a comment here"
                ></textarea>
              </div>
            </div>
          </div>
          {/* BOTONES DE CANCELAR Y GUARDAR */}
          <div className="btn-toolbar">
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn btn-secondary me-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={disableButton}
              onClick={handleSubmitProveedor}
              className="btn btn-primary"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
      {/* FEEDBACK AGREGAR PROVEEDOR */}
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

export default AgregarProveedor;
