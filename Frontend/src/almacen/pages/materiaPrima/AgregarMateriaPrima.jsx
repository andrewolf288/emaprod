import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMateriaPrima } from "../../helpers/materia-prima/createMateriaPrima";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { FilterMedidas } from "./../../../components/ReferencialesFilters/Medidas/FilterMedidas";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AgregarMateriaPrima = () => {
  // ESTADOS PARA EL CONTROL DEL FORMULARIO MATERIA PRIMA
  const [materiaPrima, setmateriaPrima] = useState({
    codMatPri: "",
    idMatPriCat: 0,
    idMed: 0,
    nomMatPri: "",
    desMatPri: "",
    stoMatPri: 0,
  });

  const { codMatPri, idMatPriCat, idMed, nomMatPri, desMatPri, stoMatPri } =
    materiaPrima;

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

  // CONTROLADOR DE FORMULARIO
  const handledForm = ({ target }) => {
    const { name, value } = target;
    setmateriaPrima({
      ...materiaPrima,
      [name]: value,
    });
  };

  // CONTROLADOR DE CATEGORIA
  const onAddCategoriaMateriaPrima = (value) => {
    setmateriaPrima({
      ...materiaPrima,
      idMatPriCat: value.id,
    });
  };

  // CONTROLADOR DE MEDIDA
  const onAddMedida = (newValue) => {
    setmateriaPrima({
      ...materiaPrima,
      idMed: newValue,
    });
  };

  // FUNCION PARA CREAR MATERIA PRIMA
  const crearMateriaPrima = async () => {
    const { message_error, description_error } = await createMateriaPrima(
      materiaPrima
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

  // CONTROLADOR DE SUBMIT
  const handleSubmitMateriPrima = (e) => {
    e.preventDefault();
    if (
      codMatPri.length === 0 ||
      nomMatPri.length === 0 ||
      idMatPriCat === 0 ||
      idMed === 0 ||
      stoMatPri < 0
    ) {
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Asegurese de llenar los datos requeridos",
      });
      handleClickFeeback();
    } else {
      setdisableButton(true);
      // LLAMAMOS A LA FUNCION CREAR MATERIA PRIMA
      crearMateriaPrima();
    }
  };

  return (
    <>
      <div className="container">
        <h1 className="mt-4 text-center">Agregar materia prima</h1>
        <form className="mt-4">
          {/* CODIGO DE REFERENCIA */}
          <div className="mb-3 row">
            <label
              htmFor="codigo_referencia"
              className="col-sm-2 col-form-label"
            >
              Codigo de referencia
            </label>
            <div className="col-md-2">
              <input
                type="text"
                value={codMatPri}
                onChange={handledForm}
                name="codMatPri"
                className="form-control"
              />
            </div>
          </div>
          {/* NOMBRE */}
          <div className="mb-3 row">
            <label htmlFor="nombre" className="col-sm-2 col-form-label">
              Nombre
            </label>
            <div className="col-md-4">
              <input
                type="text"
                value={nomMatPri}
                onChange={handledForm}
                name="nomMatPri"
                className="form-control"
              />
            </div>
          </div>
          {/* MEDIDA */}
          <div className="mb-3 row">
            <label htmlFor="medida" className="col-sm-2 col-form-label">
              Medida
            </label>
            <div className="col-md-2">
              <FilterMedidas onNewInput={onAddMedida} />
            </div>
          </div>
          {/* DESCRIPCION */}
          <div className="mb-3 row">
            <label htmlFor="descripcion" className="col-sm-2 col-form-label">
              Descripción
            </label>
            <div className="col-md-4">
              <div className="form-floating">
                <textarea
                  value={desMatPri}
                  onChange={handledForm}
                  name="desMatPri"
                  className="form-control"
                  placeholder="Leave a comment here"
                ></textarea>
              </div>
            </div>
          </div>
          {/* CANTIDAD STOCK */}
          <div className="mb-3 row">
            <label htmlFor="stock" className="col-sm-2 col-form-label">
              Cantidad en Stock
            </label>
            <div className="col-md-2">
              <input
                type="number"
                name="stoMatPri"
                onChange={handledForm}
                value={stoMatPri}
                className="form-control"
              />
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
              onClick={handleSubmitMateriPrima}
              className="btn btn-primary"
            >
              Guardar
            </button>
          </div>
        </form>
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

export default AgregarMateriaPrima;
