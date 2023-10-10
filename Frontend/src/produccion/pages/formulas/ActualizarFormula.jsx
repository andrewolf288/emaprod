import React, { useState, useEffect } from "react";
// IMPORTACIONES PARA LA NAVEGACION
import { useParams, useNavigate } from "react-router-dom";
// IMPORTACIONES PARA TABLE MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
//IMPORTACIONES PARA DIALOG DELETE
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { FilterMateriaPrima } from "./../../../components/ReferencialesFilters/Producto/FilterMateriaPrima";
import { getFormulaWithDetalleById } from "./../../helpers/formula/getFormulaWithDetalleById";
import { getMateriaPrimaById } from "./../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { RowDetalleFormula } from "./../../components/RowDetalleFormula";
import { updateFormulaDetalle } from "./../../helpers/formula/updateFormulaDetalle";
import { DialogDeleteDetalle } from "../../components/DialogDeleteDetalle";
import { deleteDetalleFormula } from "./../../helpers/formula/deleteDetalleFormula";
import { RowEditDetalleFormula } from "./../../components/RowEditDetalleFormula";
import { Typography } from "@mui/material";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ActualizarFormula = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const { idFor } = useParams();

  // ESTADOS PARA DATOS DE FORMULARO FORMULA (MAESTRO)
  const [formula, setformula] = useState({
    nomProd: "",
    nomFor: "",
    desFor: "",
    lotKgrFor: "",
    forDet: [],
  });
  const { nomProd, nomFor, desFor, lotKgrFor, forDet } = formula;

  // ESTADOS PARA DATOS DE DETALLE FORMULA (DETALLE)
  const [materiaPrimaDetalle, setmateriaPrimaDetalle] = useState({
    idMateriaPrima: 0,
    cantidadMateriaPrima: "",
    idArea: 0,
  });
  const { idMateriaPrima, cantidadMateriaPrima, idArea } = materiaPrimaDetalle;

  // ESTADOS PARA EL DIALOG DELETE
  const [mostrarDialog, setMostrarDialog] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

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

  // ******* MANEJADORES PARA DETALLE DE FORMULA ********
  // MANEJADOR DE AGREGAR MATERIA PRIMA A DETALLE DE FORMULA
  const onMateriaPrimaId = ({ id }) => {
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

  // CONTROLADOR DE FORMULARIO
  const handledForm = ({ target }) => {
    const { name, value } = target;
    setformula({
      ...formula,
      [name]: value,
    });
  };

  // ***** EVENTOS PARA DETALLE DE FORMULA ************
  // AÑADIR MATERIA PRIMA A FORMULA
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
          feedback_description_error: "Ya se agrego esta materia prima",
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

  // MANEJADOR DE ELIMINACION DE MATERIA PRIMA (para los recien agregados)
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

  // ACTUALIZAR AREA ENCARGADA DE REQUISICION
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

  // PARA ELIMINAR UN DETALLE YA REGISTRADO EN LA BASE DE DATOS
  const closeDialogDeleteDetalle = () => {
    // ocultamos el modal
    setMostrarDialog(false);
    // dejamos el null la data del detalle
    setItemSeleccionado(null);
  };

  // MOSTRAR Y OCULTAR DETALLE DE REQUISICION MOLIENDA
  const showDialogDeleteItem = (idMatPri) => {
    const formulaDetalle = forDet.filter((element) => {
      if (element.idMatPri === idMatPri) {
        return element;
      } else {
        return false;
      }
    });

    // recuperamos el item seleccionado
    const itemSelected = formulaDetalle[0];
    // si es una nueva materia prima agregada
    if (itemSelected.id !== undefined) {
      // seteamos la data de la requisicion seleccionada
      setItemSeleccionado(itemSelected);
      // mostramos el modal
      setMostrarDialog(true);
    } else {
      deleteDetalleMateriaPrima(itemSelected.idMatPri);
    }
  };

  // ELIMINAR DETALLE DE FORMULA
  const deleteItemSelected = async (idForDet) => {
    // primero realizamos la eliminacion
    const resultPeticion = await deleteDetalleFormula(idForDet);
    const { message_error, description_error } = resultPeticion;
    if (message_error.length === 0) {
      // actualizamos el detalle de la formula
      const nuevoDetalleFormula = forDet.filter((element) => {
        if (element.id !== idForDet) {
          return true;
        } else {
          return false;
        }
      });

      setformula({
        ...formula,
        forDet: nuevoDetalleFormula,
      });
      // cerramos el modal
      closeDialogDeleteDetalle();
      // mostramos el feedback
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error:
          "Se elimino el detalle de la formula con exito",
      });
      handleClickFeeback();
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // ****** FUNCIONES PARA EL SUBMIT DEL FORMULARIO ACTUALIZADO ********++
  const updateFormula = async () => {
    const resultPeticion = await updateFormulaDetalle(formula);
    const { message_error, description_error, result } = resultPeticion;
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
  const handleSubmitUpdateFormula = (e) => {
    e.preventDefault();
    if (nomFor.length === 0 || forDet.length === 0) {
      let advertenciaUpdateFormula = "";

      if (nomFor.length === 0) {
        advertenciaUpdateFormula +=
          "Asegurate de proporcionar un nombre para la formula\n";
      }
      if (forDet.length === 0) {
        advertenciaUpdateFormula +=
          "Debe proporcionar al menos un detalle de la formula\n";
      }
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaUpdateFormula,
      });
      handleClickFeeback();
    } else {
      const validAreaEncargada = forDet.find((element) => element.idAre === 0);
      if (validAreaEncargada) {
        // MANEJAMOS FORMULARIOS INCOMPLETOS
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Asegurese de asignar areas encargadas para cada item nuevo agregado",
        });
        handleClickFeeback();
      } else {
        setdisableButton(true);
        // LLAMAMOS A LA FUNCION CREAR MATERIA PRIMA
        updateFormula();
      }
    }
  };

  // Traer datos de la formula y su detalle
  const traerDatosFormulaDetalle = async () => {
    // realizamos la peticion
    const resultPeticion = await getFormulaWithDetalleById(idFor);
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      setformula({
        ...result[0],
      });
    } else {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  useEffect(() => {
    // traer la data de la formula
    traerDatosFormulaDetalle();
  }, []);

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Actualizar Formula</h1>

        <div className="row mt-4 mx-2">
          <div className="card d-flex">
            <h6 className="card-header">Datos de la formula</h6>
            <div className="card-body">
              <form>
                {/* PRODUCTO */}
                <div className="mb-3 row">
                  <label htmlFor="nombre" className="col-sm-2 col-form-label">
                    SubProducto
                  </label>
                  <div className="col-md-4">
                    <input
                      type="text"
                      disabled
                      name="nomProd"
                      onChange={handledForm}
                      value={nomProd}
                      className="form-control"
                    />
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
                  <div className="col-md-4">
                    <input
                      type="text"
                      name="nomFor"
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
                  <div className="col-md-4">
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
                      disabled
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
                  <label htmlFor="inputPassword4" className="form-label">
                    Materia Prima
                  </label>
                  <FilterMateriaPrima onNewInput={onMateriaPrimaId} />
                </div>

                {/* AGREGAR CANTIDAD*/}
                <div className="col-md-2">
                  <label htmlFor="inputPassword4" className="form-label">
                    Cantidad
                  </label>
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
                        <TableCell align="left" width={160}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="left" width={100}>
                          <b>Clase</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Sub clase</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Area encargada</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Cantidad</b>
                        </TableCell>
                        <TableCell align="left" width={80}>
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
                          <RowEditDetalleFormula
                            key={row.idMatPri}
                            detalle={row}
                            onDeleteDetalleFormula={showDialogDeleteItem}
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
            onClick={handleSubmitUpdateFormula}
            className="btn btn-primary"
          >
            Guardar
          </button>
        </div>
      </div>

      {/* DIALOG DELETE DETALLE */}
      {mostrarDialog && (
        <DialogDeleteDetalle
          itemDelete={itemSeleccionado}
          onClose={closeDialogDeleteDetalle}
          onDeleteItemSelected={deleteItemSelected}
        />
      )}

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
