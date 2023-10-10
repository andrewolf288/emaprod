import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { getRequisicionSeleccionDetalleById } from "./../../helpers/requisicion-seleccion/getRequisicionSeleccionDetalleById";
import { getEntradasDisponiblesForSeleccion } from "./../../helpers/requisicion-seleccion/getEntradasDisponiblesForSeleccion";
import { createSalidasStockByReqSelDet } from "./../../helpers/requisicion-seleccion/createSalidasStockByReqSelDet";
import FechaPicker from "./../../../components/Fechas/FechaPicker";
import { RowEntradaDisponibleSeleccion } from "./../../components/RowEntradaDisponibleSeleccion";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
export const SalidaStock = () => {
  const refTable = useRef();

  const location = useLocation();

  const { idReqSelDet = "" } = queryString.parse(location.search);

  // ESTADOS PARA EL FORMULARIO DE SALIDA
  const [salidaSeleccion, setsalidaSeleccion] = useState({
    idReqSel: 0,
    idReqSelDet: 0,
    codLotSel: "",
    idMatPri: 0,
    codProd: "",
    nomProd: "",
    salStoSelDet: [],
    fecSalStoReqSel: "",
    canReqSelDet: 0,
  });

  const {
    idReqSel,
    codLotSel,
    idMatPri,
    codProd,
    nomProd,
    fecSalStoReqSel,
    canReqSelDet,
    salStoSelDet,
  } = salidaSeleccion;

  // ESTADO PARA LAS ENTRADAS DISPONIBLES
  const [entradasDisponibles, setentradasDisponibles] = useState([]);

  // ESTADO PARA CONTROLAR LAS CANTIDADES DE LAS DIFERENTES ENTRADAS
  const [count, setcount] = useState(0);

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
    setsalidaSeleccion({
      ...salidaSeleccion,
      [name]: value,
    });
  };

  // TRAER DATOS DE REQUISICION MOLIENDA DETALLE
  const traerDatosRequisicionSeleccionDetalle = async () => {
    if (idReqSelDet.length !== 0) {
      try {
        const resultData = await getRequisicionSeleccionDetalleById(
          idReqSelDet
        );
        const { message_error, description_error, result } = resultData;

        if (message_error.length === 0) {
          const {
            idReqSel,
            nomProd,
            idMatPri,
            codLotSel,
            codProd,
            canReqSelDet,
          } = result[0];
          // SETEAMOS EL CONTADOR
          setcount(result[0].canReqSelDet);
          setsalidaSeleccion({
            ...salidaSeleccion,
            idReqSel: idReqSel,
            idReqSelDet: parseInt(idReqSelDet, 10),
            nomProd: nomProd,
            idMatPri: idMatPri,
            codLotSel: codLotSel,
            codProd: codProd,
            canReqSelDet: canReqSelDet,
          });
        } else {
          console.log("Se proporciono un id inexistente");
          setfeedbackMessages({
            style_message: "error",
            feedback_description_error: description_error,
          });
          handleClickFeeback();
        }
        setdisableButton(false);
      } catch (e) {
        console.log(e);
      }
    }
  };

  // TRAER DATOS DE ENTRADAS DISPONIBLES PARA LA REQUISICION MOLIENDA DETALLE
  const traerDatosEntradasDisponibles = async () => {
    const { result } = await getEntradasDisponiblesForSeleccion(idMatPri);
    setentradasDisponibles(result);
  };

  // Habilitar input de envio
  const onChangeCheckedEntrada = (
    isChecked,
    valueEntrada,
    valueInput,
    idEntrada,
    setInputValue,
    idAlmacen
  ) => {
    // Obtenemos la cantidad actual de la entrada
    let cantidadDisponible = parseInt(valueEntrada, 10);
    // Obtenemos la cantidad actual del input de entrada
    let cantidadInputEntrada = parseInt(valueInput, 10);
    console.log(cantidadDisponible, cantidadInputEntrada);
    console.log(count);

    // Verificamos si la casilla fue seleccionada
    if (isChecked) {
      // si la cantidad requerida es mayor o igual a la cantidad de la entrada
      if (count >= cantidadDisponible) {
        // Actualizamos el input con toda la cantidad de su entrada
        setInputValue(cantidadDisponible);
        // Actualizamos la cantidad requerida
        setcount(count - cantidadDisponible);

        // Añadimos la informacion a la salida detalle
        let aux = [...salStoSelDet];
        console.log(aux);
        aux.push({
          idEntSto: idEntrada,
          canSalReqSel: cantidadDisponible,
          idAlm: idAlmacen,
        });
        setsalidaSeleccion({
          ...salidaSeleccion,
          salStoSelDet: aux,
        });

        console.log("COUNT: " + (count - cantidadDisponible));
      }
      // si la cantidad requerida es menor a la cantidad de la entrada
      else {
        // si la cantidad requerida es igual a 0
        if (count === 0) {
          setInputValue(0);
          console.log("COUNT: " + 0);
        }
        // si la cantidad requerida es menor a la cantidad de la entrada
        else {
          // inputSelected.value = count;
          setInputValue(count);
          setcount(0);
          // Añadimos la informacion a la salida detalle
          let aux = [...salStoSelDet];
          console.log(aux);
          aux.push({
            idEntSto: idEntrada,
            canSalReqSel: count,
            idAlm: idAlmacen,
          });
          setsalidaSeleccion({
            ...salidaSeleccion,
            salStoSelDet: aux,
          });
          console.log("COUNT: " + 0);
        }
      }
    } else {
      // inputSelected.disabled = true;
      setcount(count + cantidadInputEntrada);
      // Eliminamos la informacion deseleccionada
      let aux = salStoSelDet.filter((element) => {
        if (element.idEntSto !== idEntrada) {
          return true;
        } else {
          return false;
        }
      });
      console.log(aux);
      setsalidaSeleccion({
        ...salidaSeleccion,
        salStoSelDet: aux,
      });
      console.log("COUNT: " + (count + cantidadInputEntrada));
      setInputValue(0);
    }
  };

  const crearSalidasStockByRequisicionSeleccionDetalle = async () => {
    console.log(salidaSeleccion);
    const { message_error, description_error } =
      await createSalidasStockByReqSelDet(salidaSeleccion);

    if (message_error.length === 0) {
      console.log("Se agregaron las salidas exitosamente");
      // Volvemos a la vista de requisiciones
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

  // enviar salida
  const onSubmitSalidaStock = (e) => {
    e.preventDefault();
    // CONDICIONES DE ENVIO
    if (salStoSelDet.length === 0 || idReqSel === 0 || idMatPri === 0) {
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      if (salStoSelDet.length === 0) {
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error:
            "No hay entradas de materia prima para este producto.",
        });
        handleClickFeeback();
      } else {
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error:
            "Asegurese de llenar los datos requeridos",
        });
        handleClickFeeback();
      }
    } else {
      // PRIMERO HACEMOS UNA VALIDACION SI LA SALIDA DE STOCK DETALLE CUMPLE CON LO REQUERIDO
      let cantSalStoDet = 0;
      salStoSelDet.forEach((element) => {
        cantSalStoDet += parseInt(element.canSalReqSel);
      });

      // Si las entradas elegidas cumplen con la cantidada requerida
      if (cantSalStoDet != canReqSelDet) {
        console.log(cantSalStoDet, canReqSelDet);
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error:
            "Asegurese de completar la cantidad requerida. Si no alcanza lo solicitado, realizace una entrada de stock de la materia prima",
        });
        handleClickFeeback();
      } else {
        // Deshabilitamos el boton de enviar
        setdisableButton(true);
        // llamamos a la funcion de registrar salidas segun el detalle
        crearSalidasStockByRequisicionSeleccionDetalle();
      }
    }
  };

  useEffect(() => {
    // TRAEMOS DATOS DE REQUISICION DETALLE
    traerDatosRequisicionSeleccionDetalle();
  }, []);

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Registrar salida de seleccion</h1>
        <form className="mt-4 form-inline">
          <div className="mb-3 row">
            <div className="card d-flex">
              <h6 className="card-header" id="response-serie-number-sale">
                Requisicion Seleccion
              </h6>
              <div className="card-body">
                <label htmlFor="codigo-lote" className="col-form-label">
                  <b>Código de lote</b>
                </label>
                <div className="col-md-2">
                  <input
                    type="text"
                    name="codLotSel"
                    value={codLotSel}
                    readOnly
                    className="form-control"
                    onChange={handledForm}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3 row">
            <div className="card d-flex">
              <h6 className="card-header" id="response-serie-number-sale">
                Materia Prima
              </h6>
              <div className="card-body">
                <div className="row">
                  <div className="form-group col-md-2">
                    <label
                      htmlFor="codigo-materia-prima"
                      className="col-form-label"
                    >
                      <b>Nombre</b>
                    </label>
                    <input
                      type="text"
                      name="nomProd"
                      value={nomProd}
                      readOnly
                      className="form-control"
                      onChange={handledForm}
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label
                      htmlFor="codigo-materia-prima"
                      className="col-form-label"
                    >
                      <b>Codigo Sigo</b>
                    </label>
                    <input
                      type="text"
                      name="codProd"
                      value={codProd}
                      readOnly
                      className="form-control"
                      onChange={handledForm}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3 row">
            <div className="card d-flex">
              <h6 className="card-header" id="response-serie-number-sale">
                Datos de salida
              </h6>
              <div className="card-body">
                <label
                  htmlFor="codigo-materia-prima"
                  className="col-form-label"
                >
                  <b>Entradas disponibles</b>
                </label>
                <button
                  onClick={traerDatosEntradasDisponibles}
                  className="btn btn-outline-secondary ms-3"
                  type="button"
                  id="agregarCodigoProveedor"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                  </svg>
                </button>

                {/* TABLA DE ENTRADAS DISPONIBLES */}
                <div className="table-responsive mt-4">
                  <table className="table text-center">
                    <thead className="table-success">
                      <tr>
                        <th scope="col">Almacen</th>
                        <th scope="col">Codigo</th>
                        <th scope="col">Seleccionado</th>
                        <th scope="col">Por seleccionar</th>
                        <th scope="col">Fecha ingreso</th>
                        <th scope="col">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entradasDisponibles.map((element, i) => (
                        <RowEntradaDisponibleSeleccion
                          key={element.id}
                          entrada={element}
                          onChangeInputValue={onChangeCheckedEntrada}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CANTIDAD DE SALIDA */}
                <div className="mb-3 row">
                  <label
                    htmlFor="cantidad-salida"
                    className="col-sm-2 col-form-label"
                  >
                    Cantidad Salida
                  </label>
                  <div className="col-md-2">
                    <input
                      type="number"
                      name="canReqSelDet"
                      value={canReqSelDet}
                      readOnly
                      className="form-control"
                      onChange={handledForm}
                    />
                  </div>
                </div>

                {/* FECHA DE SALIDA */}
                <div className="mb-3 row">
                  <label
                    htmlFor="fecha-salida-stock"
                    className="col-sm-2 col-form-label"
                  >
                    Fecha de salida
                  </label>
                  <div className="col-md-3">
                    <FechaPicker />
                  </div>
                </div>
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
              Volver
            </button>
            <button
              type="submit"
              disabled={disableButton}
              onClick={(e) => onSubmitSalidaStock(e)}
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
