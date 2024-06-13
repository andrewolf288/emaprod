import * as React from 'react'
import iconSalidaTotal from '../../assets/icons/logo-salida-total.png'
import iconSalidaParcial from '../../assets/icons/logo-salida-parcial.png'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { TextField } from '@mui/material'
// table
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

import iconStockAlmacenes from '../../assets/icons/stock-almacenes.png'
import { getStockAlmacenes } from '../../almacen/helpers/consult-stock/getStockAlmacenes'
import { alertError } from '../../utils/alerts/alertsCustoms'

const ITEM_HEIGHT = 48
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}))

export const ComponentActionRequisicionDetalle = ({
  onUpdateDetalleRequisicion,
  onDeleteDetalleRequisicion,
  onCreateSalidaTotal,
  onCreateSalidaParcial,
  onTerminarSalidaParcial,
  detalle
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  // 1. Pendiente
  // 2. Completo
  // 3. En proceso

  return (
    <div className="btn-toolbar">
      {/* Boton de entrega total */}
      <DialogCrearSalidaTotal
        detalle={detalle}
        onCreateSalidaTotal={onCreateSalidaTotal}
        disabled={detalle.idReqDetEst !== 1}
      />
      {/* Boton de entrega parcial */}
      <DialogCrearSalidaParcial
        detalle={detalle}
        onCreateSalidaParcial={onCreateSalidaParcial}
        disabled={detalle.idReqDetEst === 2 || detalle.salMixAlm === 1}
      />
      {/* Boton de terminar entrega parcial */}
      <DialogTerminarSalidaParcial
        detalle={detalle}
        onTerminarSalidaParcial={onTerminarSalidaParcial}
        disabled={
          detalle.idReqDetEst === 2 ||
          detalle.salParc.length === 0 ||
          detalle.salMixAlm === 1
        }
      />
      {/* Boton para consultar stock */}
      <DialogConsultarStock
        detalle={detalle}
      />
      {/* Menu options de otras opciones */}
      <div>
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? 'long-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          MenuListProps={{
            'aria-labelledby': 'long-button'
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: '20ch'
            }
          }}
        >
          {/* Menu de actualizar requisicion */}
          <MenuUpdateRequisicionDetalle
            detalle={detalle}
            onUpdateDetalleRequisicion={onUpdateDetalleRequisicion}
            option={'Editar'}
            disabled={detalle.idReqDetEst === 2}
            onCloseMenu={handleClose}
          />
          {/* Menu de eliminar requisicion */}
          <MenuDeleteRequisicionDetalle
            detalle={detalle}
            onDeleteDetalleRequisicion={onDeleteDetalleRequisicion}
            option={'Eliminar'}
            disabled={detalle.idReqDetEst === 2}
            onCloseMenu={handleClose}
          />
          {/* Menu de ver salidas parciales */}
          <MenuSalidasParcialesRequisicionDetalle
            detalle={detalle}
            option={'Ver salidas'}
            disabled={detalle.salParc.length === 0}
            onCloseMenu={handleClose}
          />
        </Menu>
      </div>
    </div>
  )
}

// componente de salida total
const DialogCrearSalidaTotal = ({ detalle, onCreateSalidaTotal, disabled }) => {
  const [open, setOpen] = React.useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <button
        className="btn btn-warning me-2"
        title="Salida total"
        onClick={handleClickOpen}
        disabled={disabled}
      >
        <img src={iconSalidaTotal} height={20} width={20} />
      </button>
      <DialogConfirmSalidaTotal
        open={open}
        handleClose={handleClose}
        itemSalida={detalle}
        onCreateSalidaTotal={onCreateSalidaTotal}
      />
    </div>
  )
}

