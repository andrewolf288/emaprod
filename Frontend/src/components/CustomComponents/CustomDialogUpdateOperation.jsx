import React from 'react'
import { BootstrapDialog } from '../BootstrapDialog'
import { Button, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { parserInputQuantity } from '../../utils/functions/validations'
import { alertWarning } from '../../utils/alerts/alertsCustoms'

export const CustomDialogUpdateOperation = (
  {
    detalle,
    onUpdateOperation,
    disabled,
    formato = {
      nombre: 'nomProd',
      cantidad: 'canReq',
      medida: 'simMed'
    }
  }
) => {
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

  // comprobar cantidad
  const handleCheckValues = () => {
    const parserQuantity = parserInputQuantity(inputValue)
    if (parserQuantity <= 0) {
      alertWarning('Debes ingresar una cantidad mayor a 0')
    } else {
      // actualizar
      onUpdateOperation(detalle, inputValue)
      // cerrar dialog
      handleClose()
    }
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
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold' }} id="customized-dialog-title">
            Operación actualización
        </DialogTitle>
        <DialogContent dividers>
          <span className="me-2 d-block fw-semibold">Producto:</span>
          {detalle[formato.nombre]}
          <span className="me-2 d-block mt-2 fw-semibold">Total requisicion:</span>
          {detalle[formato.cantidad]}
          <span className="ms-2">{detalle[formato.medida]}</span>
          <b className="me-2 d-block mt-2 fw-semibold text-danger">Cantidad nueva</b>
          <TextField
            value={inputValue}
            onChange={handleInputValue}
            size="small"
            type="number"
            autoComplete="off"
            onWheel={(e) => e.target.blur()}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
              Cerrar
          </Button>
          <Button
            color="error"
            autoFocus
            onClick={handleCheckValues}
          >
              Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>)
}
