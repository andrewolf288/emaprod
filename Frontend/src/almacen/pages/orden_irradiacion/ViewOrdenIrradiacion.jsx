import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrdenIrradiacionById } from '../../helpers/orden-irradiacion/getOrdenIrradiacionById'
import { CardSalidaOrdenIrradiacionDetalle } from '../../components/componentes-orden-irradiacion/CardSalidaOrdenIrradiacionDetalle'
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { createSalidaOrdenIrradiacionByDetalle } from '../../helpers/orden-irradiacion/createSalidaOrdenIrradiacionByDetalle'
import { createIngresoOrdenIrradiacionByDetalle } from '../../helpers/orden-irradiacion/createIngresoOrdenIrradiacionByDetalle'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ViewOrdenIrradiacion = () => {
  // obtenemos el parametro de id de la url
  const { id: idOrdIrra } = useParams()
  const [dataOrdIrrad, setdataOrdIrrad] = useState({
    id: 0,
    invSerFac: '',
    invNumFac: '',
    desOrdIrraEst: '',
    fecCreOrdIrra: '',
    detOrdIrra: []
  })

  const { invSerFac, invNumFac, desOrdIrraEst, fecCreOrdIrra, detOrdIrra } =
    dataOrdIrrad

  // ***** FUNCIONES Y STATES PARA FEEDBACK *****
  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackCreate, setfeedbackCreate] = useState(false)
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: '',
    feedback_description_error: ''
  })
  const { style_message, feedback_description_error } = feedbackMessages

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackCreate(true)
  }

  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setfeedbackCreate(false)
  }

  // ****** MANEJADORES DE PROGRESS LINEAR CON DIALOG ********
  const [openDialog, setOpenDialog] = useState(false)

  // ***** FUNCIONES PARA EL MANEJO DE ACCIONES *****
  const openLoader = () => {
    setOpenDialog(true)
  }
  const closeLoader = () => {
    setOpenDialog(false)
  }

  // funcion para traer la informacion del detalle de orden de irradiacion
  const traerInformacionOrdenIrradiacion = async () => {
    // abrimos el loader
    openLoader()
    const { result, message_error, description_error } =
      await getOrdenIrradiacionById({ idOrdIrra })
    if (message_error.length === 0) {
      console.log(result[0])
      setdataOrdIrrad(result[0])
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }

    // cerramos el loader
    closeLoader()
  }

  // añadir un lote de salida
  const addLoteSalidaOrdenIrradiacion = (idProdt, salidaLoteDetalle) => {
    // primero debemos encontrar el detalle del elemento
    const detalleFindElement = detOrdIrra.find(
      (element) => element.idProdt === idProdt
    )

    const { detSal } = detalleFindElement

    // mapeamos
    let auxCanOpeIrraAct = 0
    const dataMapCantidadLote = salidaLoteDetalle.map((element) => {
      const canSalLotProd = parseInt(element.canSalLotProdAct)
      auxCanOpeIrraAct += canSalLotProd
      return {
        ...element,
        canSalLotProd,
        canSalLotProdAct: 0
      }
    })

    // debemos parsear la informacion
    const detalleSalidasAgregacion = [...detSal, ...dataMapCantidadLote]

    const detalleAux = {
      ...detalleFindElement,
      canOpeIrraAct: detalleFindElement.canOpeIrraAct + auxCanOpeIrraAct,
      detSal: detalleSalidasAgregacion
    }

    const detalleParser = detOrdIrra.map((element) => {
      if (element.idProdt === idProdt) {
        return {
          ...detalleAux
        }
      } else {
        return element
      }
    })

    setdataOrdIrrad({
      ...dataOrdIrrad,
      detOrdIrra: detalleParser
    })
  }

  // eliminar un lote de salida de venta
  const deleteLoteSalidaOrdenIrradiacion = (idProdt, refProdc) => {
    // primero debemos encontrar el detalle del elemento
    const detalleFindElement = detOrdIrra.find(
      (element) => element.idProdt === idProdt
    )

    // luego filtrar aquellos que no corresponde a la referencia proporcionada
    const { detSal } = detalleFindElement
    let auxTotalSalidaStock = 0
    const detalleSalidasFilter = detSal.filter((element) => {
      if (element.refProdc !== refProdc) {
        auxTotalSalidaStock += parseInt(element.canSalLotProd)
        return true
      } else {
        return false
      }
    })

    // formamos la nueva data
    const detalleAux = {
      ...detalleFindElement,
      canOpeIrraAct: auxTotalSalidaStock,
      detSal: detalleSalidasFilter
    }

    // el detalle del detalle afectado debe ser actualizado con la data formada despues de la operacion
    const detalleParser = detOrdIrra.map((element) => {
      if (element.idProdt === idProdt) {
        return {
          ...detalleAux
        }
      } else {
        return element
      }
    })

    // reflejamos los cambios
    setdataOrdIrrad({
      ...dataOrdIrrad,
      detOrdIrra: detalleParser
    })
  }

  // esta funcion se encarga de comunicarse con el backend para hacer las entradas de productos irradiados correspondiente al detalle de orden de irradiaicon
  const generarEntradaOrdenIrradiacionWithLotes = async (detalle) => {
    if (detalle.fueComSal === 0) {
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: 'No se realizó la salida de su detalle'
      })
      handleClickFeeback()
    } else {
      console.log(detalle)
      const resultPeticion = await createIngresoOrdenIrradiacionByDetalle(
        detalle
      )
      console.log(resultPeticion)
      const { message_error, description_error } = resultPeticion
      if (message_error.length === 0) {
        setfeedbackMessages({
          style_message: 'success',
          feedback_description_error: 'La operación se realizó con éxito'
        })
        handleClickFeeback()
        // traemos de nuevo la data
        traerInformacionOrdenIrradiacion()
      } else {
        setfeedbackMessages({
          style_message: 'error',
          feedback_description_error: description_error
        })
        handleClickFeeback()
      }
    }
  }

  // esta funcion se encarga de comunicarse con el backend para hacer las salidas correspondientes por orden de irradiacion
  const generarSalidaOrdenIrradiacionWithLotes = async (detalle) => {
    if (detalle.canOpeIrra !== detalle.canOpeIrraAct) {
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error:
          'La cantidad requerida no fue cumplida. Agregue lotes al detalle'
      })
      handleClickFeeback()
    } else {
      console.log(detalle)
      const resultPeticion = await createSalidaOrdenIrradiacionByDetalle(
        detalle
      )
      console.log(resultPeticion)
      const { message_error, description_error } = resultPeticion
      if (message_error.length === 0) {
        setfeedbackMessages({
          style_message: 'success',
          feedback_description_error: 'La operación se realizó con éxito'
        })
        handleClickFeeback()
        // traemos de nuevo la data
        traerInformacionOrdenIrradiacion()
      } else {
        setfeedbackMessages({
          style_message: 'error',
          feedback_description_error: description_error
        })
        handleClickFeeback()
      }
    }
  }

  useEffect(() => {
    traerInformacionOrdenIrradiacion()
  }, [])

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
                onAddSalidaStock={addLoteSalidaOrdenIrradiacion}
                setfeedbackMessages={setfeedbackCreate}
                handleClickFeeback={handleClickFeeback}
                generarSalidaStockDetalle={
                  generarSalidaOrdenIrradiacionWithLotes
                }
                generarEntradaStockDetalle={
                  generarEntradaOrdenIrradiacionWithLotes
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
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={feedbackCreate}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={style_message}
          sx={{ width: '100%' }}
        >
          {feedback_description_error}
        </Alert>
      </Snackbar>
    </>
  )
}
