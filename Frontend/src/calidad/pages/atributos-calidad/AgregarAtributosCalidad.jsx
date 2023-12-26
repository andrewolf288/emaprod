import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FilterMateriaPrimaDynamic } from "../../../components/ReferencialesFilters/Producto/FilterMateriaPrimaDynamic";
import { Snackbar, TextField, Typography } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { FilterTipoAtributoDynamic } from "../../../components/ReferencialesFilters/TipoAtributo/FilterTipoAtributoDynamic";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { RowAtributoCalidad } from "../../components/atributos-calidad/RowAtributoCalidad";
import { createAtributosCalidadProducto } from "../../helpers/atributos-calidad/createAtributosCalidadProducto";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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
    tipAtr: "",
    desTipAtr: ""
  });

  const { nomAtr, tipAtr, desTipAtr } = atributoDetalle;

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false);

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
  const handleTipoAtributo = ({ id, label }) => {
    setAtributoDetalle({
      ...atributoDetalle,
      tipAtr: id,
      desTipAtr: label
    });
  };

  // eliminar atributo de calidad
  const handleDeleteAtributoDetalle = (nombreAtributo) => {
    const parserNombre = nombreAtributo.toLowerCase();
    const filterItems = detAtriCal.filter(
      (element) => element.nomProdAtr.toLowerCase() !== parserNombre
    );
    setDataAtributosCalidad({
      ...dataAtributosCalidad,
      detAtriCal: filterItems
    });
  };

  // modificar atributo de calidad
  const handleChangeAtributoDetalle = (value, nombreAtributo) => {
    const parserNombre = nombreAtributo.toLowerCase();
    const mapItems = detAtriCal.map((element) => {
      if (element.nomProdAtr.toLowerCase() === parserNombre) {
        return {
          ...element,
          opcProdAtr: value
        };
      } else {
        return element;
      }
    });
    setDataAtributosCalidad({
      ...dataAtributosCalidad,
      detAtriCal: mapItems
    });
  };

  // añadir atributo de calidad
  const handleAddAtributoDetalle = (e) => {
    e.preventDefault();
    const parserNomAtr = nomAtr.trim();

    if (parserNomAtr.length === 0 || tipAtr.length === 0) {
      let handleErrors = "";
      if (parserNomAtr.length === 0) {
        handleErrors += "No se agrego un nombre al atributo de calidad\n";
      }
      if (tipAtr.length === 0) {
        handleErrors += "No se agrego un tipo al atributo de calidad\n";
      }

      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: handleErrors
      });
      handleClickFeeback();
    } else {
      // debemos comprobar que el atributo no se haya ingresado antes
      const parserBusquedaNomAtr = parserNomAtr.toLocaleLowerCase();
      const findElement = detAtriCal.find(
        (element) =>
          element.nomProdAtr.toLocaleLowerCase() === parserBusquedaNomAtr
      );
      if (findElement) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Este atributo de calidad ya fue agregado al detalle\n"
        });
        handleClickFeeback();
      } else {
        const opciones =
          tipAtr == 1
            ? "Sin opciones"
            : tipAtr == 2
            ? "Sin opciones"
            : tipAtr == 3
            ? "C, I"
            : tipAtr == 4
            ? ""
            : "Sin opciones";
        const formatData = {
          nomProdAtr: parserNomAtr,
          tipProdAtr: desTipAtr,
          idTipProdAtr: tipAtr,
          opcProdAtr: opciones
        };
        const detalleAtrbiutos = [...detAtriCal, formatData];
        setDataAtributosCalidad({
          ...dataAtributosCalidad,
          detAtriCal: detalleAtrbiutos
        });
      }
    }
  };

  // añadir atributos de calidad
  const crearAtributosCalidadMateriPrima = async () => {
    console.log(dataAtributosCalidad);
    // const resultPeticion = await createAtributosCalidadProducto(
    //   dataAtributosCalidad
    // );
    // const { message_error, description_error } = resultPeticion;
    // if (message_error.length === 0) {
    //   // regresamos a la anterior vista
    //   onNavigateBack();
    // } else {
    //   setfeedbackMessages({
    //     style_message: "error",
    //     feedback_description_error: description_error
    //   });
    //   handleClickFeeback();
    // }
    setdisableButton(false);
  };

  // manjear creacion atributos calidad
  const handleSubmitAtributosCalidad = (e) => {
    e.preventDefault();
    if (idProdt === 0 || detAtriCal.length === 0) {
      let advertenciaDetalleFormulaProducto = "";

      if (idProdt === 0) {
        advertenciaDetalleFormulaProducto +=
          "No se proporciono una materia prima para asociar los atributos de calidad\n";
      }
      if (detAtriCal.length === 0) {
        advertenciaDetalleFormulaProducto +=
          "El detalle de los atrbiutos debe tener al menos 1 item\n";
      }
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaDetalleFormulaProducto
      });
      handleClickFeeback();
    } else {
      setdisableButton(true);
      // LLAMAMOS A LA FUNCION CREAR MATERIA PRIMA
      crearAtributosCalidadMateriPrima();
    }
  };

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

              {/* DETALLE DE MATERIA PRIMA */}
              <div className="card text-bg-primary d-flex">
                <h6 className="card-header">Detalle atributos</h6>
                <div className="card-body">
                  <Paper>
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                          <TableRow
                            sx={{
                              "& th": {
                                color: "rgba(96, 96, 96)",
                                backgroundColor: "#f5f5f5"
                              }
                            }}
                          >
                            <TableCell align="left" width={180}>
                              <b>Nombre atributo</b>
                            </TableCell>
                            <TableCell align="left" width={60}>
                              <b>Tipo Atributo</b>
                            </TableCell>
                            <TableCell align="left" width={220}>
                              <b>Valores</b>
                            </TableCell>
                            <TableCell align="left" width={80}>
                              <b>Acciones</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {detAtriCal.map((element, index) => (
                            <RowAtributoCalidad
                              detalle={element}
                              key={index}
                              onDeleteDetalleAtributo={
                                handleDeleteAtributoDetalle
                              }
                              onChangeDetalleAtributo={
                                handleChangeAtributoDetalle
                              }
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
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
              Volver
            </button>
            <button
              type="submit"
              disabled={disableButton}
              onClick={handleSubmitAtributosCalidad}
              className="btn btn-primary"
            >
              Guardar
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
          <Typography whiteSpace={"pre-line"}>
            {feedback_description_error}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};
