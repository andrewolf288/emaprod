import * as React from 'react'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { TextField } from '@mui/material'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}))

export const DialogUpdateDetalleRequisicionDevolucion = ({
  itemUpdate,
  onUpdateItemSelected
}) => {
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
      <IconButton
        aria-label="delete"
        size="large"
        onClick={handleClickOpen}
        color="warning"
        disabled={itemUpdate.esComReqDevDet === 1}
      >
        <EditRoundedIcon fontSize="inherit" />
      </IconButton>
      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Actualizar detalle requisicion agregacion
        </DialogTitle>
        <DialogContent dividers>
          <b className="fw-bolder text-danger d-block mb-2">
            ¿Quieres actualizar este detalle?
          </b>
          <b className="me-2 d-block">Producto:</b>
          {itemUpdate.nomProd}
          <b className="me-2 d-block mt-2">Cantidad:</b>
          {itemUpdate.canReqDevDet}
          <span className="ms-2">{itemUpdate.simMed}</span>
          <b className="me-2 d-block mt-2">Nueva cantidad</b>
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
              handleClose()
              onUpdateItemSelected(itemUpdate, inputValue)
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  )
}
