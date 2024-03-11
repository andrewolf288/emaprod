import React, { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getRetornoVentaDetalleById } from "../../helpers/retorno-venta/getRetornoVentaDetalleById";
import { CardRetornoSalidaDetalle } from "../../components/componentes-retorno-venta/CardRetornoSalidaDetalle";
import { createRetornoLoteStockByDetalle } from "../../helpers/retorno-venta/createRetornoLoteStockByDetalle";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ViewRetornoVenta = () => {
  const { idDevolucionVenta } = useParams();
  const [dataSalidaVenta, setdataSalidaVenta] = useState({
    id: 0,
    invSerFac: "",
    invNumFac: "",
    idOpeFacMot: 0,
    desOpeFacMot: "",
    esOpeFacExi: 0,
    esRet: 0,
    fecCreOpeDev: "",
    detOpeDev: []
  });

  const {
    invSerFac,
    invNumFac,
    desOpeFacMot,
    fecCreOpeDev,
    esOpeFacExi,
    esRet,
    detOpeDev
  } = dataSalidaVenta;

  // ***** FUNCIONES Y STATES PARA FEEDBACK *****
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

  // ****** MANEJADORES DE PROGRESS LINEAR CON DIALOG ********
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // ***** FUNCIONES PARA EL MANEJO DE ACCIONES *****
  const openLoader = () => {
    setOpenDialog(true);
    setLoading(true);
  };
  const closeLoader = () => {
    setLoading(false);
    setOpenDialog(false);
  };

  // obtenemos la data de la venta con su detalle de salidas por item
  const obtenerDataDetalleVenta = async () => {
    // abrimos el loader
    openLoader();
    const formatData = {
      idOpeDev: idDevolucionVenta
    };
    const resultPeticion = await getRetornoVentaDetalleById(formatData);
    const { result } = resultPeticion;
    console.log(result);
    setdataSalidaVenta(result);
    // cerramos el loader
    closeLoader();
  };

  // cambiar valor radio button
  const onChangeValueRadioButtonRetorno = (event) => {
    setdataSalidaVenta({
      ...dataSalidaVenta,
      esRet: event.target.value
    });
  };

  const generarRetornoVentaWithLotes = async (detalle) => {
    if (detalle.canOpeFacDet !== detalle.canOpeFacDetAct) {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error:
          "La cantidad requerida no fue cumplida. Agregue lotes al detalle"
      });
      handleClickFeeback();
    } else {
      const formatData = {
        ...detalle,
        idGuiRem: dataSalidaVenta["idGuiRem"]
      };
      console.log(formatData);
      const resultPeticion = await createRetornoLoteStockByDetalle(formatData);
      const { message_error, description_error } = resultPeticion;

      if (message_error.length === 0) {
        setfeedbackMessages({
          style_message: "success",
          feedback_description_error: "La operación se realizó con éxito"
        });
        handleClickFeeback();
        // traemos de nuevo la data
        obtenerDataDetalleVenta();
      } else {
        setfeedbackMessages({
          style_message: "error",
          feedback_description_error: description_error
        });
        handleClickFeeback();
      }
    }
  };

  useEffect(() => {
    obtenerDataDetalleVenta();
  }, []);
  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Detalle de Retorno Venta</h1>
        <div className="row mt-4 mx-4">
          {/* SALIDA DE VENTA */}
          <div className="card d-flex">
            <h6 className="card-header">Datos del Retorno Venta</h6>
            <div className="card-body">
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
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Motivo operación</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desOpeFacMot}
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
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>¿Se tiene trazabilidad?</b>
                  </label>
                  <p
                    className={
                      esOpeFacExi === 0 ? "text-danger" : "text-success"
                    }
                  >
                    {esOpeFacExi === 0
                      ? "Sin trazabilidad"
                      : "Existe trazabilidad"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* DETALLE DE SALIDA DE VENTA */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle devolución venta</h6>

            <div className="d-flex justify-content-center mt-4">
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">
                  Acción de stock
                </FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  value={esRet}
                  onChange={onChangeValueRadioButtonRetorno}
                >
                  <FormControlLabel
                    value={1}
                    control={
                      <Radio
                        sx={{
                          "& .MuiSvgIcon-root": {
                            fontSize: 28
                          }
                        }}
                      />
                    }
                    label="Retornar stock"
                  />
                  <FormControlLabel
                    value={0}
                    control={
                      <Radio
                        sx={{
                          "& .MuiSvgIcon-root": {
                            fontSize: 28
                          }
                        }}
                      />
                    }
                    label="No retornar stock"
                  />
                </RadioGroup>
              </FormControl>
            </div>
            {detOpeDev.map((detalle, index) => (
              <CardRetornoSalidaDetalle
                detalle={detalle}
                key={detalle.id}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      {/* LOADER CON DIALOG */}
      <Dialog open={openDialog}>
        <DialogTitle>Cargando...</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor, espere mientras se procesa la solicitud.
          </DialogContentText>
          <CircularProgress />
        </DialogContent>
      </Dialog>

      {/* alerta */}
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
