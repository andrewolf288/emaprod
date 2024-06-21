import React, { useEffect, useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { getRetornoVentaDetalleById } from '../../helpers/retorno-venta/getRetornoVentaDetalleById'
import { CardRetornoSalidaDetalle } from '../../components/componentes-retorno-venta/CardRetornoSalidaDetalle'
import { createRetornoLoteStockByDetalle } from '../../helpers/retorno-venta/createRetornoLoteStockByDetalle'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ViewRetornoVenta = () => {
  const { idDevolucionVenta } = useParams()
  const [dataRetornoVenta, setdataRetornoVenta] = useState({
    id: 0,
    idReqEst: 3,
    invSerFac: '',
    invNumFac: '',
    idOpeFacMot: 0,
    desOpeFacMot: '',
    customer: '',
    esOpeFacExi: 0,
    esRet: 0,
    fecCreOpeDev: '',
    detOpeDev: []
  })

  const {
    invSerFac,
    invNumFac,
    idReqEst,
    desOpeFacMot,
    fecCreOpeDev,
    esOpeFacExi,
    esRet,
    customer,
    detOpeDev
  } = dataRetornoVenta

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

  // ******* MANEJADORES DE DIALOGO DE CONFIRMACION *********
  const [openDialogConfirmacion, setOpenDialogConfirmacion] = useState(false)
  const handleOpenDialogConfirmacion = () => {
    setOpenDialogConfirmacion(true)
  }
  const handleCloseDialogConfirmacion = () => {
    setOpenDialogConfirmacion(false)
  }

  // ******* MANEJADORES DE DIALOGO DE CREACION DE LOTES ********
  const [openDialogCrearLote, setOpenDialogCrearLote] = useState(false)
  const handleOpenDialogCrearLote = () => {
    setOpenDialogCrearLote(true)
  }
  const handleCloseDialogCrearLote = () => {
    setOpenDialogCrearLote(false)
  }

  // cerrar ventana
  const handleCloseWindows = (time = 100) => {
    setTimeout(() => {
      window.close()
    }, time)
  }

  // obtenemos la data de la venta con su detalle de salidas por item
  const obtenerDataDetalleVenta = async () => {
    // abrimos el loader
    openLoader()
    const formatData = {
      idOpeDev: idDevolucionVenta
    }
    const resultPeticion = await getRetornoVentaDetalleById(formatData)
    const { result } = resultPeticion
    setdataRetornoVenta(result)
    // cerramos el loader
    closeLoader()
  }

  // cambiar valor radio button
  const onChangeValueRadioButtonRetorno = (event) => {
    setdataRetornoVenta({
      ...dataRetornoVenta,
      esRet: parseInt(event.target.value)
    })
  }

  const crearRetornoVenta = async () => {
    console.log(dataRetornoVenta)
    const resultPeticion = await createRetornoLoteStockByDetalle(
      dataRetornoVenta
    )
    const { message_error, description_error } = resultPeticion

    if (message_error.length === 0) {
      setfeedbackMessages({
        style_message: 'success',
        feedback_description_error: 'La operación se realizó con éxito'
      })
      handleClickFeeback()
      handleCloseWindows(1000)
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  const crearRetornoVentaConLotes = async (detalle) => {
    console.log(detalle)
  }

  const handleDialogCreacionRetornoVenta = () => {
    if (esRet === 1 && esOpeFacExi === 0) {
      handleOpenDialogCrearLote()
      return
    }
    handleOpenDialogConfirmacion()
  }

  useEffect(() => {
    obtenerDataDetalleVenta()
  }, [])

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
                      esOpeFacExi === 0 ? 'text-danger' : 'text-success'
                    }
                  >
                    {esOpeFacExi === 0
                      ? 'Sin trazabilidad'
                      : 'Existe trazabilidad'}
                  </p>
                </div>
              </div>
              <div className="mb-3 row">
                <div className="col-md-8">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cliente</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={customer}
                    className="form-control"
                  />
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
                          '& .MuiSvgIcon-root': {
                            fontSize: 28
                          }
                        }}
                      />
                    }
                    label="Retornar stock"
                    disabled={idReqEst === 3}
                  />
                  <FormControlLabel
                    value={0}
                    control={
                      <Radio
                        sx={{
                          '& .MuiSvgIcon-root': {
                            fontSize: 28
                          }
                        }}
                      />
                    }
                    label="No retornar stock"
                    disabled={idReqEst === 3}
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
        {/* BOTONES DE CANCELAR Y GUARDAR */}
        <div className="btn-toolbar mt-4 ms-4">
          <button
            type="button"
            onClick={handleCloseWindows}
            className="btn btn-secondary me-2"
          >
            Volver
          </button>
          <button
            type="submit"
            onClick={handleDialogCreacionRetornoVenta}
            className="btn btn-primary"
            disabled={idReqEst === 3}
          >
            Guardar
          </button>
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

      {/* DIALOGO DE CONFIRMACION */}
      <DialogConfirmarOperacion
        open={openDialogConfirmacion}
        handleClose={handleCloseDialogConfirmacion}
        handleActionConfirm={crearRetornoVenta}
        title="Dialogo de confirmación de operación"
        esRetorno={esRet}
        existeRegistro={esOpeFacExi}
      />

      {/* DIALOGO DE CREACION DE LOTES */}
      <DialogCrearLotes
        open={openDialogCrearLote}
        handleClose={handleCloseDialogCrearLote}
        handleActionConfirm={crearRetornoVentaConLotes}
        title="Dialogo de creación de lotes"
      />

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

// DIALOGO PARA CONFIRMAR OPERACION
const DialogConfirmarOperacion = ({
  open,
  handleClose,
  title,
  esRetorno,
  existeRegistro,
  handleActionConfirm
}) => {
  const textRetorno = esRetorno ? ' ES DE RETORNO' : ' NO ES DE RETORNO'
  const textExisteRegistro = existeRegistro
    ? ' EXISTE EL REGISTRO'
    : ' NO EXISTE EL REGISTRO'
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>
          Has indicado que la operación
          <span className="text-danger">{textRetorno}</span>. Además,
          <span className="text-danger">{textExisteRegistro}</span> en las
          operaciones de salida.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleActionConfirm} color="primary">
          Aceptar
        </Button>
        <Button onClick={handleClose} color="error">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// DIALOGO PARA CREACION DE LOTES
const DialogCrearLotes = ({
  open,
  handleClose,
  title,
  handleActionConfirm
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent></DialogContent>
      <DialogActions>
        <Button onClick={handleActionConfirm} color="primary">
          Aceptar
        </Button>
        <Button onClick={handleClose} color="error">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
