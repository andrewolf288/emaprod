import React, { useState, useRef, useEffect } from "react";
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
import { FilterProductoProduccion } from "./../../../components/ReferencialesFilters/Producto/FilterProductoProduccion";
import { Typography } from "@mui/material";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const AgregarRequisicionFrescos = () => {
  // ESTADO PARA LOS DATOS DEL FILTRO POR LOTE PRODUCCION
  const [produccionLote, setProduccionLote] = useState({
    idProd: 0,
    codLotProd: "",
    klgLotProd: "",
    canLotProd: "",
    nomProd: "",
  });

  var idFrescos = 50; // el autocompletado cargara frescos
  var idSalPar = 53; // el autocompletado cargara sales parrillera

  const { idProd, codLotProd, klgLotProd, canLotProd, nomProd } =
    produccionLote;

  // ESTADOS PARA LOS DATOS DE REQUISICION
  const [requisicion, setRequisicion] = useState({
    idProdc: 0,
    idProdt: 0,
    reqMolDet: [],
  });

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
    const nuevaDataDetalleRequisicion = requisicion.reqMolDet.filter(
      (element) => {
        if (element.idMatPri !== idItem) {
          return element;
        } else {
          return false;
        }
      }
    );

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
    const editFormDetalle = requisicion.reqMolDet.map((element) => {
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
    requisicion.klgLotProd = produccionLote.klgLotProd;
    requisicion.codLotProd = produccionLote.codLotProd.padStart(3, "0");
    requisicion.canLotProd = produccionLote.canLotProd;

    console.log(requisicion);
    var response = await createRequisicionWithDetalle(requisicion);

    const { message_error, description_error } = response;

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

  // SUBMIT FORMULARIO DE REQUISICION (M-D)
  const handleSubmitRequisicion = (e) => {
    e.preventDefault();
    let handleErrors = "";

    if (
      produccionLote.codLotProd.length === 0 ||
      produccionLote.codLotProd.length > 3 ||
      isNaN(produccionLote.canLotProd) ||
      produccionLote.canLotProd <= 0 ||
      requisicion.idProdt === 0 ||
      requisicion.reqMolDet.length === 0
    ) {
      if (isNaN(produccionLote.canLotProd)) {
        handleErrors += "- No se proporciono una cantidad de lote\n";
      }
      if (produccionLote.canLotProd <= 0) {
        handleErrors += "- La cantidad de lote debe ser mayor a 0\n";
      }
      if (produccionLote.codLotProd.length === 0) {
        handleErrors +=
          "- No se ha proporcionado un codigo de lote de producción\n";
      }
      if (produccionLote.codLotProd.length > 3) {
        handleErrors += "- El codigo de lote solo debe ser de 3 dígitos\n";
      }
      if (requisicion.idProdt === 0) {
        handleErrors += "- No has seleccionado un producto intermedio\n";
      }
      if (requisicion.reqMolDet.length === 0) {
        handleErrors +=
          "- No se ha agregado ningun elemento al detalle de la requisición\n";
      }

      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: handleErrors,
      });
      handleClickFeeback();
    } else {
      // creamos la requisicion
      crearRequisicion();
    }
  };

  // FUNCION ASINCRONA PARA TRAER LA FORMULA APROPIADA
  async function getProductosFormulaDetalle(body, requisicion) {
    const resultPeticion = await getFormulaWithDetalleByPrioridad(body);

    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      if (result.length === 0) {
      } else {
        var { forDet } = result[0];

        var klgLotProd = 0;
        forDet.map((obj) => {
          if (obj.canMatPriFor) {
            obj.canMatPriForCopy = parseFloat(obj.canMatPriFor);
            klgLotProd += obj.canMatPriForCopy;
          }
        });

        setRequisicion({
          ...requisicion,
          reqMolDet: forDet,
        });

        console.log(klgLotProd);
        if (!body.klgLotProd) {
          setProduccionLote({
            ...produccionLote,
            canLotProd: 1,
            klgLotProd: klgLotProd,
          });
        }
      }
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  }

  const onAddProductoIntermedio = ({ id }) => {
    //console.log(id);

    var requisicion = {
      ...requisicion,
      idProdc: -1,
      idProdt: id,
    };
    const body = {
      idProd: id,
      canLotProd: canLotProd,
      klgLotProd: "",
    };

    // console.log(body, requisicion);
    getProductosFormulaDetalle(body, requisicion);
  };

  const onChangeCantidadLote = (e) => {
    const { name, value } = e.target;
    const parseValue = parseFloat(value);
    var klgLotProd = 0;
    requisicion.reqMolDet.map((obj) => {
      obj.canMatPriFor = parseFloat(obj.canMatPriForCopy) * parseValue;
      klgLotProd += obj.canMatPriFor;
      obj.canMatPriFor = obj.canMatPriFor.toFixed(3);
    });

    setProduccionLote({
      ...produccionLote,
      [name]: parseValue,
      klgLotProd: klgLotProd,
    });
    setRequisicion({
      ...requisicion,
    });
  };

  useEffect(() => {
    //console.log(idProd);
  }, [idProd]);

  // AGREGAR MATERIA PRIMA A DETALLE DE REQUISICION
  const handleAddNewMateriPrimaDetalle = async (e) => {
    e.preventDefault();
    // PRIMERO VERIFICAMOS QUE LOS INPUTS TENGAN DATOS
    if (idMateriaPrima !== 0 && cantidadMateriaPrima > 0) {
      // PRIMERO VERIFICAMOS SI EXISTE ALGUNA COINCIDENCIA DE LO INGRESADO
      const itemFound = requisicion.reqMolDet.find(
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
            canMatPriForCopy: cantidadMateriaPrima,
          };

          // SETEAMOS SU ESTADO PARA QUE PUEDA SER MOSTRADO EN LA TABLA DE DETALLE
          const dataMateriaPrimaDetalle = [
            ...requisicion.reqMolDet,
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

        {/* DATOS DE LA REQUISICION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos del lote de produccion</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <label htmlFor="nombre" className="col-sm-2 col-form-label">
                  Producto
                </label>
                <div className="col-md-3">
                  {produccionLote.idProd == 0 ? (
                    <FilterProductoProduccion
                      onNewInput={onAddProductoIntermedio}
                      idFrescos={idFrescos}
                      idSalPar={idSalPar}
                    />
                  ) : (
                    <input
                      disabled
                      value={produccionLote.nomProd}
                      className="form-control"
                    />
                  )}
                </div>
              </div>

              <div className="mb-3 row">
                <label htmlFor="categoria" className="col-sm-2 col-form-label">
                  Numero Lote
                </label>
                <div className="col-md-3">
                  <input
                    type="number"
                    name="codLotProd"
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setProduccionLote({
                        ...produccionLote,
                        [name]: value,
                      });
                    }}
                    value={codLotProd}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="categoria" className="col-sm-2 col-form-label">
                  Cantidad Lote
                </label>
                <div className="col-md-3">
                  <input
                    type="number"
                    name="canLotProd"
                    onChange={onChangeCantidadLote}
                    value={canLotProd}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="categoria" className="col-sm-2 col-form-label">
                  Peso programado
                </label>
                <div className="col-md-3">
                  <input
                    type="number"
                    name="klgLotProd"
                    disabled
                    value={klgLotProd}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

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
                      {requisicion.reqMolDet
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
                  count={requisicion.reqMolDet.length}
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
            //disabled={disableButton}
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
          <Typography whiteSpace={"pre-line"}>
            {feedback_description_error}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};
