import React, { useEffect, useState } from "react";
// IMPORT DE EFECHA PICKER
import FechaPicker from "./../../../components/Fechas/FechaPicker";
// FUNCIONES UTILES
import {
  DiaJuliano,
  FormatDateMYSQLNative,
  FormatDateTimeMYSQLNow,
  FormatDateTimeMYSQLNowPlusYears,
  letraAnio
} from "../../../utils/functions/FormatDate";
import Checkbox from "@mui/material/Checkbox";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { createEntradaStock } from "./../../helpers/entradas-stock/createEntradaStock";
import { Typography } from "@mui/material";
import { FilterAlmacenDynamic } from "../../../components/ReferencialesFilters/Almacen/FilterAlmacenDynamic";
import { FilterProveedorDynamic } from "../../../components/ReferencialesFilters/Proveedor/FilterProveedorDynamic";
import { FilterAllProductosDynamic } from "../../../components/ReferencialesFilters/Producto/FilterAllProductosDynamic";
import { getEntradasParciales } from "../../helpers/entradas-stock/getEntradasParciales";
import { DialogEntradasParciales } from "../../components/componentes-entradasStock/DialogEntradasParciales";
import { DialogConfirmarEntradaParcial } from "../../components/componentes-entradasStock/DialogConfirmarEntradaParcial";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
export const AgregarEntradaStockV2 = () => {
  const [formState, setFormState] = useState({
    idProd: 0,
    idProv: 0,
    idAlm: 1,
    esSel: false,
    canTotCom: 0,
    canTotEnt: 0,
    canVar: 0,
    docEntSto: "",
    fecVenEntSto: "",
    fecEntSto: "",
    esEntPar: false,
    codProd: "",
    codProv: "",
    codAlm: "001",
    obsEnt: "",
    ordCom: "",
    guiRem: ""
  });
  const {
    idProd,
    idProv,
    idAlm,
    canTotCom,
    canTotEnt,
    canVar,
    docEntSto,
    fecVenEntSto,
    fecEntSto,
    esEntPar,
    codProd,
    codProv,
    codAlm,
    obsEnt,
    ordCom,
    guiRem
  } = formState;

  // controlador de entradas parciales
  const [entradasParciales, setEntradasParciales] = useState(null);

  const [openDialogEntradasParciales, setOpenDialogEntradasParciales] =
    useState(false);
  const handleOpenDialogEntradasParciales = () => {
    setOpenDialogEntradasParciales(true);
  };

  const handleCloseDialogEntradasParciales = () => {
    setOpenDialogEntradasParciales(false);
    setEntradasParciales(null);
  };

  // autocompletamos algunos campos que se repiten
  const handleAcceptEntradasParciales = (data) => {
    setFormState({
      ...formState,
      ordCom: data["ordCom"],
      idProv: data["idProv"],
      codProv: data["codProv"],
      canTotCom: data["canTotCom"],
      docEntSto: data["docEntSto"]
    });
    setOpenDialogEntradasParciales(false);
  };

  // controlador para dialog de confirmacion de entrada parcial
  const [
    openConfirmDialogEntradasParciales,
    setOpenConfirmDialogEntradasParciales
  ] = useState(false);

  const handleOpenConfirmDialogEntradasParciales = () => {
    setOpenConfirmDialogEntradasParciales(true);
  };

  const handleCloseConfirmDialogEntradasParciales = () => {
    setOpenConfirmDialogEntradasParciales(false);
    setdisableButton(false);
  };

  const handleFinEntradasParciales = () => {
    // agregamos una nueva propiedad que indique que el final de las entradas parciales
    const formatEntradasParciales = {
      ...entradasParciales,
      esEntTot: true // se termina las entradas parciales
    };
    // actualizamos
    setEntradasParciales(formatEntradasParciales);
    // cerramos cuadro
    setOpenConfirmDialogEntradasParciales(false);
    // creamos la entrada de stock
    crearEntradaStock(formatEntradasParciales);
  };

  const handleCrearEntradaParcial = () => {
    // agregamos una nueva propiedad que indique que el final de las entradas parciales
    const formatEntradasParciales = {
      ...entradasParciales,
      esEntTot: false // solo ingreso de entrada parcial
    };
    // actualizamos
    setEntradasParciales(formatEntradasParciales);
    // cerramos cuadro
    setOpenConfirmDialogEntradasParciales(false);
    // creamos la entrada de stock
    crearEntradaStock(formatEntradasParciales);
  };

  // inputs para manejar los inputs de texto
  const onInputChange = ({ target }) => {
    const { name, value } = target;
    setFormState({
      ...formState,
      [name]: value
    });
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

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate();
  const onNavigateBack = () => {
    navigate(-1);
  };

  // INPUT PARA EL INGRESO PARCIAL
  const onCheckEsSalidaParcial = (event) => {
    setFormState({ ...formState, esEntPar: event.target.checked });
  };

  // INPUT CODIGO MATERIA PRIMA
  const onAddCodProd = ({ value, id }) => {
    setFormState({ ...formState, codProd: value, idProd: id });
  };

  // INPUT CODIGO PROVEEDOR
  const onAddCodProv = ({ value, id }) => {
    setFormState({ ...formState, codProv: value, idProv: id });
  };

  // INPUT CODIGO ALMACEN
  const onAddCodAlm = ({ value, id }) => {
    console.log(value);
    setFormState({ ...formState, codAlm: value, idAlm: id });
  };

  // SET VALOR DE FECHA DE formState
  const onAddFecEntSto = (newfecEntSto) => {
    setFormState({ ...formState, fecEntSto: newfecEntSto });
  };

  // CREAR ENTRADA DE STOCK
  const crearEntradaStock = async (entradasParciales = null) => {
    let requestJSON = { ...formState };

    // verificamos si se ingreso una fecha de ingreso
    if (fecEntSto.length === 0) {
      requestJSON = {
        ...requestJSON,
        fecEntSto: FormatDateTimeMYSQLNow(),
        fecVenEntSto: FormatDateTimeMYSQLNowPlusYears(4) // se puede poner automaticamente el dato
      };
    }

    requestJSON = {
      ...requestJSON,
      diaJulEntSto: DiaJuliano(requestJSON.fecEntSto),
      letAniEntSto: letraAnio(requestJSON.fecEntSto)
    };

    console.log("Informacion de la entrada: ", requestJSON);
    console.log("Informacion de las entradas parciales: ", entradasParciales);
    const { message_error, description_error } = await createEntradaStock(
      requestJSON,
      entradasParciales
    );

    if (message_error.length === 0) {
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Creado con exito"
      });
      handleClickFeeback();
      setTimeout(() => {
        window.close();
      }, "1000");
    } else {
      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
      // habilitamos el boton de crear
    }

    setdisableButton(false);
  };

  // SUBMIT DE UNA formState COMUNICACION CON BACKEND
  const onSubmitformState = (event) => {
    event.preventDefault();

    let advertenciaFormularioIncompleto = "";
    // VERIFICAMOS SI SE INGRESARON LOS CAMPOS REQUERIDOS
    if (
      idProd === 0 ||
      idProv === 0 ||
      idAlm === 0 ||
      docEntSto.length === 0 ||
      canTotEnt <= 0 ||
      canTotCom <= 0 ||
      (esEntPar && ordCom.length === 0) ||
      (esEntPar && parseFloat(canTotEnt) >= parseFloat(canTotCom))
    ) {
      if (idProd === 0) {
        advertenciaFormularioIncompleto +=
          "Falta llenar informacion del producto\n";
      }
      if (idProv === 0) {
        advertenciaFormularioIncompleto +=
          "Falta llenar informacion del provedor\n";
      }
      if (idAlm === 0) {
        advertenciaFormularioIncompleto +=
          "Falta llenar informacion del almacen\n";
      }
      if (docEntSto.length === 0) {
        advertenciaFormularioIncompleto +=
          "Falta llenar informacion del documento de entrada\n";
      }
      if (canTotCom <= 0) {
        advertenciaFormularioIncompleto +=
          "Asegurarse de proporcionar informacion de la cantidad de compra\n";
      }
      if (canTotEnt <= 0) {
        advertenciaFormularioIncompleto +=
          "Asegurarse de proporcionar informacion de la cantidad de entrada\n";
      }

      if (esEntPar && ordCom.length === 0) {
        advertenciaFormularioIncompleto +=
          "Si es ingreso parcial, asegurate de ingresar la orden de compra\n";
      }

      if (esEntPar && parseFloat(canTotEnt) >= parseFloat(canTotCom)) {
        console.log(canTotEnt, canTotCom);
        advertenciaFormularioIncompleto +=
          "Si es ingreso parcial, la cantidad ingresada no puede ser igual o mayor al total de la compra\n";
      }

      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: advertenciaFormularioIncompleto
      });
      handleClickFeeback();
    } else {
      setdisableButton(true);
      /* 
        -si se va a realizar una entrada parcial tomando en cuenta las demas entradas parciales
        - mostramos un dialogo de confirmacion que nos permitira eligir si queremos terminar el ingreso parcial
      */

      if (entradasParciales !== null) {
        // abrimos cuadro de dialogo de confirmacion de entradas parciales
        handleOpenConfirmDialogEntradasParciales();
      } else {
        crearEntradaStock();
      }
    }
  };

  const buscarEntradasParciales = async () => {
    const { result, meesage_error, description_error } =
      await getEntradasParciales(idProd, ordCom);
    if (result.detEntPar.length !== 0) {
      setEntradasParciales(result);
      handleOpenDialogEntradasParciales();
    } else {
      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error:
          "No hay ingresos parciales para los datos proporcionados"
      });
      handleClickFeeback();
    }
  };

  const onClickBuscarEntradasParciales = () => {
    let advertenciaFormularioIncompleto = "";

    if (idProd === 0 || ordCom.length === 0) {
      if (idProd === 0) {
        advertenciaFormularioIncompleto +=
          "Ingrese un producto para consultar\n";
      }
      if (ordCom.length === 0) {
        advertenciaFormularioIncompleto +=
          "Ingrese una orden de compra para consultar\n";
      }

      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: advertenciaFormularioIncompleto
      });
      handleClickFeeback();
    } else {
      buscarEntradasParciales();
    }
  };

  useEffect(() => {
    if (canTotCom.length === 0 || canTotEnt.length === 0) {
      setFormState({
        ...formState,
        canVar: 0
      });
    } else {
      const cantidadVariacion = (
        parseFloat(canTotEnt) - parseFloat(canTotCom)
      ).toFixed(3);
      setFormState({
        ...formState,
        canVar: cantidadVariacion
      });
    }
  }, [canTotCom, canTotEnt]);

  return (
    <>
      <div
        className="w"
        style={{
          //border: "1px solid black",
          paddingLeft: "70px",
          paddingRight: "100px"
        }}
      >
        <h1 className="mt-4 text-center">Registrar Entrada de stock</h1>

        <div
          className="row mt-4"
          //style={{ border: "1px solid black" }}
        >
          <div className="card d-flex">
            <h6 className="card-header">Sección de Almacén</h6>
            <div className="card-body">
              {/* CODIGO MATERIA PRIMA */}
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">Producto</label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={codProd}
                    readOnly
                    type="text"
                    name="codProd"
                    className="form-control"
                  />
                </div>
                {/* SEARCH NAME PRODUCTO */}
                <div className="col-md-8">
                  <FilterAllProductosDynamic
                    onNewInput={onAddCodProd}
                    defaultValue={idProd}
                  />
                </div>
              </div>

              {/* CODIGO PROVEEDOR*/}
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">Proveedor</label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={codProv}
                    readOnly
                    type="text"
                    name="codProv"
                    className="form-control"
                  />
                </div>
                {/* SEARCH NAME PROVEEDOR */}
                <div className="col-md-8">
                  {
                    <FilterProveedorDynamic
                      onNewInput={onAddCodProv}
                      defaultValue={idProv}
                    />
                  }
                </div>
              </div>

              {/* CODIGO ALMACEN */}
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">Almacen</label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={codAlm}
                    readOnly
                    type="text"
                    name="codAlm"
                    className="form-control"
                  />
                </div>
                {/* SEARCH NAME PROVEEDOR */}
                <div className="col-md-6">
                  <FilterAlmacenDynamic
                    onNewInput={onAddCodAlm}
                    defaultValue={idAlm}
                  />
                </div>
              </div>

              {/* FECHA DE LA formState */}
              <div className="mb-3 row">
                <label className="col-sm-2 col-form-label">
                  Fecha de Entrada
                </label>
                <div className="col-md-4">
                  <FechaPicker onNewfecEntSto={onAddFecEntSto} />
                </div>
              </div>

              {/* INPUT DOCUMENTO formState */}
              <div className="mb-3 row">
                <label
                  htlmfor={"documento-formState"}
                  className="col-sm-2 col-form-label"
                >
                  Documento
                </label>
                <div className="col-md-3">
                  <input
                    onChange={onInputChange}
                    value={docEntSto}
                    type="text"
                    name="docEntSto"
                    className="form-control"
                  />
                </div>
              </div>

              {/* INPUT Es ingreso parcial */}
              <div className="mb-3 row">
                <label
                  htlmfor={"documento-formState"}
                  className="col-sm-2 col-form-label"
                >
                  Es ingreso parcial
                </label>
                <div className="col-md-3">
                  <Checkbox
                    size="medium"
                    checked={esEntPar}
                    onChange={onCheckEsSalidaParcial}
                  />
                </div>
              </div>

              {/* INPUT ORDEN DE COMPRA */}
              <div className="mb-3 row">
                <label
                  htlmfor={"documento-formState"}
                  className="col-sm-2 col-form-label"
                >
                  Orden de compra
                </label>
                <div className="col-md-5">
                  <div className="input-group">
                    <input
                      onChange={onInputChange}
                      value={ordCom}
                      type="text"
                      name="ordCom"
                      className="form-control"
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-primary ms-4"
                        type="button"
                        onClick={onClickBuscarEntradasParciales}
                        disabled={!esEntPar}
                      >
                        <span
                          className="bi bi-search"
                          aria-hidden="true"
                        ></span>
                        Buscar entradas parciales
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3 row">
                <label
                  htlmfor={"documento-formState"}
                  className="col-sm-2 col-form-label"
                >
                  Guia de remisión
                </label>
                <div className="col-md-3">
                  <input
                    onChange={onInputChange}
                    value={guiRem}
                    type="text"
                    name="guiRem"
                    className="form-control"
                  />
                </div>
              </div>

              {/* INPUT CANTIDAD COMPRA */}
              <div className="mb-3 row">
                <label
                  htlmfor={"cantidad-ingresada"}
                  className="col-sm-2 col-form-label"
                >
                  Cantidad total compra
                </label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={canTotCom}
                    type="number"
                    name="canTotCom"
                    className="form-control"
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>

              {/* INPUT CANTIDAD formState */}
              <div className="mb-3 row">
                <label
                  htlmfor={"cantidad-ingresada"}
                  className="col-sm-2 col-form-label"
                >
                  Cantidad ingresada
                </label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={canTotEnt}
                    type="number"
                    name="canTotEnt"
                    className="form-control"
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>

              {/* INPUT CANTIDAD EXEDIDA */}
              <div className="mb-3 row">
                <label
                  htlmfor={"cantidad-ingresada"}
                  className="col-sm-2 col-form-label"
                >
                  Cantidad variacion
                </label>
                <div className="col-md-2">
                  <input
                    disabled={true}
                    onChange={onInputChange}
                    value={canVar}
                    type="number"
                    name="canVar"
                    className={`form-control ${
                      parseFloat(canVar) < 0 ? "text-danger" : "text-success"
                    }`}
                  />
                </div>
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
            onClick={(e) => onSubmitformState(e)}
            className="btn btn-primary"
          >
            Guardar
          </button>
        </div>
      </div>
      {/* DIALOG DE ENTRADAS PARCIALES */}
      {entradasParciales && openDialogEntradasParciales && (
        <DialogEntradasParciales
          open={openDialogEntradasParciales}
          handleClose={handleCloseDialogEntradasParciales}
          data={entradasParciales}
          handleAccept={handleAcceptEntradasParciales}
        />
      )}

      {/* DIALOG DE CONFIRMACION DE ENTRADA PARCIAL */}
      {entradasParciales &&
        openConfirmDialogEntradasParciales &&
        canTotEnt > 0 && (
          <DialogConfirmarEntradaParcial
            open={openConfirmDialogEntradasParciales}
            handleClose={handleCloseConfirmDialogEntradasParciales}
            data={entradasParciales}
            handleAccept={handleCrearEntradaParcial}
            handleAcceptFinEntPar={handleFinEntradasParciales}
            canTotEnt={canTotEnt}
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
