import React, { useEffect, useState } from 'react'
import { getSalidaVentaDetalleById } from '../../helpers/salida-venta/getSalidaVentaDetalleById'
import { CardSalidaVentaDetalle } from '../../components/componentes-salida-venta/CardSalidaVentaDetalle'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import { createSalidaLoteStockByDetalle } from '../../helpers/salida-venta/createSalidaLoteStockByDetalle'
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import { useParams } from 'react-router-dom'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ViewSalidaVenta = () => {
  const { idSalidaVenta } = useParams()
  const [dataSalidaVenta, setdataSalidaVenta] = useState({
    id: 0,
    invSerFac: '',
    invNumFac: '',
    desOpeFacMot: '',
    fueAfePorAnul: 0,
    fueAfePorDev: 0,
    fecCreOpeFac: '',
    detOpeFac: []
  })

  const {
    invSerFac,
    invNumFac,
    desOpeFacMot,
    fueAfePorAnul,
    fueAfePorDev,
    fecCreOpeFac,
    detOpeFac
  } = dataSalidaVenta

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

  // obtenemos la data de la venta con su detalle de salidas por item
  const obtenerDataDetalleVenta = async () => {
    // abrimos el loader
    openLoader()
    const formatData = {
      idOpeFac: idSalidaVenta
    }
    const resultPeticion = await getSalidaVentaDetalleById(formatData)
    const { result } = resultPeticion
    setdataSalidaVenta(result[0])
    // cerramos el loader
    closeLoader()
  }

  // añadir un lote de salida
  const addLoteSalidaVenta = (idProdt, salidaLoteDetalle) => {
    // primero debemos encontrar el detalle del elemento
    const detalleFindElement = detOpeFac.find(
      (element) => element.idProdt === idProdt
    )

    const { detSal } = detalleFindElement

    // mapeamos
    const dataMapCantidadLote = salidaLoteDetalle.map((element) => {
      const canSalLotProd = parseInt(element.canSalLotProdAct)
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
      canOpeFacDetAct: detalleFindElement.canOpeFacDet,
      detSal: detalleSalidasAgregacion
    }

    const detalleParser = detOpeFac.map((element) => {
      if (element.idProdt === idProdt) {
        return {
          ...detalleAux
        }
      } else {
        return element
      }
    })

    setdataSalidaVenta({
      ...dataSalidaVenta,
      detOpeFac: detalleParser
    })
  }

  // editar un lote de salida de venta
  const editLoteSalidaVenta = (idProdt, refProdc, { target }) => {
    const { value } = target
    // primero debemos encontrar el detalle del elemento
    const detalleFindElement = detOpeFac.find(
      (element) => element.idProdt === idProdt
    )

    const { detSal } = detalleFindElement
    let auxTotalSalidaStock = 0
    const detalleSalidasUpdate = detSal.map((element) => {
      if (element.refProdc === refProdc) {
        auxTotalSalidaStock += parseInt(value)
        return {
          ...element,
          canSalLotProd: value
        }
      } else {
        auxTotalSalidaStock += parseInt(element.canSalLotProd)
        return element
      }
    })

    const detalleAux = {
      ...detalleFindElement,
      canOpeFacDetAct: auxTotalSalidaStock,
      detSal: detalleSalidasUpdate
    }

    const detalleParser = detOpeFac.map((element) => {
      if (element.idProdt === idProdt) {
        return {
          ...detalleAux
        }
      } else {
        return element
      }
    })

    setdataSalidaVenta({
      ...dataSalidaVenta,
      detOpeFac: detalleParser
    })
  }

  // eliminar un lote de salida de venta
  const deleteLoteSalidaVenta = (idProdt, refProdc) => {
    // primero debemos encontrar el detalle del elemento
    const detalleFindElement = detOpeFac.find(
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
    const detalleAux = {
      ...detalleFindElement,
      canOpeFacDetAct: auxTotalSalidaStock,
      detSal: detalleSalidasFilter
    }

    const detalleParser = detOpeFac.map((element) => {
      if (element.idProdt === idProdt) {
        return {
          ...detalleAux
        }
      } else {
        return element
      }
    })

    setdataSalidaVenta({
      ...dataSalidaVenta,
      detOpeFac: detalleParser
    })
  }

  const generarSalidaVentaWithLotes = async (detalle) => {
    if (detalle.canOpeFacDet !== detalle.canOpeFacDetAct) {
      if (detalle.esMerProm === 1) {
        const resultPeticion = await createSalidaLoteStockByDetalle(detalle)
        const { message_error, description_error } = resultPeticion

        if (message_error.length === 0) {
          setfeedbackMessages({
            style_message: 'success',
            feedback_description_error: 'La operación se realizó con éxito'
          })
          handleClickFeeback()
          // traemos de nuevo la data
          obtenerDataDetalleVenta()
        } else {
          setfeedbackMessages({
            style_message: 'error',
            feedback_description_error: description_error
          })
          handleClickFeeback()
        }
      } else {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error:
            'La cantidad requerida no fue cumplida. Agregue lotes al detalle'
        })
        handleClickFeeback()
      }
    } else {
      const resultPeticion = await createSalidaLoteStockByDetalle(detalle)
      const { message_error, description_error } = resultPeticion

      if (message_error.length === 0) {
        setfeedbackMessages({
          style_message: 'success',
          feedback_description_error: 'La operación se realizó con éxito'
        })
        handleClickFeeback()
        // traemos de nuevo la data
        obtenerDataDetalleVenta()
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
    obtenerDataDetalleVenta()
  }, [])

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Detalle de Salida Venta</h1>
        <div className="row mt-4 mx-4">
          {/* SALIDA DE VENTA */}
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
                    value={fecCreOpeFac}
                    className="form-control"
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Anulado</b>
                  </label>
                  <p>{fueAfePorAnul === 0 ? 'NO' : 'SI'}</p>
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Afectado</b>
                  </label>
                  <p>{fueAfePorDev === 0 ? 'NO' : 'SI'}</p>
                </div>
              </div>
            </div>
          </div>
          {/* DETALLE DE SALIDA DE VENTA */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle salida venta</h6>
            {detOpeFac.map((detalle, index) => (
              <CardSalidaVentaDetalle
                key={detalle.id}
                detalle={detalle}
                index={index}
                onDeleteSalidaStock={deleteLoteSalidaVenta}
                onUpdateSalidaStock={editLoteSalidaVenta}
                onAddSalidaStock={addLoteSalidaVenta}
                setfeedbackMessages={setfeedbackMessages}
                handleClickFeeback={handleClickFeeback}
                generarSalidaStockDetalle={generarSalidaVentaWithLotes}
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
