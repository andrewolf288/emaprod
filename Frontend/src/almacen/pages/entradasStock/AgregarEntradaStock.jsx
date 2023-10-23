import React, { useEffect, useState } from "react";
// IMPORT DE EFECHA PICKER
import FechaPicker from "./../../../components/Fechas/FechaPicker";
import FechaPickerYear from "./../../../components/Fechas/FechaPickerYear";
// FUNCIONES UTILES
import {
  DiaJuliano,
  FormatDateTimeMYSQLNow,
  letraAnio,
} from "../../../utils/functions/FormatDate";
import Checkbox from "@mui/material/Checkbox";
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { createEntradaStock } from "./../../helpers/entradas-stock/createEntradaStock";
import { FilterProveedor } from "./../../../components/ReferencialesFilters/Proveedor/FilterProveedor";
import { FilterAlmacen } from "./../../../components/ReferencialesFilters/Almacen/FilterAlmacen";
import { FilterAllProductos } from "./../../../components/ReferencialesFilters/Producto/FilterAllProductos";
import { Typography } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useAuth } from "../../../hooks/useAuth";
import { FilterAlmacenDynamic } from "../../../components/ReferencialesFilters/Almacen/FilterAlmacenDynamic";
import { FilterProveedorDynamic } from "../../../components/ReferencialesFilters/Proveedor/FilterProveedorDynamic";
import { FilterAllProductosDynamic } from "../../../components/ReferencialesFilters/Producto/FilterAllProductosDynamic";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const AgregarEntradaStock = () => {
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
    codProd: "",
    codProv: "",
    codAlm: "001",
    prestProdt: "",
    certCal: "",
    lotProv: "",
    resbEval: "",
    fecProduccion: "",
    humedad: "",
    obsEnt: "",
    ordCom: "",
    guiRem: "",
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
    codProd,
    codProv,
    codAlm,
    prestProdt,
    certCal,
    lotProv,
    resbEval,
    fecProduccion,
    humedad,
    obsEnt,
    ordCom,
    guiRem,
  } = formState;

  const onInputChange = ({ target }) => {
    const { name, value } = target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };
  const { user } = useAuth();

  var users = [user.nomUsu + " " + user.apeUsu];

  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackCreate, setfeedbackCreate] = useState(false);
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: "",
    feedback_description_error: "",
  });
  const { style_message, feedback_description_error } = feedbackMessages;

  var _presProdt = [
    "SACO X 50 KG",
    "SACO X 25 KG",
    "SACO X 20 KG",
    "YUTE X25 KG",
    "BALDE DE 20 L",
    "SACO X 15 KG",
    "SACO X 30 KG",
    "SACO X 100 KG",
  ];

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

  // SET VALOR DE FECHA DE VENCIMIENTO
  const onAddFecVenEntSto = (newfecVentEntSto) => {
    setFormState({ ...formState, fecVenEntSto: newfecVentEntSto });
  };

  // SET VALOR DE FECHA DE formState
  const onAddFecEntSto = (newfecEntSto) => {
    setFormState({ ...formState, fecEntSto: newfecEntSto });
  };

  const onAddFecProduccion = (newfecEntSto) => {
    setFormState({ ...formState, fecProduccion: newfecEntSto });
  };

  // CREAR ENTRADA DE STOCK
  const crearEntradaStock = async () => {
    let requestJSON = { ...formState };

    // verificamos si se ingreso una fecha de ingreso
    if (fecEntSto.length === 0) {
      requestJSON = {
        ...requestJSON,
        fecEntSto: FormatDateTimeMYSQLNow(),
      };
    }

    requestJSON = {
      ...requestJSON,
      diaJulEntSto: DiaJuliano(requestJSON.fecEntSto),
      letAniEntSto: letraAnio(requestJSON.fecEntSto),
    };

    console.log(requestJSON);

    const { message_error, description_error } = await createEntradaStock(
      requestJSON
    );

    if (message_error.length === 0) {
      // navegamos a la anterior vista
      onNavigateBack();
      setfeedbackMessages({
        style_message: "success",
        feedback_description_error: "Creado con exito",
      });
      handleClickFeeback();
      setTimeout(() => {
        window.close();
      }, "1000");
    } else {
      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error,
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
      canTotCom <= 0
      // ||
      //fecVenEntSto.length === 0
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
      if (fecVenEntSto.length === 0) {
        //advertenciaFormularioIncompleto +=
        //  "Falta llenar informacion de la fecha de vencimiento\n";
      }
      if (canTotCom <= 0) {
        advertenciaFormularioIncompleto +=
          "Asegurarse de proporcionar informacion de la cantidad de compra\n";
      }
      if (canTotEnt <= 0) {
        advertenciaFormularioIncompleto +=
          "Asegurarse de proporcionar informacion de la cantidad de entrada\n";
      }

      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: advertenciaFormularioIncompleto,
      });
      handleClickFeeback();
    } else {
      // DESABILTIAMOS EL BOTON DE ENVIAR
      setdisableButton(true);
      // FUNCION DE ENVIAR
      crearEntradaStock();
    }
  };

  useEffect(() => {
    if (canTotCom.length === 0 || canTotEnt.length === 0) {
      setFormState({
        ...formState,
        canVar: 0,
      });
    } else {
      const cantidadVariacion = (
        parseFloat(canTotEnt) - parseFloat(canTotCom)
      ).toFixed(3);
      setFormState({
        ...formState,
        canVar: cantidadVariacion,
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
          paddingRight: "100px",
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
                  {/* <FilterAllProductos
                    onNewInput={onAddCodProd}
                    mostrarCodigo={true}
                  /> */}
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
                  {/* <FilterProveedor
                    onNewInput={onAddCodProv}
                    mostrarCodigo={true}
                  /> */}
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
                  {/* <FilterAlmacen
                    onNewInput={onAddCodAlm}
                    mostrarCodigo={true}
                  /> */}
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
              <div className="mb-3 row">
                <label
                  htlmfor={"documento-formState"}
                  className="col-sm-2 col-form-label"
                >
                  Orden de compra
                </label>
                <div className="col-md-3">
                  <input
                    onChange={onInputChange}
                    value={ordCom}
                    type="text"
                    name="ordCom"
                    className="form-control"
                  />
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
                  Cantidad de la compra
                </label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={canTotCom}
                    type="number"
                    name="canTotCom"
                    className="form-control"
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

        <div className="row mt-4">
          <div className="card d-flex">
            <h6 className="card-header">Sección de Calidad</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">
                  Presentacion del producto
                </label>
                <div className="col-md-2">
                  <FormControl fullWidth>
                    <Select
                      value={prestProdt || ""}
                      name="prestProdt"
                      size="small"
                      onChange={onInputChange}
                    >
                      {_presProdt.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">
                  Certificado de calidad
                </label>
                <div className="col-md-2">
                  <Checkbox
                    checked={Boolean(certCal)}
                    name="certCal"
                    onChange={(event) => {
                      setFormState({
                        ...formState,
                        certCal: event.target.checked,
                      });
                    }}
                    sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">
                  Lote de provedor
                </label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={lotProv}
                    type="text"
                    name="lotProv"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-sm-2 col-form-label">
                  Fecha de producción
                </label>
                <div className="col-md-2">
                  <FechaPicker onNewfecEntSto={onAddFecProduccion} />
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-sm-2 col-form-label">
                  Fecha de vencimiento
                </label>
                <div className="col-md-2">
                  <FechaPickerYear onNewfecEntSto={onAddFecVenEntSto} />
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">% Humedad</label>
                <div className="col-md-2">
                  <input
                    onChange={onInputChange}
                    value={humedad}
                    type="number"
                    name="humedad"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="mb-3 row">
                <label className="col-md-2 col-form-label">
                  Responsable de la evaluación
                </label>
                <div className="col-md-2">
                  <FormControl fullWidth>
                    <Select
                      value={resbEval || ""}
                      name="resbEval"
                      size="small"
                      onChange={onInputChange}
                    >
                      {users.map((item) => (
                        <MenuItem key={item} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="mb-3 row">
                  <label htmlFor="nombre" className="form-label">
                    Observacion
                  </label>
                  <div className="col-md-4">
                    <textarea
                      value={obsEnt}
                      name="obsEnt"
                      onChange={onInputChange}
                      className="form-control"
                    ></textarea>
                  </div>
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

export default AgregarEntradaStock;
