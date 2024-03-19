import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
// IMPORTACIONES PARA TABLE MUI
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
// IMPORTACIONES PARA EL PROGRESS LINEAR
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  CircularProgress
} from '@mui/material'
import { updateRequisicionMaterialesDetalleById } from '../../helpers/requisicion-materiales/updateRequisicionMaterialesDetalleById'
import { createSalidasStockAutomaticas } from '../../helpers/lote-produccion/createSalidasStockAutomaticas'
import { viewMaterialesRequisicionId } from '../../helpers/requisicion-materiales/viewMaterialesRequisicionId'
import { RowRequisicionMaterialesDetalle } from '../../components/componentes-requisicion-materiales/RowRequisicionMaterialesDetalle'
import { DialogUpdateDetalleRequisicion } from '../../components/componentes-lote-produccion/DialogUpdateDetalleRequisicion'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const ViewRequisicionMateriales = () => {
  const { idReq } = useParams()
  const [requisicionMateriales, setRequisicionMateriales] = useState({
    codReq: '',
    idAre: 0,
    desAre: '',
    idReqEst: 0,
    desReqEst: '',
    idReqTip: 0,
    desReqTip: '',
    fecPedReq: '',
    fecEntReq: '',
    reqDet: []
  })

  const { codReq, desReqEst, desReqTip, fecPedReq, fecEntReq, reqDet } =
    requisicionMateriales

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

  // ****** MANEJADORES DE DIALOG UPDATE CANTIDAD *******
  const [showDialogUpdate, setshowDialogUpdate] = useState(false)
  const [itemSeleccionado, setItemSeleccionado] = useState(null)

  // ****** MANEJADORES DE PROGRESS LINEAR CON DIALOG ********
  const [openDialog, setOpenDialog] = useState(false)

  const closeLoader = () => {
    setOpenDialog(false)
  }

  // mostrar y setear dialog update de detalle de requisicion
  const showAndSetDialogUpdateDetalleRequisicion = (item) => {
    // establecemos los valores
    setItemSeleccionado(item)
    // abrimos el modal
    setshowDialogUpdate(true)
  }

  const closeDialogUpdateDetalleRequisicion = () => {
    setshowDialogUpdate(false)
    setItemSeleccionado(null)
  }

  // crear salidas correspondientes
  const onCreateSalidasStock = async (requisicion_detalle) => {
    const formatData = {
      ...requisicion_detalle,
      idAre: 4,
      numop: 'MATERIALES PRODUCCION'
    }
    console.log(formatData)

    const resultPeticion = await createSalidasStockAutomaticas(formatData)
    const { message_error, description_error } = resultPeticion

    if (message_error?.length === 0) {
      // volvemos a consultar la data
      obtenerDataProduccionRequisicionesDetalle()
      // cerramos modal
      closeLoader()
      // mostramos el feedback
      setfeedbackMessages({
        style_message: 'success',
        feedback_description_error: 'Se cumplio la requisicion exitosamente'
      })
      handleClickFeeback()
    } else {
      // cerramos el modal
      closeLoader()
      // mostramos el feedback
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  // actualizar detalle de requisicion
  const onUpdateDetalleRequisicion = async (itemUpdate, cantidadNueva) => {
    const { id } = itemUpdate
    const body = {
      id,
      cantidadNueva
    }
    const resultPeticion = await updateRequisicionMaterialesDetalleById(body)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      // actualizamos la cantidad
      obtenerDataProduccionRequisicionesDetalle()
      // cerramos el modal
      closeDialogUpdateDetalleRequisicion()
      // mostramos el feedback
      setfeedbackMessages({
        style_message: 'success',
        feedback_description_error:
          'Se actualizó el detalle de la requisicion con exito'
      })
      handleClickFeeback()
    } else {
      // cerramos el modal
      closeDialogUpdateDetalleRequisicion()
      // mostramos el feedback
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  // funcion para obtener la produccion con sus requisiciones y su detalle
  const obtenerDataProduccionRequisicionesDetalle = async () => {
    const resultPeticion = await viewMaterialesRequisicionId(idReq)

    const { message_error, description_error, result } = resultPeticion

    if (message_error.length === 0) {
      setRequisicionMateriales(result[0])
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
  }

  useEffect(() => {
    obtenerDataProduccionRequisicionesDetalle()
  }, [])

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Requisicion materiales</h1>
        <div className="row mt-4 mx-4">
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de requisicion</h6>
            <div className="card-body">
              <div className="mb-3 row d-flex align-items-center">
                {/* CODIGO DE REQUISICION */}
                {codReq && (
                  <div className="col-md-3">
                    <label htmlFor="nombre" className="form-label">
                      <b>Codigo lote</b>
                    </label>
                    <input
                      type="text"
                      disabled={true}
                      value={codReq}
                      className="form-control"
                    />
                  </div>
                )}
                {/* TIPO DE PRODUCCION */}
                {desReqTip && (
                  <div className="col-md-3">
                    <label htmlFor="nombre" className="form-label">
                      <b>Tipo de requisicion</b>
                    </label>
                    <input
                      type="text"
                      disabled={true}
                      value={desReqTip}
                      className="form-control"
                    />
                  </div>
                )}
                {/* ESTADO DE PRODUCCION */}
                {desReqEst && (
                  <div className="col-md-4">
                    <label htmlFor="nombre" className="form-label">
                      <b>Estado de Producción</b>
                    </label>
                    <input
                      type="text"
                      disabled={true}
                      value={desReqEst}
                      className="form-control"
                    />
                  </div>
                )}
              </div>
              <div className="mb-3 row d-flex align-items-center">
                {/* FECHA DE PEDIDO */}
                {fecPedReq && (
                  <div className="col-md-3">
                    <label htmlFor="nombre" className="form-label">
                      <b>Fecha de pedido</b>
                    </label>
                    <input
                      type="text"
                      disabled={true}
                      value={fecPedReq}
                      className="form-control"
                    />
                  </div>
                )}

                {/* FECHA DE CUMPLIMIENTO */}
                {fecEntReq && (
                  <div className="col-md-3">
                    <label htmlFor="nombre" className="form-label">
                      <b>Fecha de entrega</b>
                    </label>
                    <input
                      type="text"
                      disabled={true}
                      value={fecEntReq}
                      className="form-control"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* DATOS DE LAS REQUISICIONES */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle de requisicion</h6>
            <div className="card-body">
              <Paper>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow
                        sx={{
                          '& th': {
                            color: 'rgba(96, 96, 96)',
                            backgroundColor: '#f5f5f5'
                          }
                        }}
                      >
                        <TableCell align="left" width={200}>
                          <b>Nombre</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Estado</b>
                        </TableCell>
                        <TableCell align="left" width={20}>
                          <b>U.M</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Cantidad</b>
                        </TableCell>
                        <TableCell align="left" width={150}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reqDet.map((element) => {
                        return (
                          <RowRequisicionMaterialesDetalle
                            key={element.id}
                            detalle={element}
                            onUpdateDetalleRequisicion={
                              showAndSetDialogUpdateDetalleRequisicion
                            }
                            onCreateSalidasStock={onCreateSalidasStock}
                          />
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>
          <div className="btn-toolbar mt-4">
            <button
              type="button"
              onClick={() => {
                window.close()
              }}
              className="btn btn-secondary me-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* DIALOG UPDATE DETALLE REQUISICION */}
      {showDialogUpdate && (
        <DialogUpdateDetalleRequisicion
          itemUpdate={itemSeleccionado}
          onClose={closeDialogUpdateDetalleRequisicion}
          onUpdateItemSelected={onUpdateDetalleRequisicion}
        />
      )}

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

      {/* FEEDBACK AGREGAR MATERIA PRIMA */}
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
