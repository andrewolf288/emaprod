import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrdenReprocesoById } from '../../helpers/orden-reproceso/getOrdenReprocesoById'
import { Snackbar } from '@mui/base'
import MuiAlert from '@mui/material/Alert'
import { CardRequisicionDevolucion } from '../../components/componentes-devoluciones/CardRequisicionDevolucion'
import { CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import { deleteRequisicionDevolucionDetalleById } from '../../helpers/devoluciones-lote-produccion/deleteRequisicionDevolucionDetalleById'
import { updateRequisicionDevolucionDetalleById } from '../../helpers/devoluciones-lote-produccion/updateRequisicionDevolucionDetalleById'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ViewOrdenReproceso = () => {
  const { idOpeDevCal } = useParams()

  const [dataOrdeReproceso, setDataOrdenReproceso] = useState(
    {
      fueCom: 0,
      numLots: 0,
      nomProd: '',
      canOpeDevDet: 0,
      fecCreOpeDevCal: '',
      devoluciones: []

    }
  )

  const { numLots, nomProd, fecCreOpeDevCal, canOpeDevDet, devoluciones } = dataOrdeReproceso

  // ****** MANEJADORES DE PROGRESS LINEAR CON DIALOG ********
  const [openDialog, setOpenDialog] = useState(false)

  // ***** FUNCIONES PARA EL MANEJO DE ACCIONES *****
  const openLoader = () => {
    setOpenDialog(true)
  }
  const closeLoader = () => {
    setOpenDialog(false)
  }

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

  // funcion para editar la requisicion de agregacion
  const onDeleteDetalleRequisicionDevolucion = async (detalle) => {
    console.log(detalle)
    // abrimos el loader
    openLoader()
    const { message_error, description_error } =
      await deleteRequisicionDevolucionDetalleById(detalle)
    if (message_error.length === 0) {
      // llamamos a la data
      traerInformacionOperacionDevolucionCalidad()
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

  // funcion para eliminar la requisicion de agregacion
  const onUpdateDetalleRequisicionDevolucion = async (detalle, inputValue) => {
    console.log(detalle, inputValue)
    // abrimos el loader
    openLoader()
    // canReqAgrDetNew
    const { message_error, description_error } =
      await updateRequisicionDevolucionDetalleById(detalle, inputValue)
    if (message_error.length === 0) {
      // llamamos a la data
      traerInformacionOperacionDevolucionCalidad()
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

  // funcion para cumplir la requisicion de agregacion
  const onCheckDetalleRequisicionDevolucion = async (detalle, requisicion) => {
    // const { idProdFin } = requisicion
    // const formatData = {
    //   ...detalle,
    //   idProdc,
    //   idProdFin
    // }
    // console.log(formatData)
    // abrimos el loader
    openLoader()
    // const resultPeticion = await createDevolucionOrdenTransformacion(
    //   formatData
    // )
    // console.log(resultPeticion)
    // const { message_error, description_error } = resultPeticion
    // if (message_error.length === 0) {
    //   // llamamos a la data
    //   traerInformacionOperacionDevolucionCalidad()
    // } else {
    //   setfeedbackMessages({
    //     style_message: 'error',
    //     feedback_description_error: description_error
    //   })
    //   handleClickFeeback()
    // }
    // // cerramos el loader
    closeLoader()
  }

  const traerInformacionOperacionDevolucionCalidad = async () => {
    const resultPeticion = await getOrdenReprocesoById(idOpeDevCal)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setDataOrdenReproceso(result)
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  useEffect(() => {
    traerInformacionOperacionDevolucionCalidad()
  }, [])
  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">
          Detalle de orden de reproceso
        </h1>
        {/* DETALLE DE ORDEN DE REPROCESO */}
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de la operación reproceso</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Número de lotes</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={numLots}
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
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha creación</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecCreOpeDevCal}
                    className="form-control"
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad total</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={canOpeDevDet}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* CARD DE DEVOLUCIONES */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Requisiciones</h6>
            {devoluciones.map((requisicion, index) => (
              <CardRequisicionDevolucion
                key={requisicion.id}
                correlativo={requisicion.correlativo}
                requisicion={requisicion}
                onDeleteRequisicionDevolucionDetalle={
                  onDeleteDetalleRequisicionDevolucion
                }
                onUpdateRequisicionDevolucionDetalle={
                  onUpdateDetalleRequisicionDevolucion
                }
                onCheckRequisicionDevolucionDetalle={
                  onCheckDetalleRequisicionDevolucion
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

    </>)
}
