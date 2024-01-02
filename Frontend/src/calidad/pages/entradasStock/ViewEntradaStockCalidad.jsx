import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { getEntradaStockCalidadById } from "../../helpers/entradas-stock/getEntradaStockCalidadById";
import { CardAtributosCalidadEntrada } from "../../components/entrada-stock/CardAtributosCalidadEntrada";
import { FilterEncargadoCalidad } from "../../../components/ReferencialesFilters/EncargadoCalidad/FilterEncargadoCalidad";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography
} from "@mui/material";
import { createEntradaAtributosCalidad } from "../../helpers/entradas-stock/createEntradaAtributosCalidad";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ViewEntradaStockCalidad = () => {
  const { idEntSto } = useParams();
  const [loading, setLoading] = useState(true);
  const [dataEntradaStockCalidad, setDataEntradaStockCalidad] = useState({
    id: 0,
    idProd: 0,
    nomProd: "",
    codProd: "",
    codProd2: "",
    codProd3: "",
    desCla: "",
    idProv: 0,
    nomProv: "",
    apeProv: "",
    codProv: "",
    idEntStoEst: 0,
    desEntStoEst: "",
    codEntSto: "",
    fecEntSto: "",
    fecVenEntSto: "",
    esSel: 0,
    canSel: 0,
    canPorSel: 0,
    merDis: 0,
    merTot: 0,
    canTotCom: 0,
    canTotEnt: 0,
    canTotDis: 0,
    canVar: 0,
    fecFinSto: "",
    etiquetasCards: [],
    dataAtributosEntradaCalidad: [],
    informacion_valores_atributos: [],
    informacion_calidad: {
      idResEntCal: null,
      obsAccEntCal: ""
    },
    informacion_calidad: {}
  });
  const {
    nomProd,
    codProd,
    codProd2,
    codProd3,
    nomProv,
    apeProv,
    codProv,
    desEntStoEst,
    codEntSto,
    fecEntSto,
    fecVenEntSto,
    esSel,
    canSel,
    canPorSel,
    merDis,
    merTot,
    canTotCom,
    canTotEnt,
    canTotDis,
    canVar,
    fecFinSto,
    dataAtributosEntradaCalidad,
    informacion_valores_atributos,
    informacion_calidad
  } = dataEntradaStockCalidad;

  const { idResEntCal, obsAccEntCal } = informacion_calidad;

  const onChangeEncargadoEvaluacionCaidad = (value) => {
    const { id } = value;
    const formatDataCalidad = {
      ...informacion_calidad,
      idResEntCal: id
    };
    setDataEntradaStockCalidad({
      ...dataEntradaStockCalidad,
      informacion_calidad: formatDataCalidad
    });
  };

  const onChangeObservacionesEvaluacionCalidad = ({ target }) => {
    const { value } = target;

    const formatDataCalidad = {
      ...informacion_calidad,
      obsAccEntCal: value
    };
    setDataEntradaStockCalidad({
      ...dataEntradaStockCalidad,
      informacion_calidad: formatDataCalidad
    });
  };

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  // ESTADO PARA CONTROLAR EL FEEDBACK
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

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false);

  // controlador para dialog de confirmacion de entrada parcial
  const [openDialogAprobarEntradaFIFO, setopenDialogAprobarEntradaFIFO] =
    useState(false);

  const handleOpenDialogAprobarEntradaFIFO = () => {
    setopenDialogAprobarEntradaFIFO(true);
  };

  const handleCloseDialogAprobarEntradaFIFO = () => {
    setopenDialogAprobarEntradaFIFO(false);
    setdisableButton(false);
  };

  const handleProcessRespondeDialogAprobarEntradaFIFO = (aprobado) => {
    // llamamos a la api
    guardarDatosAtributosCalidad(aprobado);
  };

  // funcion para cambiar valor de texto y numero
  const onChangeValoresAlfanumericos = ({ target }, element) => {
    const { value } = target;
    const dataAux = dataAtributosEntradaCalidad.map((atributo) => {
      if (element.id === atributo.id) {
        return {
          ...atributo,
          valEntCalAtr: value
        };
      } else {
        return atributo;
      }
    });

    //actualizamos la data
    setDataEntradaStockCalidad({
      ...dataEntradaStockCalidad,
      dataAtributosEntradaCalidad: dataAux
    });
  };

  // manejador de errores de atributos de calidad
  const handleGuardarAtributos = () => {
    if (idResEntCal === null) {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error:
          "Debe agregar información del encargado de evaluación"
      });
      handleClickFeeback();
    } else {
      setdisableButton(true);
      // guardarDatosAtributosCalidad();
      // si recien se ingreso a la vista para completar datos de calidad
      if (informacion_valores_atributos.length === 0) {
        handleOpenDialogAprobarEntradaFIFO();
      } else {
        guardarDatosAtributosCalidad();
      }
    }
  };

  // funcion para guardar atributos de calidad asociados a entrada
  const guardarDatosAtributosCalidad = async (estado = null) => {
    // primero debemos mostrar un dialog que pregunte si quiere habilitarlo para FIFO
    // guardamos informacion de calidad
    // 1. debemos verificar que atributos son para insertar y cuales son para actualizar
    // 2. Si el registro esta vacio:
    // - si ya fue registrado, entonces hablamos de una actualizacion
    // - si no fue registrado; entonces lo quitamos de la data
    // 3. Si el registro esta lleno:
    // - si ya fue registrado, entonces hablamos de una actualizacion
    // - si no fue registrado; entonces hablamos de una nueva insercion

    const dataAtributos = dataAtributosEntradaCalidad.map((itemData) => {
      const valueAtributo = itemData["valEntCalAtr"].trim();
      // buscamos
      const findElementAtributo = informacion_valores_atributos.find(
        (itemAtributo) => itemData.id === itemAtributo.idProdtAtrCal
      );

      // si ya se creo el atributo
      if (findElementAtributo) {
        // si el valor actual es igual al creado
        if (valueAtributo === findElementAtributo["valEntCalAtr"].trim()) {
          return {
            ...itemData,
            valEntCalAtr: valueAtributo,
            action: "DELETE"
          };
        } else {
          return {
            ...itemData,
            valEntCalAtr: valueAtributo,
            action: "UPDATE"
          };
        }
      }
      // si no se creo el atributo
      else {
        // si el valor es vacio
        if (valueAtributo.length === 0) {
          return {
            ...itemData,
            valEntCalAtr: valueAtributo,
            action: "DELETE"
          };
        } else {
          return {
            ...itemData,
            valEntCalAtr: valueAtributo,
            action: "CREATE"
          };
        }
      }
    });

    const filterDatosDelete = dataAtributos.filter(
      (element) => element["action"] !== "DELETE"
    );

    let formatData = {
      ...dataEntradaStockCalidad,
      dataAtributosEntradaCalidad: filterDatosDelete
    };

    if (estado !== null) {
      formatData = {
        ...formatData,
        informacion_calidad: {
          ...informacion_calidad,
          esAprEnt: estado
        }
      };
    }

    console.log(formatData);
    const resultPeticion = await createEntradaAtributosCalidad(formatData);
    console.log(resultPeticion);
    const { message_error, description_error } = resultPeticion;
    if (message_error.length !== 0) {
      // error al crear los atributos de calidad
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
      // cerramos el dialog
      handleCloseDialogAprobarEntradaFIFO();
    } else {
      // cerramos dialog
      handleCloseDialogAprobarEntradaFIFO();
      // mostrar exito
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Se actualizo con éxito"
      });
      handleClickFeeback();
      // navegamos hacia la anterior vista
      setTimeout(() => {
        window.close();
      }, "1000");
    }
  };

  useEffect(() => {
    const traerDatosEntradaStockCalidad = async () => {
      const resultPeticion = await getEntradaStockCalidadById(idEntSto);
      const { result } = resultPeticion;
      console.log(result);
      const { informacion_atributos, informacion_valores_atributos } = result;

      const valoresNoNulos = informacion_atributos.filter(
        (item) => item.labGruAtr !== null
      );
      const valoresUnicosLabGruAtr = [
        ...new Set(valoresNoNulos.map((item) => item.labGruAtr))
      ];
      const etiquetasCardsFormat = [
        "DATOS GENERALES",
        ...valoresUnicosLabGruAtr
      ];
      result["etiquetasCards"] = etiquetasCardsFormat;

      // ahora debemos formar la data necesaria para generar los inputs
      const dataAtributosCalidad = informacion_atributos.map((element) => {
        let labelGenerales = false;
        if (element.labGruAtr === null) {
          labelGenerales = true;
        }
        // buscamos si se ha registrado un valor del atrbiuto de calidad
        const findElement = informacion_valores_atributos.find(
          (atributo) => element.id === atributo.idProdtAtrCal
        );

        // si se encontro un registro previo, formamos la data
        if (findElement) {
          return {
            ...element,
            labGruAtr: labelGenerales
              ? "DATOS GENERALES"
              : element["labGruAtr"],
            valEntCalAtr: findElement["valEntCalAtr"],
            esCom: true
          };
        } else {
          return {
            ...element,
            labGruAtr: labelGenerales
              ? "DATOS GENERALES"
              : element["labGruAtr"],
            valEntCalAtr: "",
            estAtr: false
          };
        }
      });
      result["dataAtributosEntradaCalidad"] = dataAtributosCalidad;
      setDataEntradaStockCalidad(result);
      setLoading(false);
    };

    traerDatosEntradaStockCalidad();
  }, [idEntSto]);

  return (
    <>
      {!loading && (
        <>
          <div className="container-fluid mx-3">
            <h1 className="mt-4 text-center">Datos de calidad de entrada</h1>
            <div className="row mt-4 mx-4">
              {/* DatOS DE PRODUCTO */}
              <div className="card d-flex">
                <h6 className="card-header">Datos de producto</h6>
                <div className="card-body">
                  <div className="mb-3 row">
                    {/* NOMBRE PRODUCTO */}
                    <div className="col-md-4">
                      <label htmlFor="nombre" className="form-label">
                        <b>Nombre producto</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={nomProd ? nomProd : "No establecido"}
                        className="form-control"
                      />
                    </div>
                    {/* CODIGO SIGO */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Codigo SIGO</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={codProd === null ? "No establecido" : codProd}
                        className="form-control"
                      />
                    </div>
                    {/* CODIGO EMAPROD */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Codigo EMAPROD</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={codProd2 === null ? "No establecido" : codProd2}
                        className="form-control"
                      />
                    </div>
                    {/* OTROS CODIGO */}
                    <div className="col-md-2">
                      <label htmlFor="nombre" className="form-label">
                        <b>Codigo (otros)</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={codProd3 === null ? "No establecido" : codProd3}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos de proveedor */}
              <div className="card d-flex mt-4">
                <h6 className="card-header">Datos de proveedor</h6>
                <div className="card-body">
                  <div className="mb-4 row">
                    {/* NOMBRE DE PROVEEDOR */}
                    <div className="col-md-4">
                      <label htmlFor="nombre" className="form-label">
                        <b>Nombre proveedor</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={nomProv}
                        className="form-control"
                      />
                    </div>
                    {/* APELLIDO DE PROVEEDOR */}
                    <div className="col-md-4">
                      <label htmlFor="nombre" className="form-label">
                        <b>Apellido proveedor</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={apeProv}
                        className="form-control"
                      />
                    </div>
                    {/* CODIGO PROVEEDOR */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Codigo proveedor</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={codProv}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos de entrada */}
              <div className="card d-flex mt-4">
                <h6 className="card-header">Datos de entrada de stock</h6>
                <div className="card-body">
                  {/* FILA DE DATOS GENERALES */}
                  <div className="mb-4 row">
                    {/* ESTADO DE ENTRADA */}
                    <div className="col-md-2">
                      <label htmlFor="nombre" className="form-label">
                        <b>Estado</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={desEntStoEst}
                        className="form-control"
                      />
                    </div>
                    {/* CODIGO DE ENTRADA */}
                    <div className="col-md-4">
                      <label htmlFor="nombre" className="form-label">
                        <b>Codigo entrada</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={codEntSto}
                        className="form-control"
                      />
                    </div>
                    {/* FECHA DE ENTRADA */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Fecha entrada</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={fecEntSto}
                        className="form-control"
                      />
                    </div>
                    {/* FECHA DE VENCIMIENTO */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Fecha vencimiento</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={
                          fecVenEntSto === null
                            ? "Entrada no terminada"
                            : fecVenEntSto
                        }
                        className="form-control"
                      />
                    </div>
                  </div>
                  {/* FILA DE CANTIDADES DE ENTRADA STOCK */}
                  <div className="mb-4 row">
                    {/* CANTIDAD TOTAL */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Cantidad total</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={canTotEnt}
                        className="form-control"
                      />
                    </div>
                    {/* CANTIDAD DISPONIBLE */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Cantidad Disponible</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={canTotDis}
                        className="form-control"
                      />
                    </div>
                    {/* CANTIDAD SELECCIONADA */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Cantidad seleccionada</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={canSel}
                        className="form-control"
                      />
                    </div>
                    {/* CANTIDAD POR SELECCIONAR */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Cantidad por seleccionar</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={canPorSel}
                        className="form-control"
                      />
                    </div>
                  </div>
                  {/* FILA DE INFORMACION DE MERMA */}
                  <div className="mb-4 row">
                    {/* ES SELECCION */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Es seleccion</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={esSel === 0 ? "No es seleccion" : "Es seleccion"}
                        className="form-control"
                      />
                    </div>
                    {/* MERMA TOTAL */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Merma total</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={merTot}
                        className="form-control"
                      />
                    </div>
                    {/* MERMA DISPONIBLE */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Merma disponible</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={merDis}
                        className="form-control"
                      />
                    </div>
                    {/* FECHA DE TERMINO */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Fecha termino</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={
                          fecFinSto === null
                            ? "Entrada no terminada"
                            : fecFinSto
                        }
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="mb-4 row">
                    {/* CANTIDAD COMPRA */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Cantidad compra</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={canTotCom}
                        className="form-control"
                      />
                    </div>
                    {/* MERMA TOTAL */}
                    <div className="col-md-3">
                      <label htmlFor="nombre" className="form-label">
                        <b>Cantidad variacion</b>
                      </label>
                      <input
                        type="text"
                        disabled={true}
                        value={canVar}
                        className={`form-control ${
                          parseFloat(canVar) < 0
                            ? "text-danger"
                            : "text-success"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card d-flex mt-4">
                <h6 className="card-header">
                  Datos de encargado de evaluacion
                </h6>
                <div className="card-body">
                  <div className="mb-2 row">
                    <div className="col-md-4">
                      <label htmlFor="nombre" className="form-label">
                        <b>Encargado calidad</b>
                      </label>
                      <FilterEncargadoCalidad
                        onNewInput={onChangeEncargadoEvaluacionCaidad}
                        defaultValue={idResEntCal}
                      />
                    </div>
                    <div className="col-md-8">
                      <label htmlFor="nombre" className="form-label">
                        <b>Observaciones/Acciones correctivas</b>
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Escribe aqui"
                        value={obsAccEntCal}
                        onChange={onChangeObservacionesEvaluacionCalidad}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* DATOS DE CALIDAD */}
              <div className="card d-flex mt-4">
                <h6 className="card-header">Datos de calidad</h6>
                <div className="card-body">
                  <CardAtributosCalidadEntrada
                    dataEntradaStockCalidad={dataEntradaStockCalidad}
                    onChangeValoresAlfanumericos={onChangeValoresAlfanumericos}
                  />
                </div>
              </div>

              {/* BOTONES DE CANCELAR Y GUARDAR */}
              <div className="btn-toolbar mt-4 mb-4">
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
                  onClick={handleGuardarAtributos}
                  className="btn btn-primary"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {loading && <div>Cargando...</div>}
      {openDialogAprobarEntradaFIFO && (
        <DialogAprobarSalidaFIFO
          open={openDialogAprobarEntradaFIFO}
          handleClose={handleCloseDialogAprobarEntradaFIFO}
          handleProcess={handleProcessRespondeDialogAprobarEntradaFIFO}
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

const DialogAprobarSalidaFIFO = ({ open, handleClose, handleProcess }) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Evaluacion de calidad</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Quiere permitir que esta entrada sea utilizada para el FIFO?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="contained" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              handleProcess(false);
            }}
          >
            Restringir
          </Button>
          <Button
            color="primary"
            variant="contained"
            autoFocus
            onClick={() => {
              handleProcess(true);
            }}
          >
            Permitir
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
