import * as React from 'react'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TableRowsIcon from '@mui/icons-material/TableRows'
import Tooltip from '@mui/material/Tooltip'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}))

export function DetalleSalidas ({ row, idProduccion }) {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Tooltip title="Salidas produccion">
        <IconButton onClick={handleClickOpen}>
          <TableRowsIcon fontSize="medium" sx={{ color: 'white' }} />
        </IconButton>
      </Tooltip>
      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Detalle salidas producción
        </DialogTitle>

        <DialogContent dividers>
          <TableEntradas2 row={row} idProdt={row.idProdt} />
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

function TableEntradas2 ({ row, idProdt }) {
  const [entrada, setEntrada] = React.useState([])

  React.useEffect(() => {
    let totalCantidadDev = 0
    row.devoluciones.forEach((obj) => {
      totalCantidadDev = totalCantidadDev + parseFloat(obj.canProdDevTra)
    })

    row.devoluciones.forEach((obj) => {
      obj.canTotDis = parseFloat(totalCantidadDev) - parseFloat(row.canTotDis)
    })

    let total = 0
    row.devoluciones.forEach((obj) => {
      console.log(obj)
      total = total + parseFloat(obj.canProdDevTra)
      obj.acumulado = total
    })
    setEntrada(row)
  }, [row, idProdt])

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Numero OP</TableCell>
            <TableCell align="left">nombre</TableCell>
            {/**
            <TableCell align="left">Cant. Disponible</TableCell>

             */}
            <TableCell align="left">Salida</TableCell>
            <TableCell align="right">Fecha</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entrada.salidasProduccion?.map((item, index) => (
            <TableRow
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="left">{item.numop}</TableCell>
              <TableCell align="left">{item.nomProd}</TableCell>
              {/**
                <TableCell align="left">
                {parseFloat(item.acumulado) - parseFloat(item.canTotDis)}
              </TableCell>
               */}
              <TableCell align="left">{item.canSalStoReq}</TableCell>
              <TableCell align="right">{item.fecSalStoReq}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
