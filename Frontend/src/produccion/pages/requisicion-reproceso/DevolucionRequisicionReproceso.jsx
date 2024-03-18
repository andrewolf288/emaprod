import React, { useEffect, useState } from 'react'
import { getDevolucionOperacionDevolucionCalidadDetalleById } from '../../helpers/requisicion-reproceso/getDevolucionOperacionDevolucionCalidadDetalleById'
import { useParams } from 'react-router-dom'
import { Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { RowDevolucionLoteProduccionEdit } from '../../../almacen/pages/devoluciones/RowDevolucionLoteProduccionEdit'
import { getFormulaProductoDetalleByProducto } from '../../helpers/formula_producto/getFormulaProductoDetalleByProducto'
import MuiAlert from '@mui/material/Alert'
import { createDevolucionOperacionDevolucionCalidadDetalle } from '../../helpers/requisicion-reproceso/createDevolucionOperacionDevolucionCalidadDetalle'
import { RowDetalleDevolucionLoteProduccion } from '../../../almacen/components/componentes-devoluciones/RowDetalleDevolucionLoteProduccion'
import { createRoot } from 'react-dom/client'
import { PDFDevoluciones } from '../../../almacen/components/componentes-devoluciones/PDFDevoluciones'

// para parsear las cantidades de las devoluciones
function parseIntCantidad (str, property) {
  str.canReqProdLot = parseFloat(str.canReqProdLot).toFixed(2)
  const index = str.canReqProdLot.toString().indexOf('.')
  const result = str.canReqProdLot.toString().substring(index + 1)
  const val =
    parseInt(result) >= 1 && str.simMed !== 'KGM'
      ? Math.trunc(str.canReqProdLot) + 1
      : str.canReqProdLot
  return val
}

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

export const DevolucionRequisicionReproceso = () => {
  const { idOpeDevCalDet } = useParams()
  // ESTADO PARA CONTROLAR EL FEEDBACK
  const [feedbackCreate, setfeedbackCreate] = useState(false)
  const [feedbackMessages, setfeedbackMessages] = useState({
    style_message: '',
    feedback_description_error: ''
  })
  const { style_message, feedback_description_error } = feedbackMessages

  // MANEJADORES DE FEEDBACK
  const handleClickFeeback = () => {
    setfeedbackCreate(true)
  }

  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setfeedbackCreate(false)
  }

  const [devolucionOperacionDevolucionCalidadDetalle, setDevolucionOperacionDevolucionDetalle] = useState(
    {
      nomProd: '',
      idProdc: 0,
      codLotProd: '',
      canLotProd: 0,
      fecVenLotProd: '',
      fueComOpeRep: 0,
      fecCreOpeDevCalDet: '',
      reqDev: []
    }
  )

  const {
    nomProd,
    codLotProd,
    fecVenLotProd,
    fueComOpeRep,
    canLotProd,
    reqDev,
    fecCreOpeDevCalDet
  } = devolucionOperacionDevolucionCalidadDetalle

  const [requisicionDevolucionReproceso, setRequisicionDevolucionReproceso] = useState(
    {
      idProdt: 0,
      canDevUnd: 0,
      detDev: []
    }
  )

  const handleChangeInputProductoDevuelto = (
    { target },
    detalle,
    indexProd
  ) => {
    const { value } = target
    // Crear una copia del arreglo de detalles
    const editFormDetalle = requisicionDevolucionReproceso.detDev.map(
      (element) => {
        // Si el idProdt coincide con el detalle proporcionado, actualiza los motivos
        if (detalle.idProd === element.idProd) {
          // Crear una copia del arreglo de motivos
          const nuevosMotivos = [...element.motivos]

          // Si el índice coincide con el índice proporcionado, actualiza canProdDev
          if (nuevosMotivos[indexProd]) {
            nuevosMotivos[indexProd].canProdDev = value
          }

          // Actualiza los motivos en el detalle
          element.motivos = nuevosMotivos
        }

        return element
      }
    )

    setRequisicionDevolucionReproceso({
      ...requisicionDevolucionReproceso,
      detDev: editFormDetalle
    })
  }

  const obtenerAcumulado = (requisicion) => {
    const { detReqDev } = requisicion
    // esta variable guardara los totales: {idProdt: cantidad, idProdt: cantidad}
    const totales = {}
    // esta variable guardara los repetidos: {idProdt: {item}, idProdt: {item}}
    const repetidos = {}

    // recorremos el detalle de requisicion
    detReqDev.forEach((item) => {
      // obtenemos id y cantidad
      const { idProdt, canReqDevDet } = item
      // si aun no existe en totales, lo agregamos
      if (!totales[idProdt]) {
        totales[idProdt] = 0
      } else {
        // caso contrario chancamos repetios[idProdt] cada vez que se repita
        repetidos[idProdt] = { ...item }
      }

      // sumamos el total en totales[idProdt]
      totales[idProdt] += parseFloat(canReqDevDet)
      // añadimos la propiedad acu (acumulado parcial) al item
      item.acu = totales[idProdt]
    })

    // aqui obtenemos todos los repetidos y le establecemos el acumulado final
    const totalesFinales = Object.keys(repetidos).map((item) => {
      return {
        ...repetidos[item],
        acu: totales[item]
      }
    })
    return totalesFinales
  }

  // funcion para mostrar pdf
  const generatePDF = (data, index) => {
    const acumulado = obtenerAcumulado(data)
    const formatData = {
      produccion: devolucionOperacionDevolucionCalidadDetalle,
      requisicion: data,
      acumulado
    }
    const newWindow = window.open('', 'Devoluciones', 'fullscreen=yes')
    // Crear un contenedor específico para tu aplicación
    const appContainer = newWindow.document.createElement('div')
    newWindow.document.body.appendChild(appContainer)
    const root = createRoot(appContainer)
    root.render(<PDFDevoluciones data={formatData} index={index} />)
  }

  // Manejador de eliminacion de un detalle de devolucion
  const handleDeleteProductoDevuelto = (idItem) => {
    const dataDetalleProductosDevueltos =
      requisicionDevolucionReproceso.detDev.filter((element) => {
        if (element.idProd !== idItem) {
          return true
        } else {
          return false
        }
      })

    setRequisicionDevolucionReproceso({
      ...requisicionDevolucionReproceso,
      detDev: dataDetalleProductosDevueltos
    })
  }

  const traerDevolucionesOperacionDevolucionCalidadDetalle = async () => {
    const resultPeticion = await getDevolucionOperacionDevolucionCalidadDetalleById(idOpeDevCalDet)
    console.log(resultPeticion)
    const { message_error, description_error, result } = resultPeticion

    // Primero verificamos si no ocurrio ningun error
    if (message_error.length === 0) {
      setDevolucionOperacionDevolucionDetalle(result)
      const idProdt = result.idProdt
      const canLotProd = result.canLotProd
      // luego debemos traer la informacion de formula por producto
      const resultPeticionFormula = await getFormulaProductoDetalleByProducto(idProdt)
      const {
        message_error: message_error_formula,
        description_error: description_error_formula,
        result: resultFormula
      } = resultPeticionFormula
      // Verificamos si no hubo error al consultar la formula
      if (message_error_formula.length === 0) {
        const detalleRequisicionDevolucion = []

        resultFormula[0].reqDet.forEach((detalle) => {
          if (detalle.idAre === 5 || detalle.idAre === 6) {
            const cantidadRequisicionDevuelta = parseFloat(
              detalle.canForProDet * canLotProd
            ).toFixed(5)
            detalleRequisicionDevolucion.push({
              ...detalle,
              canReqProdLot: cantidadRequisicionDevuelta
            })
          }
        })

        // colocar motivos de devolucion
        const detalleRequisicionMotivos = detalleRequisicionDevolucion.map(
          (obj) => {
            const cantidadParser = parseIntCantidad(obj)
            return {
              ...obj,
              canReqProdLot: cantidadParser,
              motivos: [
                {
                  idProdDevMot: 2,
                  nomDevMot: 'Desmedro',
                  canProdDev: 0
                },
                {
                  idProdDevMot: 6,
                  nomDevMot: 'Reproceso',
                  canProdDev: cantidadParser
                }
              ]
            }
          }
        )

        setRequisicionDevolucionReproceso({
          idProdt,
          detDev: detalleRequisicionMotivos,
          canDevUnd: canLotProd
        })
      } else {
        alert(description_error_formula)
      }
    } else {
      alert(description_error)
    }
  }

  // handle crear devolucion operacion reproceso
  const handleCrearDevolucionOperacionDevolucion = async () => {
    // eliminar requisiciones en cero de devoluciones
    const detDevParser = []
    requisicionDevolucionReproceso.detDev.forEach((element) => {
      element.motivos.forEach((motivo) => {
        const canProdDevMot = parseFloat(motivo.canProdDev)
        const idMotivo = motivo.idProdDevMot
        if (!isNaN(canProdDevMot) && canProdDevMot !== 0) {
          const nuevoObjeto = {
            ...element,
            canProdDev: canProdDevMot,
            idProdDevMot: idMotivo
          }
          delete nuevoObjeto.motivos
          detDevParser.push(nuevoObjeto)
        }
      })
    })

    const requisicionDevolucionReprocesoParser = {
      ...requisicionDevolucionReproceso,
      detDev: detDevParser
    }

    if (detDevParser.length !== 0) {
      const formatData = {
        ordenReproceso: devolucionOperacionDevolucionCalidadDetalle,
        requisicionDevolucion: requisicionDevolucionReprocesoParser
      }
      const resultPeticion = await createDevolucionOperacionDevolucionCalidadDetalle(formatData)
      const { message_error, description_error } = resultPeticion
      if (message_error.length === 0) {
        // mostramos el mensaje de advertencia
        setfeedbackMessages({
          style_message: 'success',
          feedback_description_error: 'Se realizó con éxito la operación'
        })
        handleClickFeeback()
        setTimeout(() => {
          window.close()
        }, 1000)
      } else {
        // mostramos el mensaje de advertencia
        setfeedbackMessages({
          style_message: 'error',
          feedback_description_error: description_error
        })
        handleClickFeeback()
      }
    } else {
      const handleErrors = 'El detalle de requisicion esta vacio'
      // mostramos el mensaje de advertencia
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: handleErrors
      })
      handleClickFeeback()
    }
  }

  useEffect(() => {
    traerDevolucionesOperacionDevolucionCalidadDetalle()
  }, [])

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Detalle de Operacion Reproceso devolucion</h1>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos del detalle de reproceso</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-md-5">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={nomProd}
                    className="form-control"
                  />
                </div>
                <div className="col-md-1">
                  <label htmlFor="loteOrigen" className="form-label">
                    <b>Lote origen</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codLotProd}
                    className="form-control"
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="fechaVenciiento" className="form-label">
                    <b>Fecha vencimiento</b>
                    <input
                      type="text"
                      disabled={true}
                      value={fecVenLotProd}
                      className="form-control"
                    />
                  </label>
                </div>
                <div className="col-md-2">
                  <label htmlFor="fechaVenciiento" className="form-label">
                    <b>Fecha creación</b>
                    <input
                      type="text"
                      disabled={true}
                      value={fecCreOpeDevCalDet}
                      className="form-control"
                    />
                  </label>
                </div>
                <div className="col-md-2">
                  <label htmlFor="fechaVenciiento" className="form-label">
                    <b>Estado</b>
                    <input
                      type="text"
                      disabled={true}
                      value={fueComOpeRep === 0 ? 'Requerido' : 'Completado' }
                      className="form-control"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* SI EXISTE DETALLE DE DEVOLUCION REGISTRADO MOSTRAMOS */}
        {
          reqDev.length !== 0 && (
            <div className="row mt-4 mx-4">
              <div className="card d-flex">
                <h6 className="card-header">Detalle de devolucion</h6>
                <div className="card-body">
                  <div className="mb-3 row">
                    {/* <Paper> */}
                    <TableContainer>
                      <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                          <TableRow
                            sx={{
                              '& th': {
                                color: 'rgba(96, 96, 96)',
                                backgroundColor: '#f5f5f5'
                              }
                            }}
                          >
                            <TableCell align="left" width={70}>
                              <b>Ref.</b>
                            </TableCell>
                            <TableCell align="left" width={200}>
                              <b>Presentacion</b>
                            </TableCell>
                            <TableCell align="left" width={100}>
                              <b>Cantidad devuelta</b>
                            </TableCell>
                            <TableCell align="left" width={100}>
                              <b>Fecha requerimiento</b>
                            </TableCell>
                            <TableCell align="left" width={100}>
                              <b>Estado</b>
                            </TableCell>
                            <TableCell align="left" width={80}>
                              <b>Acciones</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reqDev.map((row, i) => (
                            <RowDetalleDevolucionLoteProduccion
                              key={row.id}
                              correlativo={row.correlativo}
                              detalle={row}
                              onRenderPDF={generatePDF}
                              index={i}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* </Paper> */}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* MOSTRAMOS EL DETALLE DE DEVOLUCION RECOMENDADO */}
        {reqDev.length === 0 && (<div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Detalle de devolucion</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-3 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad unidades</b>
                  </label>
                  <input
                    type="number"
                    value={canLotProd}
                    disabled={true}
                  />
                </div>
              </div>
              <Paper>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow
                        sx={{
                          '& th': {
                            color: 'rgba(96, 96, 96)',
                            backgroundColor: '#f5f5f5'
                          }
                        }}
                      >
                        <TableCell align="left" width={200}>
                          <b>Presentación final</b>
                        </TableCell>
                        <TableCell align="left" width={50}>
                          <b>Medida</b>
                        </TableCell>
                        <TableCell align="left" width={100}>
                          <b>Recomendado</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Total</b>
                        </TableCell>
                        <TableCell align="left" width={120}>
                          <b>Acciones</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requisicionDevolucionReproceso.detDev.map(
                        (detalle, index) => (
                          <RowDevolucionLoteProduccionEdit
                            key={index}
                            detalle={detalle}
                            onChangeInputDetalle={
                              handleChangeInputProductoDevuelto
                            }
                            onDeleteItemDetalle={handleDeleteProductoDevuelto}
                          />
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </div>
          </div>
        </div>)}
        {/* BOTONES DE CANCELAR Y GUARDAR */}
        <div className="btn-toolbar mt-4 ms-4">
          <button
            type="button"
            onClick={() => {
              window.close()
            }}
            className="btn btn-secondary me-2"
          >
            Volver
          </button>
          {reqDev.length === 0 &&
          (<button
            type="submit"
            onClick={handleCrearDevolucionOperacionDevolucion}
            className="btn btn-primary"
          >
            Guardar
          </button>)}
        </div>
      </div>
      {/* FEEDBACK AGREGAR MATERIA PRIMA */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={feedbackCreate}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={style_message}
          sx={{ width: '100%' }}
        >
          <Typography whiteSpace={'pre-line'}>
            {feedback_description_error}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  )
}
