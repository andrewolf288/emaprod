import * as React from 'react'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}))

export function DetalleProductosFinalesV2 ({ detalleProductoFinal }) {
  const [open, setOpen] = React.useState(false)
  const { entradas_parciales } = detalleProductoFinal

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <IconButton
        aria-label="delete"
        size="large"
        onClick={handleClickOpen}
        color="primary"
      >
        <VisibilityIcon fontSize="inherit" />
      </IconButton>

      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Detalle productos finales
        </DialogTitle>

        <DialogContent dividers>
          <TableProductoProduccion productoFinal={detalleProductoFinal} />
          <TableEntradas entradas={entradas_parciales} />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  )
}

// detalle del producto final programado
function TableProductoProduccion ({ productoFinal }) {
  return (
    <TableContainer component={Paper}>
      <br />
      <Typography gutterBottom>
        <b>Producto programado</b>
      </Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <b>Cod Aso.</b>
            </TableCell>
            <TableCell align="left">
              <b>Codigo</b>
            </TableCell>
            <TableCell align="left">
              <b>Descripción</b>
            </TableCell>
            <TableCell align="left">
              <b>U.M</b>
            </TableCell>
            <TableCell align="right">
              <b>Programado</b>
            </TableCell>
            <TableCell align="right">
              <b>Ingresado</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell align="center">{productoFinal.id}</TableCell>
            <TableCell align="left">{productoFinal.codProd2}</TableCell>
            <TableCell align="left">{productoFinal.nomProd}</TableCell>
            <TableCell align="left">{productoFinal.simMed}</TableCell>
            <TableCell align="right">
              {parseInt(productoFinal.canTotProgProdFin)}
            </TableCell>
            <TableCell align="right">
              {productoFinal.cantidad_ingresada}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// detalle de tabla de entradas
function TableEntradas ({ entradas }) {
  return (
    <TableContainer component={Paper}>
      <br />
      <Typography gutterBottom>
        <b>Entradas</b>
      </Typography>
      <br />
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="right">#</TableCell>
            <TableCell align="left">
              <b>Producto</b>
            </TableCell>
            <TableCell align="left">
              <b>Ingresado</b>
            </TableCell>
            <TableCell align="left">
              <b>Fecha ingreso</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entradas.map((entrada, index) => (
            <TableRow
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {index + 1}
              </TableCell>
              <TableCell align="left">{entrada.nomProd}</TableCell>
              <TableCell align="left">{parseInt(entrada.canProdIng)}</TableCell>
              <TableCell align="left">{entrada.fecProdIng}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
