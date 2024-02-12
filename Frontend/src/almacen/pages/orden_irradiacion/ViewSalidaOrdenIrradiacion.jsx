import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrdenIrradiacionById } from "../../helpers/orden-irradiacion/getOrdenIrradiacionById";
import { CardSalidaOrdenIrradiacionDetalle } from "../../components/componentes-orden-irradiacion/CardSalidaOrdenIrradiacionDetalle";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const ViewSalidaOrdenIrradiacion = () => {
  // obtenemos el parametro de id de la url
  const { id: idOrdIrra } = useParams();
  const [backupdataOrdIrrad, setBackupdataOrdIrrad] = useState(null);
  const [dataOrdIrrad, setdataOrdIrrad] = useState({
    id: 0,
    invSerFac: "",
    invNumFac: "",
    desOrdIrraEst: "",
    fecCreOrdIrra: "",
    detOrdIrra: []
  });

  const { invSerFac, invNumFac, desOrdIrraEst, fecCreOrdIrra, detOrdIrra } =
    dataOrdIrrad;

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

  // funcion para traer la informacion del detalle de orden de irradiacion
  const traerInformacionOrdenIrradiacion = async () => {
    // abrimos el loader
    openLoader();
    const { result, message_error, description_error } =
      await getOrdenIrradiacionById({ idOrdIrra });
    if (message_error.length === 0) {
      console.log(result[0]);
      setdataOrdIrrad(result[0]);
    } else {
      setfeedbackMessages({
        style_message: "error",
        feedback_description_error: description_error
      });
      handleClickFeeback();
    }

    // cerramos el loader
    closeLoader();
  };

  // añadir un lote de salida
  const addLoteSalidaOrdenIrradiacion = (idProdt, salidaLoteDetalle) => {
    // primero debemos encontrar el detalle del elemento
    const detalleFindElement = detOrdIrra.find(
      (element) => element.idProdt === idProdt
    );

    const { detSal } = detalleFindElement;

    // mapeamos
    const dataMapCantidadLote = salidaLoteDetalle.map((element) => {
      const canSalLotProd = parseInt(element.canSalLotProdAct);
      return {
        ...element,
        canSalLotProd: canSalLotProd,
        canSalLotProdAct: 0
      };
    });

    // debemos parsear la informacion
    const detalleSalidasAgregacion = [...detSal, ...dataMapCantidadLote];

    const detalleAux = {
      ...detalleFindElement,
      canOpeIrraAct: detalleFindElement.canOpeFacDet,
      detSal: detalleSalidasAgregacion
    };

    const detalleParser = detOrdIrra.map((element) => {
      if (element.idProdt === idProdt) {
        return {
          ...detalleAux
        };
      } else {
        return element;
      }
    });

    setdataOrdIrrad({
      ...dataOrdIrrad,
      detOrdIrra: detalleParser
    });
  };

  // editar un lote de salida de venta
  const editLoteSalidaOrdenIrradiacion = (idProdt, refProdc, { target }) => {
    const { value } = target;
    // primero debemos encontrar el detalle del elemento
    const detalleFindElement = detOrdIrra.find(
      (element) => element.idProdt === idProdt
    );

    const { detSal } = detalleFindElement;
    let auxTotalSalidaStock = 0;
    const detalleSalidasUpdate = detSal.map((element) => {
      if (element.refProdc === refProdc) {
        auxTotalSalidaStock += parseInt(value);
        return {
          ...element,
          canSalLotProd: value
        };
      } else {
        auxTotalSalidaStock += parseInt(element.canSalLotProd);
        return element;
      }
    });

    const detalleAux = {
      ...detalleFindElement,
      canOpeIrraAct: auxTotalSalidaStock,
      detSal: detalleSalidasUpdate
    };

    const detalleParser = detOrdIrra.map((element) => {
      if (element.idProdt === idProdt) {
        return {
          ...detalleAux
        };
      } else {
        return element;
      }
    });

    setdataOrdIrrad({
      ...dataOrdIrrad,
      detOrdIrra: detalleParser
    });
  };

  // eliminar un lote de salida de venta
  const deleteLoteSalidaOrdenIrradiacion = (idProdt, refProdc) => {
    // primero debemos encontrar el detalle del elemento
    const detalleFindElement = detOrdIrra.find(
      (element) => element.idProdt === idProdt
    );

    // luego filtrar aquellos que no corresponde a la referencia proporcionada
    const { detSal } = detalleFindElement;
    let auxTotalSalidaStock = 0;
    const detalleSalidasFilter = detSal.filter((element) => {
      if (element.refProdc !== refProdc) {
        auxTotalSalidaStock += parseInt(element.canSalLotProd);
        return true;
      } else {
        return false;
      }
    });
    const detalleAux = {
      ...detalleFindElement,
      canOpeIrraAct: auxTotalSalidaStock,
      detSal: detalleSalidasFilter
    };

    const detalleParser = detOrdIrra.map((element) => {
      if (element.idProdt === idProdt) {
        return {
          ...detalleAux
        };
      } else {
        return element;
      }
    });

    setdataOrdIrrad({
      ...dataOrdIrrad,
      detOrdIrra: detalleParser
    });
  };

  const generarSalidaOrdenIrradiacionWithLotes = async (detalle) => {
    if (detalle.canOpeFacDet !== detalle.canOpeIrraAct) {
      setfeedbackMessages({
        style_message: "warning",
        feedback_description_error:
          "La cantidad requerida no fue cumplida. Agregue lotes al detalle"
      });
      handleClickFeeback();
    } else {
      // const resultPeticion = await createSalidaLoteStockByDetalle(detalle);
      // const { message_error, description_error } = resultPeticion;
      // if (message_error.length === 0) {
      //   setfeedbackMessages({
      //     style_message: "success",
      //     feedback_description_error: "La operación se realizó con éxito"
      //   });
      //   handleClickFeeback();
      //   // traemos de nuevo la data
      //   obtenerDataDetalleVenta();
      // } else {
      //   setfeedbackMessages({
      //     style_message: "error",
      //     feedback_description_error: description_error
      //   });
      //   handleClickFeeback();
      // }
    }
  };

  useEffect(() => {
    traerInformacionOrdenIrradiacion();
  }, []);

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">
          Detalle de salida orden irradiación
        </h1>
        {/* DETALLE DE ORDEN DE IRRADIACION */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de la Salida Venta</h6>
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
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Estado orden irradiación</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desOrdIrraEst}
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
                    value={fecCreOrdIrra}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* DETALLE DE SALIDAS DE ORDEN DE IRRADIACION */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle salida venta</h6>
            {detOrdIrra.map((detalle, index) => (
              <CardSalidaOrdenIrradiacionDetalle
                detalle={detalle}
                key={detalle.id}
                index={index}
                onDeleteSalidaStock={deleteLoteSalidaOrdenIrradiacion}
                onUpdateSalidaStock={editLoteSalidaOrdenIrradiacion}
                onAddSalidaStock={addLoteSalidaOrdenIrradiacion}
                setfeedbackMessages={setfeedbackCreate}
                handleClickFeeback={handleClickFeeback}
                generarSalidaStockDetalle={
                  generarSalidaOrdenIrradiacionWithLotes
                }
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
