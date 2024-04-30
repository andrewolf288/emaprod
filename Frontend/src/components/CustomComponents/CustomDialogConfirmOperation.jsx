import React from 'react'
import { BootstrapDialog } from '../BootstrapDialog'
import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material'

export const CustomDialogConfirmOperation = (
  {
    detalle,
    onConfirmOperation,
    disabled,
    formato = {
      nombre: 'nomProd',
      cantidad: 'canReq',
      medida: 'simMed'
    }
  }
) => {
  const [open, setOpen] = React.useState(false)

  // funcion para abrir el cuadro de dialogo
  const handleClickOpen = () => {
    setOpen(true)
  }
  // funcion para cerrar el cuadro de dialogo
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
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold' }} id="customized-dialog-title">
            Confirmar operación
        </DialogTitle>
        <DialogContent dividers>
          <span className="me-2 d-block fw-semibold">Producto:</span>
          {detalle[formato.nombre]}
          <span className="me-2 d-block mt-2 fw-semibold">Total requisicion:</span>
          {detalle[formato.cantidad]}
          <span className="ms-2">{detalle[formato.medida]}</span>
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
              onConfirmOperation(detalle)
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
