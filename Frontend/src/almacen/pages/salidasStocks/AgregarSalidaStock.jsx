import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getRequisicionMoliendaDetalleById } from "../../helpers/requisicion-molienda/getRequisicionMoliendaDetalleById";
import queryString from "query-string";
import { getEntradasDisponibles } from "../../helpers/salidas-stock/getEntradasDisponibles";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { createSalidasStockByReqMolDet } from "../../helpers/salidas-stock/createSalidasStockByReqMolDet";
import FechaPicker from "../../../components/Fechas/FechaPicker";
// IMPORTACIONES PARA TABLE
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { RowEntradaDisponible } from "../../components/RowEntradaDisponible";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
export const AgregarSalidaStock = () => {
  // importacion para extaer la query
  const location = useLocation();
  const { idReqMolDet = "" } = queryString.parse(location.search);

  // ESTADOS PARA EL FORMULARIO DE SALIDA
  const [salidaMolienda, setSalidaMolienda] = useState({
    idReqMol: 0,
    idReqMolDet: 0,
    codLotProd: "",
    idMatPri: 0,
    codProd: "",
    nomProd: "",
    salStoMolDet: [],
    fecSalStoReqMol: "",
    canReqMolDet: 0,
    docSalSto: "",
  });

  const {
    idReqMol,
    codLotProd,
    idMatPri,
    codProd,
    nomProd,
    fecSalStoReqMol,
    canReqMolDet,
    docSalSto,
    salStoMolDet,
  } = salidaMolienda;

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
    setSalidaMolienda({
      ...salidaMolienda,
      [name]: value,
    });
  };

  // TRAER DATOS DE REQUISICION MOLIENDA DETALLE
  const traerDatosRequisicionMoliendaDetalle = async () => {
    if (idReqMolDet.length !== 0) {
      const resultData = await getRequisicionMoliendaDetalleById(idReqMolDet);
      const { message_error, description_error, result } = resultData;

      if (message_error.length === 0) {
        // SETEAMOS EL CONTADOR
        setcount(result[0].canReqMolDet);
        setSalidaMolienda({
          ...salidaMolienda,
          idReqMol: result[0].idReqMol,
          idReqMolDet: parseInt(idReqMolDet, 10),
          nomProd: result[0].nomProd,
          idMatPri: result[0].idMatPri,
          codLotProd: result[0].codLotProd,
          codProd: result[0].codProd,
          canReqMolDet: result[0].canReqMolDet,
        });
      } else {
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error: description_error,
        });
        handleClickFeeback();
      }
      setdisableButton(false);
    }
  };

  // TRAER DATOS DE ENTRADAS DISPONIBLES PARA LA REQUISICION MOLIENDA DETALLE
  const traerDatosEntradasDisponibles = async () => {
    const resultPeticion = await getEntradasDisponibles(idMatPri);
    const { message_error, description_error, result } = resultPeticion;
    if (message_error.length === 0) {
      if (result.length === 0) {
        // no hay entradas disponibles
        setfeedbackMessages({
          style_message: "warning",
          feedback_description_error: "No hay entradas disponibles",
        });
        handleClickFeeback();
      } else {
        // establecemos las entradas disponibles
        setentradasDisponibles(result);
      }
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
      });
      handleClickFeeback();
    }
  };

  // Habilitar input de envio
  const onChangeCheckedEntrada = (
    isChecked,
    valueEntrada,
    valueInput,
    idEntrada,
    setInputValue
  ) => {
    // Obtenemos la cantidad actual de la entrada
    let cantidadDisponible = parseInt(valueEntrada, 10);
    // Obtenemos la cantidad actual del input de entrada
    let cantidadInputEntrada = parseInt(valueInput, 10);
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
        let aux = [...salStoMolDet];
        console.log(aux);
        aux.push({
          idEntSto: idEntrada,
          canSalReqMol: cantidadDisponible,
        });
        setSalidaMolienda({
          ...salidaMolienda,
          salStoMolDet: aux,
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
          let aux = [...salStoMolDet];
          console.log(aux);
          aux.push({
            idEntSto: idEntrada,
            canSalReqMol: count,
            // canTotDis: canTotDis,
          });
          setSalidaMolienda({
            ...salidaMolienda,
            salStoMolDet: aux,
          });
          console.log("COUNT: " + 0);
        }
      }
    } else {
      // inputSelected.disabled = true;
      setcount(count + cantidadInputEntrada);
      // Eliminamos la informacion deseleccionada
      let aux = salStoMolDet.filter((element) => {
        if (element.idEntSto !== idEntrada) {
          return true;
        } else {
          return false;
        }
      });
      console.log(aux);
      setSalidaMolienda({
        ...salidaMolienda,
        salStoMolDet: aux,
      });
      console.log("COUNT: " + (count + cantidadInputEntrada));
      setInputValue(0);
    }
  };

  // ******** ENVIAR SALIDA *********
  const crearSalidasStockByRequisicionMoliendaDetalle = async () => {
    console.log(salidaMolienda);
    const { message_error, description_error } =
      await createSalidasStockByReqMolDet(salidaMolienda);

    if (message_error.length === 0) {
      // Volvemos a la vista de requisiciones
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

  const onSubmitSalidaStock = (e) => {
    e.preventDefault();
    // CONDICIONES DE ENVIO
    if (salStoMolDet.length === 0 || idReqMol === 0 || idMatPri === 0) {
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      if (salStoMolDet.length === 0) {
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
      salStoMolDet.forEach((element) => {
        cantSalStoDet += parseInt(element.canSalReqMol);
      });

      // Si las entradas elegidas cumplen con la cantidada requerida
      if (cantSalStoDet != canReqMolDet) {
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
        crearSalidasStockByRequisicionMoliendaDetalle();
      }
    }
  };

  useEffect(() => {
    // TRAEMOS DATOS DE REQUISICION DETALLE
    traerDatosRequisicionMoliendaDetalle();
  }, []);

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Registrar salida</h1>
        <form className="mt-4 form-inline">
          <div className="mb-3 row">
            <div className="card d-flex">
              <h6 className="card-header" id="response-serie-number-sale">
                Requisicion Molienda
              </h6>
              <div className="card-body">
                <label htmlFor="codigo-lote" className="col-form-label">
                  <b>Código de lote</b>
                </label>
                <div className="col-md-2">
                  <input
                    type="text"
                    name="codLotProd"
                    value={codLotProd}
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

          {/* DATOS DE LA SALIDA */}
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
                    <thead className="table-success ">
                      <tr>
                        <th scope="col">Almacen</th>
                        <th scope="col">Codigo</th>
                        <th scope="col">N° Ingreso</th>
                        <th scope="col">Fecha ingreso</th>
                        <th scope="col">Cantidad</th>
                        <th scope="col">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entradasDisponibles.map((element, i) => (
                        <RowEntradaDisponible
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
                    <b>Cantidad Salida</b>
                  </label>
                  <div className="col-md-2">
                    <input
                      type="number"
                      name="canReqMolDet"
                      value={canReqMolDet}
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
                    <b>Fecha de salida</b>
                  </label>
                  <div className="col-md-3">
                    <FechaPicker />
                  </div>
                </div>

                {/* DOCUMENTO */}
                <div className="mb-3 row">
                  <label
                    htmlFor="documento-salida"
                    className="col-sm-2 col-form-label"
                  >
                    <b>Documento</b>
                  </label>
                  <div className="col-md-3">
                    <input
                      type="text"
                      name="docSalSto"
                      autoComplete="off"
                      value={docSalSto}
                      className="form-control"
                      onChange={handledForm}
                    />
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
