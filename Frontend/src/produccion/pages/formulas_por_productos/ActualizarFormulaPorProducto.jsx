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
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { FilterAreaEncargada } from "./../../components/FilterAreaEncargada";
import { RowEditDetalleFormulaProducto } from "./../../components/componentes-formula-producto/RowEditDetalleFormulaProducto";
import { TextField, Typography } from "@mui/material";
import { getFormulaProductoWithDetalleById } from "./../../helpers/formula_producto/getFormulaProductoWithDetalleById";
import { getMateriaPrimaById } from "./../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { DialogDeleteFormulaProductoDetalle } from "./../../components/componentes-formula-producto/DialogDeleteFormulaProductoDetalle";
import { deleteDetalleFormulaProducto } from "./../../helpers/formula_producto/deleteDetalleFormulaProducto";
import { updateFormulaProductoDetalle } from "./../../helpers/formula_producto/updateFormulaProductoDetalle";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ActualizarFormulaPorProducto = () => {
  // RECIBIMOS LOS PARAMETROS DE LA URL
  const { idForProd } = useParams();

  // DETALLES DEL MAESTRO
  const [formula, setformula] = useState({
    nomProd: "",
    idProdFin: 0,
    reqDet: [], // DETALLE DE FORMULAS
  });

  const { idProdFin, reqDet, nomProd } = formula;

  // ESTADOS PARA DATOS DE DETALLE FORMULA (DETALLE)
  const [productoDetalle, setproductoDetalle] = useState({
    idProd: 0,
    canForProDet: 0.0,
    idAre: 0,
    idAlm: 0,
  });

  const { idProd, canForProDet, idAre, idAlm } = productoDetalle;

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

  // ******** MANEJADORES DE LOS FILTROS **********
  // MANEJADOR DE AGREGAR PRODUCTO AL FILTRO
  const onProductoId = ({ id }) => {
    setproductoDetalle({
      ...productoDetalle,
      idProd: id,
    });
  };

  // MANEJADOR DE AGREGAR CANTIDAD AL FILTRO
  const handleCantidad = ({ target }) => {
    const { name, value } = target;
    setproductoDetalle({
      ...productoDetalle,
      [name]: value,
    });
  };

  // MAJEADOR PARA AGREGAR EL AREA AL FILTRO
  const handleAreaId = ({ id }) => {
    setproductoDetalle({
      ...productoDetalle,
      idAre: id,
    });
  };

  // *********** MANEJADOR DE ACCIONES ***************
  const handleAddProductoDetalle = async (e) => {
    e.preventDefault();

    // primero verificamos que se tenga información
    if (idProd !== 0 && canForProDet > 0 && idAre !== 0) {
      // se verifica si existe alguna coincidencia de lo ingresado
      const itemFound = reqDet.find((element) => element.idProd === idProd);

      if (itemFound) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: "Ya se agrego este producto",
        });
        handleClickFeeback();
      } else {
        if (idAre !== 1 && idAre !== 3 && idAre !== 4) {
          // hacemos una consulta al producto y desestructuramos
          const resultPeticion = await getMateriaPrimaById(idProd);
          const { message_error, description_error, result } = resultPeticion;

          if (message_error.length === 0) {
            const { id, codProd, desCla, desSubCla, nomProd, simMed } =
              result[0];
            // generamos nuestro detalle de formula
            const detalleFormulaProducto = {
              idProd: id,
              idAre: idAre, // area
              idAlm: 1, // almacen principal
              codProd: codProd,
              desCla: desCla,
              desSubCla: desSubCla,
              nomProd: nomProd,
              simMed: simMed,
              canForProDet: canForProDet, // cantidad
            };

            // seteamos el detalle en general de la formula
            const dataDetalle = [...reqDet, detalleFormulaProducto];
            setformula({
              ...formula,
              reqDet: dataDetalle,
            });
          } else {
            setfeedbackMessages({
              style_message: "error",
              feedback_description_error: description_error,
            });
            handleClickFeeback();
          }
        } else {
          setfeedbackMessages({
            style_message: "warning",
            feedback_description_error:
              "El area seleccionada no esta permitido",
          });
          handleClickFeeback();
        }
      }
    } else {
      let advertenciaDetalleFormula = "";
      if (idProd === 0) {
        advertenciaDetalleFormula +=
          "Asigne un producto para agregar el detalle\n";
      }
      if (canForProDet <= 0) {
        advertenciaDetalleFormula +=
          "Asigne una cantidad mayor a 0 para agregar el detalle\n";
      }
      if (idAre === 0) {
        advertenciaDetalleFormula += "Asigne un area para agregar el detalle\n";
      }
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaDetalleFormula,
      });
      handleClickFeeback();
    }
  };

  // Traer datos de la formula y su detalle
  const traerDatosFormulaProductoDetalle = async () => {
    // realizamos la peticion
    const resultPeticion = await getFormulaProductoWithDetalleById(idForProd);
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

  // ****** DELETE DETALLE DE FORMULA *******

  // MANEJADOR DE ELIMINACION DE PRODUCTO
  const deleteItemSelected = async (idForProdTerDet) => {
    // primero realizamos la eliminacion
    const resultPeticion = await deleteDetalleFormulaProducto(idForProdTerDet);
    const { message_error, description_error } = resultPeticion;
    if (message_error.length === 0) {
      // actualizamos el detalle de la formula
      const nuevoDetalleFormula = reqDet.filter((element) => {
        if (element.id !== idForProdTerDet) {
          return true;
        } else {
          return false;
        }
      });

      setformula({
        ...formula,
        reqDet: nuevoDetalleFormula,
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

  const closeDialogDeleteDetalle = () => {
    // ocultamos el modal
    setMostrarDialog(false);
    // dejamos el null la data del detalle
    setItemSeleccionado(null);
  };

  // MOSTRAR Y OCULTAR DETALLE DE REQUISICION MOLIENDA
  const showDialogDeleteItem = (idProd) => {
    const formulaDetalle = reqDet.filter((element) => {
      if (element.idProd === idProd) {
        return element;
      } else {
        return false;
      }
    });
    // si es algun aditivo
    if (formulaDetalle[0].id !== undefined) {
      // seteamos la data de la requisicion seleccionada
      setItemSeleccionado(formulaDetalle[0]);
      // mostramos el modal
      setMostrarDialog(true);
    } else {
      const filterDataDetalle = reqDet.filter((element) => {
        if (element.idProd !== idProd) {
          return true;
        } else {
          return false;
        }
      });

      setformula({
        ...formula,
        reqDet: filterDataDetalle,
      });
    }
  };

  // *********** EDICION DE LOS CAMPOS DEL DETALLE *************

  // EDICION DE CANTIDAD
  const handleFormulaDetalle = ({ target }, idItem) => {
    const { value } = target;
    const editFormDetalle = reqDet.map((element) => {
      if (element.idProd === idItem) {
        return {
          ...element,
          canForProDet: value,
        };
      } else {
        return element;
      }
    });
    setformula({
      ...formula,
      reqDet: editFormDetalle,
    });
  };

  // EDICION DE ALMACEN
  const handledAlmacenEncargado = (idAlm, idItem) => {
    const editFormDetalle = reqDet.map((element) => {
      if (element.idProd === idItem) {
        return {
          ...element,
          idAlm: idAlm,
        };
      } else {
        return element;
      }
    });

    setformula({
      ...formula,
      reqDet: editFormDetalle,
    });
  };

  // ********* EDICION DE DATOS DE LA FORMULA ***********

  // añadir producto final a formula
  const onAddProducto = ({ id }) => {
    setformula({
      ...formula,
      idProdFin: id,
    });
  };

  // ************ SUBMIT UPDATE FORMULA PRODUCTO **********
  // FUNCION PARA ACTUALIZAR FORMULARIO
  const updateFormulaProducto = async () => {
    const resultPeticion = await updateFormulaProductoDetalle(formula);
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
  const handleSubmitFormulaProducto = (e) => {
    e.preventDefault();
    if (reqDet.length === 0) {
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Asegurese de llenar los datos requeridos",
      });
      handleClickFeeback();
    } else {
      const validAreaEncargada = reqDet.find((element) => element.idAlm === 0);
      if (validAreaEncargada) {
        // MANEJAMOS FORMULARIOS INCOMPLETOS
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Asegurese de asignar almacenes de origen para cada item nuevo agregado",
        });
        handleClickFeeback();
      } else {
        setdisableButton(true);
        // LLAMAMOS A LA FUNCION CREAR MATERIA PRIMA
        updateFormulaProducto();
      }
    }
  };

  useEffect(() => {
    // traer la data de la formula
    traerDatosFormulaProductoDetalle();
  }, []);

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">
          Actualizar formula de presentacion final{" "}
        </h1>
        <div className="row mt-4 mx-2">
          <div className="card d-flex">
            <h6 className="card-header">Datos de la formula</h6>
            <div className="card-body">
              <form>
                {/* PRESENTACION FINAL */}
                <div className="mb-3 row">
                  <label htmlFor="nombre" className="col-md-2 col-form-label">
                    Producto final
                  </label>
                  <div className="col-md-5">
                    <p>{nomProd}</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="row mt-4 mx-2">
          <div className="card d-flex">
            <h6 className="card-header">Detalle de la formula</h6>
            <div className="card-body">
              <form className="row mb-4 mt-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-3">
                  <label className="form-label">Producto</label>
                  <FilterAllProductos onNewInput={onProductoId} />
                </div>

                {/* AGREGAR AREA */}
                <div className="col-md-2">
                  <label className="form-label">Area solicitante</label>
                  <FilterAreaEncargada onNewInput={handleAreaId} />
                </div>

                {/* AGREGAR CANTIDAD*/}
                <div className="col-md-2">
                  <label className="form-label">Cantidad</label>
                  <TextField
                    type="number"
                    onChange={handleCantidad}
                    value={canForProDet}
                    name="canForProDet"
                    className="form-control"
                    size="small"
                  />
                </div>

                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-3 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoDetalle}
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
                <h6 className="card-header">Detalle materia prima</h6>
                <div className="card-body">
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
                            <TableCell align="left" width={280}>
                              <b>Nombre</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>U.M</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Cantidad</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Acciones</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reqDet.map((row, i) => {
                            if (row.idAre === 2 || row.idAre === 7) {

                              console.log("Materia prima Este es nuestro row: ",row);

                              return (
                                <RowEditDetalleFormulaProducto
                                  key={row.idProd}
                                  detalle={row}
                                  onDeleteDetalleFormula={showDialogDeleteItem}
                                  onChangeFormulaDetalle={handleFormulaDetalle}
                                  onChangeAlmacenEncargadoDetalle={
                                    handledAlmacenEncargado
                                  }
                                />
                              );
                            }
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </div>
              {/* DETALLE DE ENVASADO */}
              <div className="card text-bg-success d-flex mt-3">
                <h6 className="card-header">Detalle envasado</h6>
                <div className="card-body">
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
                            <TableCell align="left" width={280}>
                              <b>Nombre</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>U.M</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Cantidad</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Acciones</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reqDet.map((row, i) => {
                            if (row.idAre === 5) {
                              console.log("Materia prima Este es nuestro row: ",row);
                              return (
                                <RowEditDetalleFormulaProducto
                                  key={row.idProd}
                                  detalle={row}
                                  onDeleteDetalleFormula={showDialogDeleteItem}
                                  onChangeFormulaDetalle={handleFormulaDetalle}
                                  onChangeAlmacenEncargadoDetalle={
                                    handledAlmacenEncargado
                                  }
                                />
                              );
                            }
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </div>
              {/* DETALLE DE ENCAJONADO */}
              <div className="card text-bg-warning d-flex mt-3">
                <h6 className="card-header">Detalle encajonado</h6>
                <div className="card-body">
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
                            <TableCell align="left" width={280}>
                              <b>Nombre</b>
                            </TableCell>
                            <TableCell align="left" width={20}>
                              <b>U.M</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Cantidad</b>
                            </TableCell>
                            <TableCell align="left" width={120}>
                              <b>Acciones</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reqDet.map((row, i) => {
                            if (row.idAre === 6) {
                              console.log("actualizar");
                              console.log("Materia prima Este es nuestro row: ",row);
                              return (
                                <RowEditDetalleFormulaProducto
                                  key={row.idProd}
                                  detalle={row}
                                  onDeleteDetalleFormula={showDialogDeleteItem}
                                  onChangeFormulaDetalle={handleFormulaDetalle}
                                  onChangeAlmacenEncargadoDetalle={
                                    handledAlmacenEncargado
                                  }
                                />
                              );
                            }
                          })}
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
              onClick={handleSubmitFormulaProducto}
              className="btn btn-primary"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* DIALOG DELETE DETALLE */}
      {mostrarDialog && (
        <DialogDeleteFormulaProductoDetalle
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
