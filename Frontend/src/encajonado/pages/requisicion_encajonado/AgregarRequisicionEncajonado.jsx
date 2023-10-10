import React, { useState, useRef } from "react";
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
import { useNavigate } from "react-router-dom";
import { FilterFormula } from "./../../components/FilterFormula";
import { getFormulaWithDetalleById } from "./../../helpers/formula/getFormulaWithDetalleById";
import { getMateriaPrimaById } from "../../../helpers/Referenciales/producto/getMateriaPrimaById";
import { createRequisicionWithDetalle } from "./../../helpers/requisicion/createRequisicionWithDetalle";
import { FilterMateriaPrima } from "./../../../components/ReferencialesFilters/Producto/FilterMateriaPrima";
import { FilterLoteProduccion } from "./../../components/FilterLoteProduccion";
import { getLoteProduccionById } from "./../../helpers/requisicion/getLoteProduccionById";
import { RowDetalleFormula } from "../../components/RowDetalleFormula";
import { getFormulaWithDetalleByPrioridad } from "./../../helpers/formula/getFormulaWithDetalleByPrioridad";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AgregarRequisicionEncajonado = () => {
  // ESTADO PARA LOS DATOS DEL FILTRO POR LOTE PRODUCCION
  const [produccionLote, setProduccionLote] = useState({
    idProd: 0,
    codLotProd: "",
    klgLotProd: "",
    canLotProd: "",
    nomProd: "",
  });
  const { idProd, codLotProd, klgLotProd, canLotProd, nomProd } =
    produccionLote;

  // ESTADO PARA LOS DATOS DEL FILTRO POR FORMULA
  const [formula, setformula] = useState({
    idFor: 0,
  });

  const { idFor } = formula;

  // ESTADOS PARA LOS DATOS DE REQUISICION
  const [requisicion, setRequisicion] = useState({
    idProdc: 0,
    idProdt: 0,
    reqMolDet: [], // DETALLE DE REQUISICION MOLIENDA
  });
  const { idProdc, idProdt, reqMolDet } = requisicion;

  // ESTADOS PARA DATOS DE DETALLE FORMULA (DETALLE)
  const [materiaPrimaDetalle, setmateriaPrimaDetalle] = useState({
    idMateriaPrima: 0,
    cantidadMateriaPrima: 0,
  });
  const { idMateriaPrima, cantidadMateriaPrima } = materiaPrimaDetalle;

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

  // ELIMINAR DETALLE DE REQUISICION
  const deleteDetalleRequisicion = (idItem) => {
    // FILTRAMOS EL ELEMENTO ELIMINADO
    const nuevaDataDetalleRequisicion = reqMolDet.filter((element) => {
      if (element.idMatPri !== idItem) {
        return element;
      } else {
        return false;
      }
    });

    // VOLVEMOS A SETEAR LA DATA
    setRequisicion({
      ...requisicion,
      reqMolDet: nuevaDataDetalleRequisicion,
    });
  };

  // ACTUALIZAR DETALLE DE REQUISICION
  // MANEJADOR PARA ACTUALIZAR REQUISICION
  const handledFormularioDetalle = ({ target }, idItem) => {
    const { value } = target;
    const editFormDetalle = reqMolDet.map((element) => {
      if (element.idMatPri === idItem) {
        return {
          ...element,
          canMatPriFor: value,
        };
      } else {
        return element;
      }
    });

    setRequisicion({
      ...requisicion,
      reqMolDet: editFormDetalle,
    });
  };

  // FUNCION ASINCRONA PARA CREAR LA REQUISICION CON SU DETALLE
  const crearRequisicion = async () => {
    console.log(requisicion);
    const { message_error, description_error } =
      await createRequisicionWithDetalle(requisicion);

    if (message_error.length === 0) {
      // regresamos a la anterior vista
      onNavigateBack();
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

  // SUBMIT FORMULARIO DE REQUISICION (M-D)
  const handleSubmitRequisicion = (e) => {
    e.preventDefault();
    console.log(reqMolDet);
    if (idProdc === 0 || reqMolDet.length === 0) {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error:
          "Asegurate de completar los campos requeridos",
      });
      handleClickFeeback();
    } else {
      // setdisableButton(true);
      // LLAMAMOS A LA FUNCION CREAR REQUISICION
      crearRequisicion();
      // RESETEAMOS LOS VALORES
    }
  };

  // FUNCION ASINCRONA PARA TRAER A LA FORMULA Y SUS DETALLES
  const traerDatosFormulaDetalle = async () => {
    const resultPeticion = await getFormulaWithDetalleById(idFor);
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      const { forDet } = result[0];
      setRequisicion({
        ...requisicion,
        reqMolDet: forDet,
      });
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };
  // MANEJADOR COMPLETAR FORMULARIO SEGUN FORMULA
  const handleCompleteFormFormula = (e) => {
    e.preventDefault();
    if (idFor === 0) {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Escoge una formula",
      });
      handleClickFeeback();
    } else {
      traerDatosFormulaDetalle();
    }
  };

  // FILTER POR FORMULA
  const onFormula = (valueId) => {
    setformula({
      ...formula,
      idFor: valueId,
    });
  };

  // FUNCION ASINCRONA PARA TRAER LA FORMULA APROPIADA
  const traerDatosFormulaDetalleApropiada = async () => {
    /*
      FORMULA QUE CORRESPONDA AL PESO Y PRODUCTO REQUERIDOS
    */
    const body = {
      idProd: requisicion.idProdt,
      lotKgrFor: klgLotProd,
    };
    const resultPeticion = await getFormulaWithDetalleByPrioridad(body);
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      if (result.length === 0) {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "No se encontro ninguna formula apropiada",
        });
        handleClickFeeback();
      } else {
        // seteamos la data
        const { forDet } = result[0];
        setRequisicion({
          ...requisicion,
          reqMolDet: forDet,
        });

        // mostramos feedback
        setfeedbackMessages({
          style_message: "success",
          feedback_description_error: "Se encontro una formula apropiada",
        });
        handleClickFeeback();
      }
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // FUNCION ASINCRONA PARA TRAER AL LOTE DE PRODUCCION Y SUS DATOS
  const traerDatosLoteProduccion = async () => {
    const { result } = await getLoteProduccionById(idProd);
    const { id, idProdt, codLotProd, nomProd, canLotProd, klgLotProd } =
      result[0];

    // seteamos el estado de los datos de produccion lote
    setProduccionLote({
      ...produccionLote,
      idProdt: idProdt,
      codLotProd: codLotProd,
      nomProd: nomProd,
      canLotProd: canLotProd,
      klgLotProd: klgLotProd,
    });

    // seteamos el estado de los datos de requisicion
    setRequisicion({
      ...requisicion,
      idProdc: id,
      idProdt: idProdt,
    });
  };

  const handleCompleteDatosProduccionLote = (e) => {
    e.preventDefault();
    if (idProd === 0) {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Escoge un lote de produccion",
      });
      handleClickFeeback();
    } else {
      traerDatosLoteProduccion();
    }
  };

  // FILTER POR PRODUCCION LOTE
  const onProduccionLote = (valueId) => {
    setProduccionLote({
      ...produccionLote,
      idProd: valueId,
    });
  };

  // AGREGAR MATERIA PRIMA A DETALLE DE REQUISICION
  const handleAddNewMateriPrimaDetalle = async (e) => {
    e.preventDefault();
    // PRIMERO VERIFICAMOS QUE LOS INPUTS TENGAN DATOS
    if (idMateriaPrima !== 0 && cantidadMateriaPrima > 0) {
      // PRIMERO VERIFICAMOS SI EXISTE ALGUNA COINCIDENCIA DE LO INGRESADO
      const itemFound = reqMolDet.find(
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
            codProd: codProd,
            desCla: desCla,
            desSubCla: desSubCla,
            nomProd: nomProd,
            simMed: simMed,
            canMatPriFor: cantidadMateriaPrima,
          };

          // SETEAMOS SU ESTADO PARA QUE PUEDA SER MOSTRADO EN LA TABLA DE DETALLE
          const dataMateriaPrimaDetalle = [
            ...reqMolDet,
            detalleFormulaMateriaPrima,
          ];
          setRequisicion({
            ...requisicion,
            reqMolDet: dataMateriaPrimaDetalle,
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
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "Asegurese de llenar los datos requeridos",
      });
      handleClickFeeback();
    }
  };

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Agregar Requisicion</h1>
        {/* DATOS DE LA PRODUCCION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Lote de produccion</h6>
            <div className="card-body d-flex justify-content-between align-items-center">
              {/* FILTRO POR LOTE DE PRODUCCION */}
              <div className="col-md-5">
                <label htmlFor="inputPassword4" className="form-label">
                  Lote de produccion
                </label>
                <FilterLoteProduccion onNewInput={onProduccionLote} />
              </div>

              {/* BOTON AGREGAR DATOS LOTE DE PRODUCCION */}
              <div className="col-md-3">
                <button
                  onClick={handleCompleteDatosProduccionLote}
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
                  Jalar datos de produccion
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DATOS DE LA REQUISICION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos del lote de produccion</h6>
            <div className="card-body">
              {/* NUMERO DE LOTE */}
              <div className="mb-3 row">
                <label htmlFor="nombre" className="col-sm-2 col-form-label">
                  Numero de Lote
                </label>
                <div className="col-md-2">
                  <input disabled value={codLotProd} className="form-control" />
                </div>
              </div>
              {/* PRODUCTO */}
              <div className="mb-3 row">
                <label htmlFor="nombre" className="col-sm-2 col-form-label">
                  Producto
                </label>
                <div className="col-md-3">
                  <input disabled value={nomProd} className="form-control" />
                </div>
              </div>
              {/* CANTIDAD REQUISICION */}
              <div className="mb-3 row">
                <label htmlFor="categoria" className="col-sm-2 col-form-label">
                  Cantidad
                </label>
                <div className="col-md-2 d-flex">
                  <input
                    disabled
                    value={canLotProd}
                    className="form-control me-2"
                  />
                </div>
              </div>
              {/* KILOGRAMOS POR LOTE */}
              <div className="mb-3 row">
                <label htmlFor="stock" className="col-sm-2 col-form-label">
                  Kilogramos de lote
                </label>
                <div className="col-md-2">
                  <input disabled value={klgLotProd} className="form-control" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROL PARA JALAR DE FORMULA */}
        {codLotProd.length !== 0 && (
          <div className="row mt-4 mx-4">
            <div className="card d-flex">
              <h6 className="card-header">Plantilla de formula</h6>
              <div className="card-body d-flex justify-content-between align-items-center">
                {/* FILTRO POR FORMULA */}
                <div className="col-md-5">
                  <label className="form-label">Formula</label>
                  <div className="col d-flex">
                    <div className="col-9">
                      <FilterFormula onNewInput={onFormula} />
                    </div>
                    <div className="col-3">
                      <button
                        onClick={handleCompleteFormFormula}
                        className="btn btn-primary ms-2"
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
                        Jalar
                      </button>
                    </div>
                  </div>
                </div>
                {/* BOTON AGREGAR DATOS FORMULA */}
                <div className="col-md-7 d-flex justify-content-end">
                  <button
                    onClick={traerDatosFormulaDetalleApropiada}
                    className="btn btn-success"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-search me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                    Buscar formula apropiada
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">
              <b>Detalle de la requisicion</b>
            </h6>
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
                <div className="col-md-4">
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
                        <TableCell align="left" width={100}>
                          <b>Codigo</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Clase</b>
                        </TableCell>
                        <TableCell align="left" width={140}>
                          <b>Sub clase</b>
                        </TableCell>
                        <TableCell align="left" width={200}>
                          <b>Nombre</b>
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
                      {reqMolDet
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row, i) => (
                          <RowDetalleFormula
                            key={row.idMatPri}
                            detalle={row}
                            onDeleteDetalleFormula={deleteDetalleRequisicion}
                            onChangeFormulaDetalle={handledFormularioDetalle}
                          />
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* PAGINACION DE LA TABLA */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={reqMolDet.length}
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
            onClick={handleSubmitRequisicion}
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
          {feedback_description_error}
        </Alert>
      </Snackbar>
    </>
  );
};
