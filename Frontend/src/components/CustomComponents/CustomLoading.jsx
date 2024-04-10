import { CircularProgress, Dialog, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'

export const CustomLoading = ({ open }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Cargando...</DialogTitle>
      <DialogContent>
        <DialogContentText>
              Por favor, espere mientras se procesa la solicitud.
        </DialogContentText>
        <CircularProgress />
      </DialogContent>
    </Dialog>
  )
}
