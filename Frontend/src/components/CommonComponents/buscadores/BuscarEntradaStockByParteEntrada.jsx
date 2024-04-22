import AddCircle from '@mui/icons-material/AddCircle'
import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import React, { useState } from 'react'

export const BuscarEntradaStockByParteEntrada = ({ handleConfirm }) => {
  // manejador de dialog
  const [open, setOpen] = useState(false)
  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <IconButton color="primary" onClick={handleClickOpen}>
        <AddCircle fontSize="large" />
      </IconButton>
      <Dialog open={open} onClose={handleClose} maxWidth="xs">
        <DialogTitle>
          <Typography>Búsqueda de entradas</Typography>
        </DialogTitle>
        <DialogContent>
          <div className="row">
            <div className="d-flex">

            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
