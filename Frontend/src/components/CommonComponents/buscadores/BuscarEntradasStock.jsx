import React, { useEffect, useState } from 'react'
import AddCircle from '@mui/icons-material/AddCircle'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { alertError, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { buscarEntradasStockDisponibles } from './buscarEntradasStockDisponibles'
import Decimal from 'decimal.js'

export const BuscarEntradasStock = ({ handleConfirm, idAlmacen, detalle }) => {
  const [dataEntradas, setDataEntradas] = useState([])
  const [sumaTotal, setSumaTotal] = useState(0.0)
  // manejador de dialog
  const [open, setOpen] = useState(false)
  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
    resetData()
  }

  // cambiar opcion de checkbox
  // const onChangeCheckbox2 = ({ target }, index) => {
  //   const checked = target.checked
  //   const parseSumaTotal = parseFloat(sumaTotal)
  //   const parseDetalleRequisicion = parseFloat(detalle.canMatPriFor)
  //   const findElementIndex = dataEntradas.findIndex((item) => item.id === index)
  //   if (findElementIndex !== -1) {
  //     const dataAux = dataEntradas.slice()
  //     const dataAuxIndex = dataAux[findElementIndex]
  //     // si el check esta marcado
  //     if (checked) {
  //       const parseCantidadRequisicion = parseFloat(dataAuxIndex.canTotDis)
  //       if (parseSumaTotal === parseDetalleRequisicion) {
  //         alertWarning('El total requerido ya fué completado')
  //       } else {
  //         const restante = parseDetalleRequisicion - parseSumaTotal
  //         if (restante > parseCantidadRequisicion) {
  //           setSumaTotal(sumaTotal + parseCantidadRequisicion)
  //           dataAuxIndex.cantidadUtilizada = parseCantidadRequisicion
  //         } else {
  //           setSumaTotal(sumaTotal + restante)
  //           dataAuxIndex.cantidadUtilizada = restante
  //         }
  //         dataAuxIndex.isSelected = true
  //         dataAux[findElementIndex] = dataAuxIndex
  //         setDataEntradas(dataAux)
  //       }
  //     } else {
  //       setSumaTotal(sumaTotal - dataAuxIndex.cantidadUtilizada)
  //       dataAuxIndex.cantidadUtilizada = 0
  //       dataAuxIndex.isSelected = false
  //       dataAux[findElementIndex] = dataAuxIndex
  //       setDataEntradas(dataAux)
  //     }
  //   }
  // }

  const onChangeCheckbox = ({ target }, index) => {
    const checked = target.checked
    const parseSumaTotal = new Decimal(sumaTotal)
    const parseDetalleRequisicion = new Decimal(detalle.canMatPriFor)
    const findElementIndex = dataEntradas.findIndex((item) => item.id === index)

    if (findElementIndex !== -1) {
      const dataAux = dataEntradas.slice()
      const dataAuxIndex = dataAux[findElementIndex]

      // Si el checkbox está marcado
      if (checked) {
        const parseCantidadRequisicion = new Decimal(dataAuxIndex.canTotDis)

        if (parseSumaTotal.equals(parseDetalleRequisicion)) {
          alertWarning('El total requerido ya fue completado')
        } else {
          const restante = parseDetalleRequisicion.minus(parseSumaTotal)

          if (restante.greaterThan(parseCantidadRequisicion)) {
            setSumaTotal(parseSumaTotal.plus(parseCantidadRequisicion).toNumber())
            dataAuxIndex.cantidadUtilizada = parseCantidadRequisicion.toNumber()
          } else {
            setSumaTotal(parseSumaTotal.plus(restante).toNumber())
            dataAuxIndex.cantidadUtilizada = restante.toNumber()
          }

          dataAuxIndex.isSelected = true
          dataAux[findElementIndex] = dataAuxIndex
          setDataEntradas(dataAux)
        }
      } else {
        setSumaTotal(parseSumaTotal.minus(dataAuxIndex.cantidadUtilizada).toNumber())
        dataAuxIndex.cantidadUtilizada = 0
        dataAuxIndex.isSelected = false
        dataAux[findElementIndex] = dataAuxIndex
        setDataEntradas(dataAux)
      }
    }
  }

  // funcion de reset values
  const resetData = () => {
    setSumaTotal(0)
    const dataReset = dataEntradas.map((element) => {
      return {
        ...element,
        isSelected: false,
        cantidadUtilizada: 0
      }
    })
    setDataEntradas(dataReset)
  }

  // funcion para guardar el detalle de salida
  const guardarDetalleTransferencia = () => {
    const parseDetalleRequisicion = parseFloat(detalle.canMatPriFor)
    if (parseDetalleRequisicion !== sumaTotal) {
      alertWarning('Asegurate de tener la cantidad requerida')
    } else {
      // devolvemos solo las entradas con cantidades diferentes a 0
      const filterEntradas = dataEntradas.filter((element) => element.cantidadUtilizada > 0)
      handleConfirm(filterEntradas, detalle.idProdt)
    }
  }

  // traer informacion de entradas de stock
  const traerInformacionEntradasStock = async () => {
    const DATA = {
      idAlmacen,
      idProducto: detalle.idProdt
    }
    const resultPeticion = await buscarEntradasStockDisponibles(DATA)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      const formatData = result.map((element) => {
        return {
          ...element,
          isSelected: false,
          cantidadUtilizada: 0
        }
      })
      setDataEntradas(formatData)
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerInformacionEntradasStock()
  }, [])

  return (
    <>
      <IconButton color="primary" onClick={handleClickOpen}>
        <AddCircle fontSize="large" />
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
              <div>
                <label className='fw-semibold form-label'>Cantidad total</label>
                <input className="form-control" type='number' value={sumaTotal} readOnly disabled/>
              </div>
            </div>
            <div className="d-flex">
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell className='fw-semibold' align='center'>Acción</TableCell>
                      <TableCell className='fw-semibold' align='left'>Código</TableCell>
                      <TableCell className='fw-semibold' align='left'>Documento</TableCell>
                      <TableCell className='fw-semibold' align='center'>Cantidad</TableCell>
                      <TableCell className='fw-semibold' align='center'>Cantidad utilizada</TableCell>
                      <TableCell className='fw-semibold' align='center'>Fecha ingreso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataEntradas.map((element) => (
                      <TableRow key={element.id}>
                        <TableCell align='center'>
                          <Checkbox
                            checked={element.isSelected}
                            inputProps={{ 'aria-label': 'controlled' }}
                            onChange={(e) => {
                              onChangeCheckbox(e, element.id)
                            }}
                          />
                        </TableCell>
                        <TableCell align='left'>{element.codEntSto}</TableCell>
                        <TableCell align='left'>{element.docEntSto}</TableCell>
                        <TableCell align='center'>{element.canTotDis}</TableCell>
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
          <Button variant='contained' color='inherit' onClick={handleClose}>Cancel</Button>
          <Button variant='contained' color='primary' onClick={guardarDetalleTransferencia}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
