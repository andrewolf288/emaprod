import React, { useState, useEffect } from "react";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { getProveedorById } from "./../../helpers/proveedor/getProveedorById";
import { useParams, useNavigate } from "react-router-dom";
import { updateProveedor } from "./../../helpers/proveedor/updateProveedor";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ActualizarProveedor = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const { id } = useParams();

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  // ESTADO DEL FORMULARIO DE PROVEEDOR
  const [proveedor, setproveedor] = useState({
    codPro: "",
    nomPro: "",
    apePro: "",
    desPro: "",
  });
  const { codPro, nomPro, apePro, desPro } = proveedor;

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackUpdate, setfeedbackUpdate] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackUpdate(true);
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setfeedbackUpdate(false);
  };

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false);

  // FUNCION PARA TRAER LA DATA DE PROVEEDOR
  const obtenerDataProveedorById = async () => {
    const resultPeticion = await getProveedorById(id);
    setproveedor({
      ...proveedor,
      codPro: resultPeticion[0].codPro,
      apePro: resultPeticion[0].apePro,
      nomPro: resultPeticion[0].nomPro,
      desPro: resultPeticion[0].desPro,
    });
  };

  // MANEJADOR DE FORMULARIO
  const handledForm = ({ target }) => {
    const { name, value } = target;
    setproveedor({
      ...proveedor,
      [name]: value,
    });
  };

  // FUNCION PARA ACTUALIZAR PROVEEDOR
  const actualizarProveedor = async (idPro, data) => {
    const { message_error, description_error } = await updateProveedor(
      idPro,
      data
    );

    if (message_error.length === 0) {
      console.log("Se actualizo correctamente");
      // MOSTRAMOS FEEDBACK
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se actualizó exitosamente",
      });
      handleClickFeeback();
    } else {
      console.log("No se pudo actualizar");
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
    setdisableButton(false);
  };

  // CONTROLADOR SUBMIT DE FORMULARIO
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
      setdisableButton(true);
      // EJECUTAMOS LA ACTUALIZACION
      actualizarProveedor(id, proveedor);
    }
  };

  useEffect(() => {
    // OBTENER PROVEEDOR POR ID
    obtenerDataProveedorById();
  }, []);

  return (
    <>
      <div className="container">
        <h1 className="mt-4 text-center">Actualizar proveedor</h1>
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
              Actualizar
            </button>
          </div>
        </form>
      </div>
      {/* FEEDBACK UPDATE */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={feedbackUpdate}
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

export default ActualizarProveedor;
