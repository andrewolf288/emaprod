import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { createFormulaWithDetalle } from "./../../helpers/formula/createFormulaWithDetalle";
import { getMateriaPrimaById } from "./../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { FilterProductoProduccion } from "./../../../components/ReferencialesFilters/Producto/FilterProductoProduccion";
import { FilterTipoFormula } from "./../../../components/ReferencialesFilters/Formula/FilterTipoFormula";
import { RowDetalleFormula } from "./../../components/RowDetalleFormula";
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { Typography } from "@mui/material";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AgregarFormula = () => {
  // ESTADOS PARA DATOS DE FORMULARO FORMULA (MAESTRO)
  const [formula, setformula] = useState({
    idProd: 0,
    idTipFor: 0,
    nomFor: "",
    desFor: "",
    lotKgrFor: 1.0,
    forDet: [], // DETALLE DE FORMULAS
  });
  const { idProd, idTipFor, nomFor, desFor, lotKgrFor, forDet } = formula;

  // ESTADOS PARA DATOS DE DETALLE FORMULA (DETALLE)
  const [materiaPrimaDetalle, setmateriaPrimaDetalle] = useState({
    idMateriaPrima: 0,
    cantidadMateriaPrima: "",
    idArea: 0,
  });
  const { idMateriaPrima, cantidadMateriaPrima, idArea } = materiaPrimaDetalle;

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

  // MANEJADOR DE AGREGAR MATERIA PRIMA A DETALLE DE FORMULA
  const onProductoId = ({ id }) => {
    setmateriaPrimaDetalle({
      ...materiaPrimaDetalle,
      idMateriaPrima: id,
    });
  };

  const handleCantidadMateriaPrima = ({ target }) => {
    const { name, value } = target;
    setmateriaPrimaDetalle({
      ...materiaPrimaDetalle,
      [name]: value,
    });
  };

  // MANEJADOR PARA AGREGAR MATERIA PRIMA A FORMULA
  const handleAddNewMateriPrimaDetalle = async (e) => {
    e.preventDefault();

    // PRIMERO VERIFICAMOS QUE LOS INPUTS TENGAN DATOS
    if (idMateriaPrima !== 0 && cantidadMateriaPrima > 0) {
      // PRIMERO VERIFICAMOS SI EXISTE ALGUNA COINCIDENCIA DE LO INGRESADO
      const itemFound = forDet.find(
        (elemento) => elemento.idMatPri === idMateriaPrima
      );
      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Ya se agrego un detalle con la materia prima elegida",
        });
        handleClickFeeback();
      } else {
        // HACEMOS UNA CONSULTA A LA MATERIA PRIMA Y DESESTRUCTURAMOS
        const resultPeticion = await getMateriaPrimaById(idMateriaPrima);
        const { message_error, description_error, result } = resultPeticion;

        if (message_error.length === 0) {
          const { id, codProd, desCla, desSubCla, nomProd, simMed } = result[0];

          // GENERAMOS NUESTRO DETALLE DE FORMULA DE MATERIA PRIMA
          const detalleFormulaMateriaPrima = {
            idMatPri: id,
            idAre: idArea,
            codProd: codProd,
            desCla: desCla,
            desSubCla: desSubCla,
            nomProd: nomProd,
            simMed: simMed,
            canMatPriFor: cantidadMateriaPrima,
          };

          // SETEAMOS SU ESTADO PARA QUE PUEDA SER MOSTRADO EN LA TABLA DE DETALLE
          const dataMateriaPrimaDetalle = [
            ...forDet,
            detalleFormulaMateriaPrima,
          ];
          setformula({
            ...formula,
            forDet: dataMateriaPrimaDetalle,
          });
        } else {
          setfeedbackMessages({
            style_message: "error",
            feedback_description_error: description_error,
          });
          handleClickFeeback();
        }
      }
    } else {
      let advertenciaDetalleFormula = "";
      if (idMateriaPrima === 0) {
        advertenciaDetalleFormula +=
          "Asigne una materia prima para agregar el detalle\n";
      }
      if (cantidadMateriaPrima <= 0) {
        advertenciaDetalleFormula +=
          "Asigne una cantidad mayor a 0 para agregar el detalle\n";
      }
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaDetalleFormula,
      });
      handleClickFeeback();
    }
  };

  // MANEJADOR DE ELIMINACION DE MATERIA PRIMA
  const deleteDetalleMateriaPrima = (idItem) => {
    // FILTRAMOS EL ELEMENTO ELIMINADO
    const nuevaDataDetalleFormulario = forDet.filter((element) => {
      if (element.idMatPri !== idItem) {
        return true;
      } else {
        return false;
      }
    });

    // VOLVEMOS A SETEAR LA DATA
    setformula({
      ...formula,
      forDet: nuevaDataDetalleFormulario,
    });
  };

  // MANEJADOR PARA ACTUALIZAR REQUISICION
  const handledFormularioDetalle = ({ target }, idItem) => {
    const { value } = target;
    const editFormDetalle = forDet.map((element) => {
      if (element.idMatPri === idItem) {
        return {
          ...element,
          canMatPriFor: value,
        };
      } else {
        return element;
      }
    });

    setformula({
      ...formula,
      forDet: editFormDetalle,
    });
  };

  const handledAreaEncargada = (idAre, idItem) => {
    const editFormDetalle = forDet.map((element) => {
      if (element.idMatPri === idItem) {
        return {
          ...element,
          idAre: idAre,
        };
      } else {
        return element;
      }
    });

    setformula({
      ...formula,
      forDet: editFormDetalle,
    });
  };

  // CONTROLADOR DE FORMULARIO
  const handledForm = ({ target }) => {
    const { name, value } = target;
    setformula({
      ...formula,
      [name]: value,
    });
  };

  // EVENTO DE ASOCIAR FORMULA A UN PRODUCTO
  const onAddProducto = ({ id }) => {
    setformula({
      ...formula,
      idProd: id,
    });
  };

  const onAddTipoFormula = ({ id }) => {
    setformula({
      ...formula,
      idTipFor: id,
    });
  };

  // ESTADOS PARA LA PAGINACIÓN
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // MANEJADORES DE LA PAGINACION
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // FUNCION PARA CREAR FORMULARIO
  const crearFormula = async () => {
    const { message_error, description_error } = await createFormulaWithDetalle(
      formula
    );

    if (message_error.length === 0) {
      // regresamos a la anterior vista
      onNavigateBack();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
    setdisableButton(false);
  };

  // CONTROLADOR DE SUBMIT
  const handleSubmitFormula = (e) => {
    let advertenciaFormularioIncompleto = "";
    e.preventDefault();
    if (
      nomFor.length === 0 ||
      idTipFor === 0 ||
      idProd === 0 ||
      lotKgrFor <= 0 ||
      forDet.length === 0
    ) {
      if (idProd === 0) {
        advertenciaFormularioIncompleto += "No se proporciono un subproducto\n";
      }
      if (idTipFor === 0) {
        advertenciaFormularioIncompleto += "No se indicó el tipo de formula\n";
      }
      if (nomFor.length === 0) {
        advertenciaFormularioIncompleto +=
          "No se proporciono un nombre para la formula\n";
      }
      if (lotKgrFor <= 0) {
        advertenciaFormularioIncompleto +=
          "No se puede establecer un peso menor o igual a 0\n";
      }
      if (forDet.length === 0) {
        advertenciaFormularioIncompleto +=
          "Debe proporcionar al menos un detalle de la formula\n";
      }
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaFormularioIncompleto,
      });
      handleClickFeeback();
    } else {
      const validAreaEncargada = forDet.find((element) => element.idAre === 0);
      if (validAreaEncargada) {
        // MANEJAMOS FORMULARIOS INCOMPLETOS
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Asegurese de asignar areas encargadas para cada item",
        });
        handleClickFeeback();
      } else {
        setdisableButton(true);
        // LLAMAMOS A LA FUNCION CREAR MATERIA PRIMA
        crearFormula();
      }
    }
  };

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Agregar Formula</h1>

        <div className="row mt-4 mx-2">
          <div className="card d-flex">
            <h6 className="card-header">Datos de la formula</h6>
            <div className="card-body">
              <form>
                {/* PRODUCTO */}
                <div className="mb-3 row">
                  <label htmlFor="nombre" className="col-sm-2 col-form-label">
                    Subproducto
                  </label>
                  <div className="col-md-6">
                    <FilterProductoProduccion onNewInput={onAddProducto} />
                  </div>
                </div>
                {/* TIPO DE FORMULA */}
                <div className="mb-3 row">
                  <label htmlFor="nombre" className="col-sm-2 col-form-label">
                    Tipo de formula
                  </label>
                  <div className="col-md-3">
                    <FilterTipoFormula onNewInput={onAddTipoFormula} />
                  </div>
                </div>
                {/* NOMBRE FORMULA */}
                <div className="mb-3 row">
                  <label
                    htmlFor="categoria"
                    className="col-sm-2 col-form-label"
                  >
                    Nombre Formula
                  </label>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="nomFor"
                      autoComplete="off"
                      onChange={handledForm}
                      value={nomFor}
                      className="form-control"
                    />
                  </div>
                </div>
                {/* DESCRIPCION */}
                <div className="mb-3 row">
                  <label
                    htmlFor="descripcion"
                    className="col-sm-2 col-form-label"
                  >
                    Descripción
                  </label>
                  <div className="col-md-6">
                    <div className="form-floating">
                      <textarea
                        value={desFor}
                        onChange={handledForm}
                        name="desFor"
                        className="form-control"
                        placeholder="Leave a comment here"
                      ></textarea>
                    </div>
                  </div>
                </div>
                {/* KILOGRAMOS POR LOTE */}
                <div className="mb-3 row">
                  <label htmlFor="stock" className="col-sm-2 col-form-label">
                    Kilogramos de lote
                  </label>
                  <div className="col-md-2">
                    <input
                      type="number"
                      name="lotKgrFor"
                      onChange={handledForm}
                      value={lotKgrFor}
                      className="form-control"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="row mt-4 mx-2">
          <div className="card d-flex">
            <h6 className="card-header">Detalle de la fórmula</h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR MATERIA PRIMA */}
                <div className="col-md-3">
                  <label className="form-label">Materia Prima</label>
                  <FilterAllProductos onNewInput={onProductoId} />
                </div>

                {/* AGREGAR CANTIDAD*/}
                <div className="col-md-2">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    onChange={handleCantidadMateriaPrima}
                    value={cantidadMateriaPrima}
                    name="cantidadMateriaPrima"
                    className="form-control"
                  />
                </div>

                {/* BOTON AGREGAR MATERIA PRIMA */}
                <div className="col-md-3 d-flex justify-content-end ms-auto">
                  <button
                    onClick={handleAddNewMateriPrimaDetalle}
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
              {/* TABLA DE RESULTADOS */}
              <Paper>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow
                        sx={{
                          "& th": {
                            color: "rgba(96, 96, 96)",
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        <TableCell align="left" width={120}>
                          <b>Clase</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Sub clase</b>
                        </TableCell>
                        <TableCell align="left" width={180}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="center" width={140}>
                          <b>Area</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Cantidad</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {forDet
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row, i) => (
                          <RowDetalleFormula
                            key={row.idMatPri}
                            detalle={row}
                            onDeleteDetalleFormula={deleteDetalleMateriaPrima}
                            onChangeFormulaDetalle={handledFormularioDetalle}
                            onChangeAreaEncargadaDetalle={handledAreaEncargada}
                          />
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* PAGINACION DE LA TABLA */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={forDet.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
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
            onClick={handleSubmitFormula}
            className="btn btn-primary"
          >
            Guardar
          </button>
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
