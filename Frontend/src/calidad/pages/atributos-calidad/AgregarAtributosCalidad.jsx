import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterMateriaPrimaDynamic } from "../../../components/ReferencialesFilters/Producto/FilterMateriaPrimaDynamic";
import { TextField } from "@mui/material";
import { FilterTipoAtributoDynamic } from "../../../components/ReferencialesFilters/TipoAtributo/FilterTipoAtributoDynamic";

export const AgregarAtributosCalidad = () => {
  // detalle de atributos de calidad
  const [dataAtributosCalidad, setDataAtributosCalidad] = useState({
    idProdt: 0,
    detAtriCal: []
  });

  const { idProdt, detAtriCal } = dataAtributosCalidad;

  // detalle de filtro de producto
  const [atributoDetalle, setAtributoDetalle] = useState({
    nomAtr: "",
    tipAtr: 0
  });

  const { nomAtr, tipAtr } = atributoDetalle;

  // ************* FEEDBACK ******************
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

  // añadir producto final a formula
  const onAddProducto = ({ id }) => {
    setDataAtributosCalidad({
      ...dataAtributosCalidad,
      idProdt: id
    });
  };

  // ******** MANEJADORES DE LOS FILTROS **********
  // manejador de nombre de atrbiuto
  const handleNombreAtributo = ({ target }) => {
    const { value } = target;
    setAtributoDetalle({
      ...atributoDetalle,
      nomAtr: value
    });
  };
  const handleTipoAtributo = ({ id }) => {
    setAtributoDetalle({
      ...atributoDetalle,
      tipAtr: id
    });
  };
  const handleAddAtributoDetalle = () => {};

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">
          Agregar Fórmula de Presentacion Final
        </h1>
        <div className="row mt-4 mx-2">
          <div className="card d-flex">
            <h6 className="card-header">Datos de la Fórmula</h6>
            <div className="card-body">
              <form>
                {/* PRESENTACION FINAL */}
                <div className="mb-3 row">
                  <label htmlFor="nombre" className="col-sm-2 col-form-label">
                    Materia prima
                  </label>
                  <div className="col-md-8">
                    <FilterMateriaPrimaDynamic onNewInput={onAddProducto} />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="row mt-4 mx-2">
          <div className="card d-flex">
            <h6 className="card-header">Detalle de atributos</h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* NOMBRE ATRIBUTO */}
                <div className="col-md-4">
                  <label className="form-label">Nombre atributo</label>
                  <TextField
                    type="text"
                    onChange={handleNombreAtributo}
                    value={nomAtr}
                    name="canForProDet"
                    className="form-control"
                    size="small"
                  />
                </div>
                {/* TIPO ATRIBUTO */}
                <div className="col-md-3">
                  <label className="form-label">Tipo atributo</label>
                  <FilterTipoAtributoDynamic onNewInput={handleTipoAtributo} />
                </div>
                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddAtributoDetalle}
                    className="btn btn-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-plus-circle-fill me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                    </svg>
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
