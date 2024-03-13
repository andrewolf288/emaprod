import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { viewOperacionDevolucionCalidadById } from "../../helpers/operacion-devolucion/viewOperacionDevolucionCalidadById";
import { FilterMotivoDevolucionCalidad } from "../../../components/ReferencialesFilters/MotivoDevolucionCalidad/FilterMotivoDevolucionCalidad";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { RowOperacionDevolucionCalidadDetalle } from "../../components/operacion-devolucion/RowOperacionDevolucionCalidadDetalle";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ViewOperacionDevolucionCalidad = () => {
  const { idOpeDevCal } = useParams();
  const [dataOperacionDevolucionCalidad, setOperacionDevolucionCalidad] =
    useState({
      idOpeDev: 0,
      invSerFac: "",
      invNumFac: "",
      idOpeDevDet: 0,
      idProdt: 0,
      nomProd: "",
      codProd: "",
      codProd2: "",
      canOpeDevDet: 0,
      idMotDevCal: null,
      numLots: 0,
      fueCom: 0,
      fecCreOpeDev: ""
    });
  const {
    idOpeDev,
    invSerFac,
    invNumFac,
    idOpeDevDet,
    idProdt,
    nomProd,
    codProd,
    codProd2,
    canOpeDevDet,
    idMotDevCal,
    numLots,
    fecCreOpeDev,
    fueCom
  } = dataOperacionDevolucionCalidad;

  const [
    dataOperacionDevolucionCalidadDetalle,
    setDataOperacionDevolucionCalidadDetalle
  ] = useState([]);

  // HANDLE CHANGE MOTIVO DEVOLUCION CALIDAD
  const handleChangeMotivoDevolucionCalidad = (value) => {
    const { id } = value;
    setOperacionDevolucionCalidad({
      ...dataOperacionDevolucionCalidad,
      idMotDevCal: id
    });
  };

  // HANDLE CHANGE NUMERO DE LOTES
  const handleChangeNumeroLotes = ({ target }) => {
    const { value } = target;
    setOperacionDevolucionCalidad({
      ...dataOperacionDevolucionCalidad,
      numLots: isNaN(value) ? value : parseInt(value)
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

  // GENERAR DETALLE DE OPERACION DEVOLUCION CALIDAD
  const generateDetalleOperacionDevolucionCalidad = () => {
    if (isNaN(numLots) || numLots <= 0) {
      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error: "El numero de lotes debe ser mayor a 0"
      });
      handleClickFeeback();
    } else {
      let dataAux = [];
      for (let i = 0; i < parseInt(numLots); i++) {
        const auxDetalle = {
          index: i,
          idOpeDevCal: idOpeDevCal,
          idProdc: 0,
          codLotProd: "",
          canLotProd: 0,
          pH: "",
          consistencia30: "",
          consistencia60: "",
          color: "",
          sabor: "",
          olor: "",
          observacion: "",
          esReproceso: 0,
          esDetCamProd: 0
        };
        dataAux.push(auxDetalle);
      }
      setDataOperacionDevolucionCalidadDetalle(dataAux);
    }
  };

  // funcion para cambiar valor de operacion devolucion caldiad
  const handleChangeValueDetalle = (index, name, value) => {
    console.log(index);
    const formatData = dataOperacionDevolucionCalidadDetalle.map((element) => {
      if (element.index === index) {
        return {
          [name]: value
        };
      } else {
        return element;
      }
    });
    setDataOperacionDevolucionCalidadDetalle(formatData);
  };

  // funcion para traer informacion de la operacion devolucion calidad
  const traerInformacionOperacionDevolucionCalidad = async () => {
    const resultPeticion = await viewOperacionDevolucionCalidadById(
      idOpeDevCal
    );
    console.log(resultPeticion);
    const { result, message_error, description_error } = resultPeticion;

    if (message_error.length === 0) {
      setOperacionDevolucionCalidad(result);
    } else {
      // mostramos el error recepcionado del backend
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }
  };

  useEffect(() => {
    traerInformacionOperacionDevolucionCalidad();
  }, []);

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Detalle de Operacion devolucion</h1>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos del Retorno Venta</h6>
            <div className="card-body">
              {/* FIRST ROW */}
              <div className="mb-3 row">
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Correlativo</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${invSerFac}-${invNumFac}`}
                    className="form-control"
                  />
                </div>
                <div className="col-md-5">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={nomProd}
                    className="form-control"
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad</b>
                  </label>
                  <input
                    type="number"
                    disabled={true}
                    value={canOpeDevDet}
                    className="form-control"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha creación</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecCreOpeDev}
                    className="form-control"
                  />
                </div>
              </div>
              {/* SECOND ROW */}
              <div className="mb-3 row">
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Motivo devolución calidad</b>
                  </label>
                  <FilterMotivoDevolucionCalidad
                    defaultValue={idMotDevCal}
                    onNewInput={handleChangeMotivoDevolucionCalidad}
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Número de lotes</b>
                  </label>
                  <input
                    type="number"
                    value={numLots}
                    className="form-control"
                    onChange={handleChangeNumeroLotes}
                  />
                </div>
              </div>
              {/* BOTON CORRESPONDIENTE */}
              <div className="mb-3 row">
                <button
                  className="btn btn-primary"
                  onClick={generateDetalleOperacionDevolucionCalidad}
                >
                  Generar Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* DETALLES */}
        {dataOperacionDevolucionCalidadDetalle.length !== 0 && (
          <div className="row mt-4 mx-4">
            {dataOperacionDevolucionCalidadDetalle.map((element) => (
              <RowOperacionDevolucionCalidadDetalle
                key={element.index}
                detalle={element}
                onChangeValueDetalle={handleChangeValueDetalle}
              />
            ))}
          </div>
        )}
      </div>
      {/* FEEDBACK */}
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
