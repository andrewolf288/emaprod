import React, { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'

export const ViewDetalleEntradasStock = ({ dataEntradas, detalle }) => {
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
        <RemoveRedEyeIcon fontSize="large" />
      </IconButton>
      <Dialog open={open} onClose={handleClose} maxWidth={'lg8u7y'}>
        <DialogTitle>
          <Typography>Búsqueda de entradas</Typography>
        </DialogTitle>
        <DialogContent>
          <div className="row">
            <div className='d-flex mb-4'>
              <div className='me-4'>
                <label className='fw-semibold form-label'>Cantidad requerida</label>
                <input className="form-control" type="number" value={detalle.canMatPriFor} readOnly disabled/>
              </div>
            </div>
            <div className="d-flex">
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell className='fw-semibold' align='left'>Código</TableCell>
                      <TableCell className='fw-semibold' align='left'>Documento</TableCell>
                      <TableCell className='fw-semibold' align='center'>Cantidad utilizada</TableCell>
                      <TableCell className='fw-semibold' align='center'>Fecha ingreso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataEntradas.map((element) => (
                      <TableRow key={element.id}>
                        <TableCell align='left'>{element.codEntSto}</TableCell>
                        <TableCell align='left'>{element.docEntSto}</TableCell>
                        <TableCell align='center'>{element.cantidadUtilizada}</TableCell>
                        <TableCell align='center'>{element.fecEntSto}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='inherit' onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