// dialogo de confirmacion de salida de diferentes almacenes
const DialogConfirmSalidaTotal = ({
  itemSalida,
  handleClose,
  open,
  onCreateSalidaTotal
}) => {
  const { salMixAlm, canReqDet } = itemSalida
  const [detalleSalidaAlmacen, setdetalleSalidaAlmacen] = React.useState([
    {
      idAlm: 1,
      nomAlm: 'Almacen principal',
      canSalAlm: 0,
      porIngAlm: 0
    },
    {
      idAlm: 8,
      nomAlm: 'Almacen auxiliar',
      canSalAlm: 0,
      porIngAlm: 0
    }
  ])
  const [cantidadActual, setCantidadActual] = React.useState(0)

  const handleChangeInputCantidadValue = (idAlm, { target }) => {
    const { value } = target
    const newData = detalleSalidaAlmacen.map((element) => {
      if (element.idAlm === idAlm) {
        return {
          ...element,
          canSalAlm: parseInt(value)
        }
      } else {
        return element
      }
    })
    setdetalleSalidaAlmacen(newData)
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
    const cantidadRequerida = parseInt(canReqDet)
    const cantidadAlmacen = Math.round((cantidadRequerida * porcentaje) / 100)
    const porcentajeOtro = 100 - porcentaje
    const cantidadAlmacenOtro = Math.round(
      (cantidadRequerida * porcentajeOtro) / 100
    )

    const newData = detalleSalidaAlmacen.map((element) => {
      if (element.idAlm === idAlm) {
        return {
          ...element,
          canSalAlm: cantidadAlmacen,
          porIngAlm: value
        }
      } else {
        return {
          ...element,
          canSalAlm: cantidadAlmacenOtro,
          porIngAlm: porcentajeOtro
        }
      }
    })

    setdetalleSalidaAlmacen(newData)
  }

  const enviardetalleSalidaAlmacenes = () => {
    if (parseInt(canReqDet) === cantidadActual) {
      // filtramos aquellos en los que no se realizo ingreso
      const filterIngresos = detalleSalidaAlmacen.filter(
        (element) => element.canSalAlm !== 0
      )
      // lo mantenemos en una variable
      const formatDetalleSalidaAlmacen = [...filterIngresos]
      // ordenamos
      formatDetalleSalidaAlmacen.sort((a, b) => {
        // Mueve el objeto con idAlm=8 al principio del arreglo
        if (a.idAlm === 8) return -1
        if (b.idAlm === 8) return 1

        // Si ninguno tiene idAlm=8, no cambia el orden entre ellos
        return 0
      })
      // format data
      const formatData = {
        ...itemSalida,
        detalleSalidaAlmacen: formatDetalleSalidaAlmacen
      }
      // realizamos la salida total
      onCreateSalidaTotal(formatData)
    } else {
      alert('Asegurate de completar la cantidad ingresada')
    }
  }

  React.useEffect(() => {
    let cantidad = 0
    detalleSalidaAlmacen.forEach((element) => {
      cantidad += isNaN(element.canSalAlm)
        ? 0
        : parseInt(element.canSalAlm)
    })
    setCantidadActual(cantidad)
  }, [detalleSalidaAlmacen])

  return (
    <>
      {salMixAlm === 1
        ? (
          <BootstrapDialog
            maxWidth={'lg'}
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Salida de requisicion
            </DialogTitle>
            <DialogContent dividers>
              <p
                className={`${
                  parseInt(canReqDet) === cantidadActual
                    ? 'text-success'
                    : 'text-danger'
                }`}
              >{`Cantidad: ${parseInt(canReqDet)}/${cantidadActual}`}</p>
              {detalleSalidaAlmacen.map((element, index) => (
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
                        value={element.canSalAlm}
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
                  enviardetalleSalidaAlmacenes()
                }}
              >
              Aceptar
              </Button>
            </DialogActions>
          </BootstrapDialog>
        )
        : (
          <BootstrapDialog
            maxWidth={'l'}
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Salida total
            </DialogTitle>
            <DialogContent dividers>
              <b className="me-2 d-block">Producto:</b>
              {itemSalida.nomProd}
              <b className="me-2 d-block mt-2">Total requisicion:</b>
              {itemSalida.canReqDet}
              <span className="ms-2">{itemSalida.simMed}</span>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={handleClose}>
              Cerrar
              </Button>
              <Button
                color="error"
                autoFocus
                onClick={() => {
                // format data
                  const formatData = {
                    ...itemSalida,
                    detalleSalidaAlmacen: [
                      {
                        idAlm: 1,
                        canSalAlm: parseFloat(canReqDet),
                        nomAlm: 'Almacen principal'
                      }
                    ]
                  }
                  // terminamos de procesar la salida total
                  onCreateSalidaTotal(formatData)
                  // cerramos el cuadro de dialogo emergente
                  handleClose()
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

// componente de salida parcial
const DialogCrearSalidaParcial = ({
  detalle,
  onCreateSalidaParcial,
  disabled
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

  React.useEffect(() => {
    const canProgSalPar =
      detalle.canProgSalPar !== undefined
        ? parseFloat(detalle.canProgSalPar).toFixed(3)
        : 0.0
    setinputValue(canProgSalPar)
  }, [detalle])

  return (
    <div>
      <button
        className="btn btn-primary me-2"
        title="Salida Parcial"
        onClick={handleClickOpen}
        disabled={disabled}
      >
        <img src={iconSalidaParcial} height={20} width={20} />
      </button>
      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Salida parcial
        </DialogTitle>
        <DialogContent dividers>
          <b className="fw-bolder text-danger d-block mb-2">
            Ingresa la cantidad de la salida parcial
          </b>
          <b className="me-2 d-block">Producto:</b>
          {detalle.nomProd}
          <b className="me-2 d-block mt-2">Total requisicion:</b>
          {detalle.canReqDet}
          <span className="ms-2">{detalle.simMed}</span>
          <b className="me-2 d-block mt-2">Total salidas:</b>
          {detalle.canTotSalParc}
          <span className="ms-2">{detalle.simMed}</span>
          <b className="me-2 d-block mt-2">Cantidad salida</b>
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
              // terminamos de procesar la salida parcial
              onCreateSalidaParcial(detalle, inputValue)
              // cerramos el cuadro de dialogo
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

// componente de terminar salida parcial
const DialogTerminarSalidaParcial = ({
  detalle,
  onTerminarSalidaParcial,
  disabled
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
      <button
        className="btn btn-success me-2"
        title="Salida total"
        onClick={handleClickOpen}
        disabled={disabled}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="bi bi-clipboard2-check-fill"
          viewBox="0 0 16 16"
        >
          <path d="M10 .5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5.5.5 0 0 1-.5.5.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5h5A.5.5 0 0 0 11 2v-.5a.5.5 0 0 0-.5-.5.5.5 0 0 1-.5-.5Z" />
          <path d="M4.085 1H3.5A1.5 1.5 0 0 0 2 2.5v12A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 12.5 1h-.585c.055.156.085.325.085.5V2a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 2v-.5c0-.175.03-.344.085-.5Zm6.769 6.854-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708.708Z" />
        </svg>
      </button>
      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Terminar Salida Parcial
        </DialogTitle>
        <DialogContent dividers>
          <b className="me-2 d-block">Producto:</b>
          {detalle.nomProd}
          <b className="me-2 d-block mt-2">Total salidas:</b>
          {detalle.canTotSalParc}
          <span className="ms-2">{detalle.simMed}</span>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            color="error"
            autoFocus
            onClick={() => {
              // terminamos de procesar el termino de la salida parcial
              onTerminarSalidaParcial(detalle)
              // cerramos el cuadro de dialogo
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

// Dialogo de consulta de stock
const DialogConsultarStock = ({ detalle }) => {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [stockAlmacen, setStockAlmacen] = React.useState({
    almacenPrincipal: null,
    almacenAuxiliar: null
  })
  const { almacenPrincipal, almacenAuxiliar } = stockAlmacen

  const handleClickOpen = async () => {
    setLoading(true)
    // hacemos una consulta de stock
    const resultPeticion = await getStockAlmacenes(detalle.idProdt)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setStockAlmacen({
        almacenAuxiliar: result.auxiliar[0],
        almacenPrincipal: result.principal[0]
      })
      setOpen(true)
    } else {
      alertError(description_error)
    }
    setLoading(false)
  }
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <button
        className="btn btn-secondary me-2"
        title="Stock almacenes"
        onClick={handleClickOpen}
      >
        <img
          alt="boton stock almacenes"
          src={iconStockAlmacenes}
          height={25}
          width={25}
        />
      </button>
      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Stock almacenes
        </DialogTitle>
        {loading
          ? <DialogContent dividers>Cargando ...</DialogContent>
          : <DialogContent dividers>
            <p className='d-flex flex-row'>
              <strong className='me-2'>Almacen principal:</strong>
              <span>{almacenPrincipal !== null ? `${almacenPrincipal} ${detalle.simMed}` : 'Sin datos'}</span>
            </p>
            <p className='d-flex flex-row'>
              <strong className='me-2'>Almacen auxiliar:</strong>
              <span>{almacenAuxiliar !== null ? `${almacenAuxiliar} ${detalle.simMed}` : 'Sin datos'}</span>
            </p>
          </DialogContent>}
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  )
}

// Menu editar requisicion detalle
const MenuUpdateRequisicionDetalle = ({
  detalle,
  option,
  onUpdateDetalleRequisicion,
  disabled,
  onCloseMenu
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
      <MenuItem key={option} onClick={handleClickOpen} disabled={disabled}>
        {option}
      </MenuItem>
      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Actualizar requisicion detalle
        </DialogTitle>
        <DialogContent dividers>
          <b className="fw-bolder text-danger d-block mb-2">
            Ingresa la cantidad actualizada
          </b>
          <b className="me-2 d-block">Producto:</b>
          {detalle.nomProd}
          <b className="me-2 d-block mt-2">Total requisicion:</b>
          {detalle.canReqDet}
          <span className="ms-2">{detalle.simMed}</span>
          <b className="me-2 d-block mt-2">Cantidad nueva</b>
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
              // procesamos la actualizacion de detalle de requisicion
              onUpdateDetalleRequisicion(detalle, inputValue)
              // cerramos el cuadro de dialogo
              handleClose()
              // cerramos el menu desplegable
              onCloseMenu()
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  )
}

// Menu eliminar requisicion detalle
const MenuDeleteRequisicionDetalle = ({
  detalle,
  option,
  onDeleteDetalleRequisicion,
  disabled,
  onCloseMenu
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
      <MenuItem key={option} onClick={handleClickOpen} disabled={disabled}>
        {option}
      </MenuItem>
      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Eliminar Requisicion Detalle
        </DialogTitle>
        <DialogContent dividers>
          <b className="me-2 d-block">Producto: </b>
          {detalle.nomProd}
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            color="error"
            autoFocus
            onClick={() => {
              // procesamos la eliminacion del detalle de la requisicion
              onDeleteDetalleRequisicion(detalle)
              // cerramos el cuadro de dialogo
              handleClose()
              // cerramos el menu desplegable
              onCloseMenu()
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  )
}

// Menu ver salidas parciales
const MenuSalidasParcialesRequisicionDetalle = ({
  detalle,
  option,
  disabled,
  onCloseMenu
}) => {
  const [open, setOpen] = React.useState(false)
  const { salParc } = detalle

  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
    onCloseMenu()
  }

  return (
    <div>
      <MenuItem key={option} onClick={handleClickOpen} disabled={disabled}>
        {option}
      </MenuItem>

      <BootstrapDialog
        maxWidth={'lg'}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Detalle salidas parciales
        </DialogTitle>

        <DialogContent dividers>
          <TableSalidasParciales salidasParciales={salParc} detalle={detalle} />
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

const TableSalidasParciales = ({ salidasParciales, detalle }) => {
  console.log(salidasParciales)
  const { nomProd, simMed } = detalle

  // Creamos un objeto donde almacenaremos los datos agrupados
  const resultado = salidasParciales.reduce((acumulador, elemento) => {
    // Verificamos si ya hay un grupo con la misma fecha
    if (acumulador[elemento.fecSalStoReq]) {
      // Si existe, sumamos la cantidad y aumentamos el contador
      acumulador[elemento.fecSalStoReq].canSalStoReq += parseFloat(
        elemento.canSalStoReq
      )
      acumulador[elemento.fecSalStoReq].ocurrencias += 1
    } else {
      // Si no existe, creamos un nuevo grupo
      acumulador[elemento.fecSalStoReq] = {
        canSalStoReq: parseFloat(elemento.canSalStoReq),
        ocurrencias: 1,
        fecSalStoReq: elemento.fecSalStoReq
      }
    }
    return acumulador
  }, {})

  // Convertimos el objeto de resultado en un arreglo nuevamente
  const resultadoFinal = Object.values(resultado)

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="center">
              <b>#</b>
            </TableCell>
            <TableCell align="left">
              <b>Producto</b>
            </TableCell>
            <TableCell align="left">
              <b>U.M</b>
            </TableCell>
            <TableCell align="right">
              <b>Can. salidas</b>
            </TableCell>
            <TableCell align="right">
              <b>Nro. salidas</b>
            </TableCell>
            <TableCell align="right">
              <b>Fecha salida</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {resultadoFinal.map((salida, index) => (
            <TableRow
              key={index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="center">{index + 1}</TableCell>
              <TableCell align="left">{nomProd}</TableCell>
              <TableCell align="left">{simMed}</TableCell>
              <TableCell align="center">
                {parseFloat(salida.canSalStoReq).toFixed(2)}
              </TableCell>
              <TableCell align="center">{salida.ocurrencias}</TableCell>
              <TableCell align="right">{salida.fecSalStoReq}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
