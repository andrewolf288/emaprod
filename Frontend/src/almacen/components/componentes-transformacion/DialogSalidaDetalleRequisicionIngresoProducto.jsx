import React, { useEffect, useState } from 'react'
import { Button, IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}))

export const DialogSalidaDetalleRequisicionIngresoProducto = ({
  itemSalida,
  onCheckItemSalida
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
      <IconButton
        aria-label="delete"
        size="large"
        color="success"
        onClick={handleClickOpen}
        disabled={itemSalida.esComProdIng === 1}
      >
        <CheckCircleRoundedIcon fontSize="inherit" />
      </IconButton>
      <DialogConfirmacion
        itemSalida={itemSalida}
        onCheckItemSalida={onCheckItemSalida}
        handleClose={handleClose}
        open={open}
      />
    </div>
  )
}

const DialogConfirmacion = ({
  itemSalida,
  onCheckItemSalida,
  handleClose,
  open
}) => {
  const { entMixAlm, canProdIng } = itemSalida
  const [detalleEntradaAlmacen, setDetalleEntradaAlmacen] = useState([
    {
      idAlm: 1,
      nomAlm: 'Almacen principal',
      canIngAlm: 0,
      porIngAlm: 0
    },
    {
      idAlm: 8,
      nomAlm: 'Almacen auxiliar',
      canIngAlm: 0,
      porIngAlm: 0
    }
  ])
  const [cantidadActual, setCantidadActual] = useState(0)

  const handleChangeInputCantidadValue = (idAlm, { target }) => {
    const { value } = target
    const newData = detalleEntradaAlmacen.map((element) => {
      if (element.idAlm === idAlm) {
        return {
          ...element,
          canIngAlm: parseInt(value)
        }
      } else {
        return element
      }
    })
    setDetalleEntradaAlmacen(newData)
  }

  const handleChangeInputPorcentaje = (idAlm, { target }) => {
    const { value } = target
    let porcentaje = isNaN(parseInt(value)) ? 0 : parseInt(value)
    if (porcentaje < 0) {
      porcentaje = 0
    }
    if (porcentaje > 100) {
      porcentaje = 100
    }
    const cantidadRequerida = parseInt(canProdIng)
    const cantidadAlmacen = Math.round((cantidadRequerida * porcentaje) / 100)
    const porcentajeOtro = 100 - porcentaje
    const cantidadAlmacenOtro = Math.round(
      (cantidadRequerida * porcentajeOtro) / 100
    )

    const newData = detalleEntradaAlmacen.map((element) => {
      if (element.idAlm === idAlm) {
        return {
          ...element,
          canIngAlm: cantidadAlmacen,
          porIngAlm: value
        }
      } else {
        return {
          ...element,
          canIngAlm: cantidadAlmacenOtro,
          porIngAlm: porcentajeOtro
        }
      }
    })

    setDetalleEntradaAlmacen(newData)
  }

  const enviarDetalleEntradaAlmacenes = () => {
    if (parseInt(canProdIng) === cantidadActual) {
      const filterIngresos = detalleEntradaAlmacen.filter(
        (element) => element.canIngAlm !== 0
      )
      const formatData = {
        ...itemSalida,
        detalleEntradaAlmacen: filterIngresos
      }
      onCheckItemSalida(formatData)
    } else {
      alert('Asegurate de completar la cantidad ingresada')
    }
  }

  useEffect(() => {
    let cantidad = 0
    detalleEntradaAlmacen.forEach((element) => {
      cantidad += isNaN(element.canIngAlm)
        ? 0
        : parseInt(element.canIngAlm)
    })
    setCantidadActual(cantidad)
  }, [detalleEntradaAlmacen])

  return (
    <>
      {entMixAlm === 1
        ? (
          <BootstrapDialog
            maxWidth={'lg'}
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Ingreso de producto final
            </DialogTitle>
            <DialogContent dividers>
              <p
                className={`${
                  parseInt(canProdIng) === cantidadActual
                    ? 'text-success'
                    : 'text-danger'
                }`}
              >{`Cantidad: ${parseInt(canProdIng)}/${cantidadActual}`}</p>
              {detalleEntradaAlmacen.map((element, index) => (
                <div className="container mb-2" key={index}>
                  <div className="col-auto">
                    <p className="font-weight-bold fs-6">{element.nomAlm}</p>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-auto d-flex align-items-center">
                      <input
                        type="number"
                        value={element.porIngAlm}
                        className="form-control form-control-sm"
                        style={{ width: 70, backgroundColor: '#f5f4f0' }}
                        onChange={(e) => {
                          handleChangeInputPorcentaje(element.idAlm, e)
                        }}
                      />
                      <span className="mx-1" style={{ fontSize: 15 }}>
                      %
                      </span>
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <input
                        type="number"
                        value={element.canIngAlm}
                        className="form-control form-control-sm"
                        style={{ width: 100, backgroundColor: '#f5f4f0' }}
                        onChange={(e) => {
                          handleChangeInputCantidadValue(element.idAlm, e)
                        }}
                      />
                      <span className="mx-1" style={{ fontSize: 10 }}>
                      UND
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
                  enviarDetalleEntradaAlmacenes()
                }}
              >
              Aceptar
              </Button>
            </DialogActions>
          </BootstrapDialog>
        )
        : (
          <BootstrapDialog
            maxWidth={'lg'}
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Ingreso de producto final
            </DialogTitle>
            <DialogContent dividers>
              <b className="fw-bolder text-danger d-block mb-2">
              ¿Desea relizar este ingreso al almacen principal?
              </b>
              <p>{`Cantidad: ${parseInt(canProdIng)}`}</p>
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
                  const formatData = {
                    ...itemSalida,
                    detalleEntradaAlmacen: [
                      {
                        idAlm: 1,
                        canIngAlm: parseInt(canProdIng)
                      }
                    ]
                  }
                  onCheckItemSalida(formatData)
                }}
              >
              Aceptar
              </Button>
            </DialogActions>
          </BootstrapDialog>
        )}
    </>
  )
}
