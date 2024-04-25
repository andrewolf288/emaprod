import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TableCell, TableRow, TextField } from '@mui/material'
import React from 'react'
import { styled } from '@mui/material/styles'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}))

export const RowEditRequisicionEmpaquetadoPromocionalAlmacen = ({ detalle, onUpdateDetalleRequisicion, onDeleteDetalleRequisicion, onCreateSalida }) => {
  const { codLotProd, fecVenLotProd, idProdc } = detalle
  const textInfoLote = idProdc === null ? 'FIFO' : `${codLotProd} - ${mostrarMesYAnio(fecVenLotProd)}`

  return (
    <TableRow>
      {detalle.esProdFin === 1 &&
      (<TableCell><span className='me-2'>{textInfoLote}</span></TableCell>)
      }
      <TableCell>{detalle.codProd2}</TableCell>
      <TableCell>{detalle.nomProd}</TableCell>
      <TableCell>
        <span className={`badge text-bg-${detalle.esCom === 1 ? 'success' : 'danger'}`}>
          {detalle.esCom === 1 ? 'Completado' : 'Requerido'}
        </span>
      </TableCell>
      <TableCell align='center'>
        {detalle.canReqEmpPromDet}
      </TableCell>
      <TableCell>
        <div className="btn-toolbar d-flex justify-content-center">
          {/* BOTON DE VISTA DE DETALLE */}
          <DialogConfirmRequisicionMaterialesDetalle
            detalle={detalle}
            disabled={detalle.esCom !== 0}
            onCreateSalida={onCreateSalida}/>
          {/* EDICION DEL DETALLE */}
          <DialogEditCheckRequisicionMaterialesDetalle
            detalle={detalle}
            disabled={detalle.esCom !== 0}
            onUpdateDetalleRequisicion={onUpdateDetalleRequisicion}
          />
          {/* ELIMINACION DE DETALLE */}
          <DialogDeleteRequisicionMaterialesDetalle
            detalle={detalle}
            disabled={detalle.esCom !== 0}
            onDeleteDetalleRequisicion={onDeleteDetalleRequisicion}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}

const DialogConfirmRequisicionMaterialesDetalle = ({ detalle, onCreateSalida, disabled }) => {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <button
        className="btn btn-success me-2"
        onClick={handleClickOpen}
        disabled={disabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>
      </button>
      <BootstrapDialog
        maxWidth={'l'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Salida total
        </DialogTitle>
        <DialogContent dividers>
          <b className="me-2 d-block">Producto:</b>
          {detalle.nomProd}
          <b className="me-2 d-block mt-2">Total requisicion:</b>
          {detalle.canReqEmpPromDet}
          <span className="ms-2">{detalle.simMed}</span>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            color="error"
            autoFocus
            onClick={() => {
              // terminamos de procesar la salida total
              onCreateSalida(detalle)
              // cerramos el cuadro de dialogo emergente
              handleClose()
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>

  )
}

const DialogEditCheckRequisicionMaterialesDetalle = ({ detalle, disabled, onUpdateDetalleRequisicion }) => {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }
  const [inputValue, setinputValue] = React.useState(0.0)

  const handleInputValue = ({ target }) => {
    const { value } = target
    setinputValue(value)
  }

  return (
    <div>
      <button
        className='btn btn-warning me-2'
        onClick={handleClickOpen}
        disabled={disabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
          <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
        </svg>
      </button>
      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Actualizar requisicion detalle
        </DialogTitle>
        <DialogContent dividers>
          <b className="fw-bolder text-danger d-block mb-2">
              Ingresa la cantidad actualizada
          </b>
          <b className="me-2 d-block">Producto:</b>
          {detalle.nomProd}
          <b className="me-2 d-block mt-2">Total requisicion:</b>
          {detalle.canReqEmpPromDet}
          <span className="ms-2">{detalle.simMed}</span>
          <b className="me-2 d-block mt-2">Cantidad nueva</b>
          <TextField
            value={inputValue}
            onChange={handleInputValue}
            size="small"
            type="number"
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
              Cerrar
          </Button>
          <Button
            color="error"
            autoFocus
            onClick={() => {
              // procesamos la actualizacion de detalle de requisicion
              onUpdateDetalleRequisicion(detalle, inputValue)
              // cerramos el cuadro de dialogo
              handleClose()
            }}
          >
              Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  )
}

const DialogDeleteRequisicionMaterialesDetalle = ({
  detalle,
  onDeleteDetalleRequisicion,
  disabled
}) => {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <button
        className='btn btn-danger me-2'
        onClick={handleClickOpen}
        disabled={disabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
      </button>
      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Eliminar Requisicion Detalle
        </DialogTitle>
        <DialogContent dividers>
          <b className="me-2 d-block">Producto: </b>
          {detalle.nomProd}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
              Cerrar
          </Button>
          <Button
            color="error"
            autoFocus
            onClick={() => {
              // procesamos la eliminacion del detalle de la requisicion
              onDeleteDetalleRequisicion(detalle)
              // cerramos el cuadro de dialogo
              handleClose()
            }}
          >
              Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  )
}
