import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import queryString from 'query-string'
// IMPORTACIONES PARA EL FEEDBACK
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
// IMPORTACIONES PARA TABLE
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { getProduccionLoteWithAgregacionesById } from './../../../produccion/helpers/produccion_lote/getProduccionLoteWithAgregacionesById'
import { TextField, Typography } from '@mui/material'
import { RowDetalleAgregacionLoteProduccion } from './../../components/componentes-agregaciones/RowDetalleAgregacionLoteProduccion'
import { createAgregacionesLoteProduccion } from './../../helpers/agregaciones-lote-produccion/createAgregacionesLoteProduccion'
import { getFormulaProductoDetalleByProducto } from '../../../produccion/helpers/formula_producto/getFormulaProductoDetalleByProducto'
import { FilterMotivoAgregacionDynamic } from '../../../components/ReferencialesFilters/MotivoAgregacion/FilterMotivoAgregacionDinamyc'
import { getPresentacionFinal } from '../../../helpers/Referenciales/producto/getPresentacionFinal'
import { FilterProductosProgramados } from '../../../components/ReferencialesFilters/Producto/FilterProductosProgramados'
import { RowDetalleAgregacionLoteProduccionEditV2 } from '../../components/componentes-agregaciones/RowDetalleAgregacionLoteProduccionEditV2'
import { createRoot } from 'react-dom/client'
import { PDFAgregaciones } from '../../components/componentes-agregaciones/PDFAgregaciones'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

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

export const AgregarAgregacionV2 = () => {
  const location = useLocation()
  const { idLotProdc = '' } = queryString.parse(location.search)

  // ESTADOS PARA LA DATA DE DEVOLUCIONES
  const [agregacionesProduccionLote, setagregacionesProduccionLote] = useState({
    id: 0,
    idProdt: 0,
    nomProd: '',
    idProdEst: 0,
    desEstPro: '',
    idProdTip: 0,
    desProdTip: '',
    codLotProd: '',
    klgTotalLoteProduccion: '',
    totalUnidadesLoteProduccion: 0,
    fecVenLotProd: '',
    fecProdIniProg: '',
    fecProdFinProg: '',
    numop: '',
    prodDetProdc: [],
    prodDetAgr: []
  })

  const {
    totalUnidadesLoteProduccion,
    codLotProd,
    desEstPro,
    desProdTip,
    fecVenLotProd,
    klgTotalLoteProduccion,
    nomProd,
    numop,
    prodDetProdc,
    prodDetAgr
  } = agregacionesProduccionLote

  // productos disponibles
  const [productosDisponibles, setProductosDisponibles] = useState([])
  const [filterProductosDisponibles, setFilterProductosDisponibles] = useState(
    []
  )

  // detalle de requisicion agregacion
  const [detalleRequisicionAgregacion, setDetalleRequisicionAgregacion] =
    useState({
      requisicionAgregacion: null,
      detalleProductosAgregados: []
    })

  const { requisicionAgregacion, detalleProductosAgregados } =
    detalleRequisicionAgregacion

  // ************ ESTADO PARA CONTROLAR EL FEEDBACK **************
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

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate()
  const onNavigateBack = () => {
    navigate(-1)
  }

  // ESTADO PARA BOTON CREAR
  const [disableButton, setdisableButton] = useState(false)

  // ******* MANEJADORES PARA EL AGREGADO DE PRODUCCION *******
  // producto final informacion
  const [formulaProductoFinal, setFormulaProductoFinal] = useState(null)

  // STATE PARA CONTROLAR LA AGREGACION DE PRODUCTOS FINALES DEL LOTE
  const [productoLoteProduccion, setproductoLoteProduccion] = useState({
    idProdFin: 0,
    idProdcMot: 0, // motivo de agregacion
    cantidadDeLote: 0.0,
    cantidadDeProducto: 0
  })

  const { idProdcMot, cantidadDeLote, cantidadDeProducto } =
    productoLoteProduccion

  // funcion para manejar el motivo de la agregacion
  const onAddMotivoAgregacionProduccionAgregacion = (value) => {
    /*
    1. faltante de materiales
    2. nueva presentacion
    3. encuadre
    */
    if (value.id === 0) {
      // reseteamos todo
      setproductoLoteProduccion({
        idProdcMot: 0,
        idProdFin: 0,
        cantidadDeLote: 0.0,
        cantidadDeProducto: 0
      })
      setFilterProductosDisponibles([])
      setFormulaProductoFinal(null)
      setDetalleRequisicionAgregacion({
        requisicionAgregacion: {},
        detalleProductosAgregados: []
      })
    } else {
      if (value.id === 1) {
        // solo filtramos las presentaciones finales programadas
        const productosFilter = productosDisponibles.filter((producto) => {
          return prodDetProdc.some(
            (productoProduccion) => productoProduccion.idProdt === producto.id
          )
        })
        setFilterProductosDisponibles(productosFilter)
        // ahora actualizamos las cantidades
        setproductoLoteProduccion({
          idProdcMot: value.id,
          idProdFin: 0,
          cantidadDeLote: 0.0,
          cantidadDeProducto: 1
        })
        setFormulaProductoFinal(null)
        setDetalleRequisicionAgregacion({
          requisicionAgregacion: {},
          detalleProductosAgregados: []
        })
      } else if (value.id === 2) {
        // Filtramos los productos no programados
        const productosFilter = productosDisponibles.filter((producto) => {
          return !prodDetProdc.some(
            (productoProduccion) => productoProduccion.idProdt === producto.id
          )
        })
        setFilterProductosDisponibles(productosFilter)
        // primero actualizamos el setting
        setproductoLoteProduccion({
          idProdFin: 0,
          idProdcMot: value.id,
          cantidadDeLote: 0.0,
          cantidadDeProducto: 0
        })
        setFormulaProductoFinal(null)
        setDetalleRequisicionAgregacion({
          requisicionAgregacion: {},
          detalleProductosAgregados: []
        })
      } else {
        // Filtramos los productos no programados
        const productosFilter = productosDisponibles.filter((producto) => {
          return prodDetProdc.some(
            (productoProduccion) => productoProduccion.idProdt === producto.id
          )
        })
        setFilterProductosDisponibles(productosFilter)
        // primero actualizamos el setting
        setproductoLoteProduccion({
          idProdFin: 0,
          idProdcMot: value.id,
          cantidadDeLote: 0.0,
          cantidadDeProducto: 0
        })
        setFormulaProductoFinal(null)
        setDetalleRequisicionAgregacion({
          requisicionAgregacion: {},
          detalleProductosAgregados: []
        })
      }
    }
  }

  // funcion para agregar presentacion final para la agregacion
  const onAddProductoFinalLoteProduccionAgregacion = async ({ id, value }) => {
    const { result } = await getFormulaProductoDetalleByProducto(id)
    if (result.length === 1) {
      const { reqDet } = result[0] // obtenemos las requisiciones

      let reqProdInt = null
      const reqEnvEnc = []

      reqDet.forEach((detalle) => {
        if (detalle.idAre === 2 || detalle.idAre === 7) {
          reqProdInt = detalle
        } else {
          reqEnvEnc.push(detalle)
        }
      })

      if (reqProdInt !== null) {
        const formulaPresentacionFinal = {
          id: result[0].id,
          idProdFin: result[0].idProdFin,
          nomProd: result[0].nomProd,
          simMed: result[0].simMed,
          canForProInt: reqProdInt.canForProDet,
          reqDet: reqEnvEnc
        }

        setFormulaProductoFinal(formulaPresentacionFinal)

        // seteamos
        setproductoLoteProduccion({
          ...productoLoteProduccion,
          idProdFin: id
        })
      } else {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error:
            'Esta formula no tiene información de su producto intermedio'
        })
        handleClickFeeback()

        // reseteamos los campos
        setproductoLoteProduccion({
          ...productoLoteProduccion,
          idProdFin: 0,
          cantidadDeLote: 0.0,
          cantidadDeProducto: 0
        })
      }
    } else {
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error:
          'No hay formulas o hay mas de una formula para esta presetacion final'
      })
      handleClickFeeback()

      // reseteamos los campos
      setproductoLoteProduccion({
        ...productoLoteProduccion,
        idProdFin: 0,
        cantidadDeLote: 0.0,
        cantidadDeProducto: 0
      })
    }
  }

  // funcion para manejar la cantidad de klg requerida
  const handleInputsProductoFinalLoteAgregacion = ({ target }) => {
    const { value } = target
    // cantidad requerida de klg de lote para presentacion final
    try {
      const cantidadKlgRequerida = value

      if (formulaProductoFinal !== null) {
        // cantidad de klg de producto intermedio por unidad de presentacion final
        const canKlgProdIntByUni = formulaProductoFinal.canForProInt
        // cantidad de unidades obtenidas segun klg requerido ingresado
        const cantidadUniRequerida = parseInt(
          parseFloat(cantidadKlgRequerida) / parseFloat(canKlgProdIntByUni)
        )

        setproductoLoteProduccion({
          ...productoLoteProduccion,
          cantidadDeLote: cantidadKlgRequerida,
          cantidadDeProducto: cantidadUniRequerida
        })
      }
    } catch (e) {}
  }

  // funcion para manejar la cantidad de unidades requeridas
  const handleInputsProductoFinalCantidadAgregacion = ({ target }) => {
    const { value } = target
    // cantidad requerida de klg de lote para presentacion final
    try {
      const cantidadUniRequerida = value
      let cantidadKlgRequerida = 0

      if (formulaProductoFinal !== null) {
        // cantidad de klg de producto intermedio por unidad de presentacion final
        const canKlgProdIntByUni = formulaProductoFinal.canForProInt
        // cantidad de unidades obtenidas segun klg requerido ingresado
        cantidadKlgRequerida =
          parseInt(cantidadUniRequerida) * parseFloat(canKlgProdIntByUni)
        cantidadKlgRequerida = cantidadKlgRequerida.toFixed(5)
        setproductoLoteProduccion({
          ...productoLoteProduccion,
          cantidadDeLote: cantidadKlgRequerida,
          cantidadDeProducto: cantidadUniRequerida
        })
      }
    } catch (e) {}
  }

  // funcion para añadir al detalle
  const handleAddProductoProduccionLoteAgregacion = async (e) => {
    e.preventDefault()
    // equivalente en klg
    const cantidadDeLote = productoLoteProduccion.cantidadDeLote
    // equivalente en unidades
    const cantidadDeProducto = productoLoteProduccion.cantidadDeProducto

    // primero verificamos si se ha ingresado la data necesaria
    if (
      productoLoteProduccion.idProdcMot !== 0 &&
      productoLoteProduccion.idProdFin !== 0 &&
      (cantidadDeLote > 0.0 || cantidadDeProducto > 0)
    ) {
      const itemFound = prodDetProdc.find(
        (element) => element.idProdFin === productoLoteProduccion.idProdFin
      )

      // verificamos si este producto final ha sido agregado previamente
      if (itemFound) {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error: 'Ya se agrego este producto a la orden'
        })
        handleClickFeeback()
      } else {
        if (formulaProductoFinal !== null) {
          const { reqDet } =
            formulaProductoFinal

          const detalleRequisicionesFormula = []

          reqDet.forEach((detalle) => {
            detalleRequisicionesFormula.push({
              ...detalle,
              // indexProdFin: nextIndex,
              idProdFin: productoLoteProduccion.idProdFin,
              canReqProdLot: parseFloat(
                cantidadDeProducto * detalle.canForProDet
              ).toFixed(5)
            })
          })

          detalleRequisicionesFormula.forEach((obj) => {
            obj.canReqProdLot = parseIntCantidad(obj)
          })

          // actualizamos el detalle de la requisicion de agregacion
          setDetalleRequisicionAgregacion({
            requisicionAgregacion: productoLoteProduccion,
            detalleProductosAgregados: detalleRequisicionesFormula
          })

          // reseteamos los campos
          // setproductoLoteProduccion({
          //   idProdFin: 0,
          //   idProdcMot: 0,
          //   cantidadDeLote: 0.0,
          //   cantidadDeProducto: 0,
          // });

          // setFormulaProductoFinal(null);
        } else {
          setfeedbackMessages({
            style_message: 'warning',
            feedback_description_error:
              'No se ha seleccionado ninguna presentacion final'
          })
          handleClickFeeback()
        }
      }
    } else {
      let advertenciaPresentacionFinal = ''
      if (productoLoteProduccion.idProdcMot === 0) {
        advertenciaPresentacionFinal +=
          'Se debe proporcionar un motivo de agregación\n'
      }
      if (productoLoteProduccion.idProdFin === 0) {
        advertenciaPresentacionFinal +=
          'Se debe proporcionar una presentacion final para agregar a la orden\n'
      }
      if (
        productoLoteProduccion.cantidadDeLote <= 0.0 ||
        productoLoteProduccion.cantidadDeProducto <= 0
      ) {
        advertenciaPresentacionFinal +=
          'Se debe proporcionar una cantidad mayor a 0 para agregar a la orden\n'
      }

      // mostramos el mensaje de error
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: advertenciaPresentacionFinal
      })
      handleClickFeeback()
    }
  }

  // funcion para mostrar pdf
  const generatePDF = (data, index) => {
    const formatData = {
      produccion: agregacionesProduccionLote,
      requisicion: data
    }
    const newWindow = window.open('', 'Agregaciones', 'fullscreen=yes')
    // Crear un contenedor específico para tu aplicación
    const appContainer = newWindow.document.createElement('div')
    newWindow.document.body.appendChild(appContainer)
    const root = createRoot(appContainer)
    root.render(<PDFAgregaciones data={formatData} index={index} />)
  }

  // ACCION PARA EDITAR CAMPOS EN DETALLE DE PRODUCTO DEVUELTO
  const handleChangeInputProductoAgregado = async ({ target }, idItem) => {
    const { value } = target
    const editFormDetalle = detalleProductosAgregados.map((element) => {
      if (element.idProd === idItem) {
        return {
          ...element,
          canReqProdLot: value
        }
      } else {
        return element
      }
    })

    // actualizamos el detalle de la requisicion de agregacion
    setDetalleRequisicionAgregacion({
      ...detalleRequisicionAgregacion,
      detalleProductosAgregados: editFormDetalle
    })
  }

  // ACCION PARA ELIMINA DEL DETALLE UN PRODUCTO DEVUELTO
  const handleDeleteProductoAgregado = async (idItem) => {
    // filtramos el elemento eliminado
    const datadetalleProductosAgregados = detalleProductosAgregados.filter(
      (element) => {
        if (element.idProd !== idItem) {
          return true
        } else {
          return false
        }
      }
    )

    // actualizamos el detalle de la requisicion de agregacion
    setDetalleRequisicionAgregacion({
      ...detalleRequisicionAgregacion,
      detalleProductosAgregados: datadetalleProductosAgregados
    })
  }

  // FUNCION PARA TRAES DATOS DE PRODUCCION LOTE
  const traerDatosProduccionLoteWithAgregaciones = async () => {
    if (idLotProdc.length !== 0) {
      const resultPeticion = await getProduccionLoteWithAgregacionesById(
        idLotProdc
      )
      const { message_error, description_error, result } = resultPeticion

      if (message_error.length === 0) {
        console.log(result)
        const { idProdt } = result[0]

        // ahora debemos obtener los productos que se podran agregar
        const productosDisponibles = await getPresentacionFinal(idProdt)
        // seteamos la informacion de productos disponibles
        setProductosDisponibles(productosDisponibles)
        // seteamos la informacion de produccion de lote
        setagregacionesProduccionLote(result[0])
      } else {
        setfeedbackMessages({
          style_message: 'error',
          feedback_description_error: description_error
        })
        handleClickFeeback()
      }
    }
  }

  // ********** SUBMIT DE DEVOLUCIONES ***********
  const crearAgregacionesLoteProduccion = async () => {
    // obtenemos informacion de la requisicion agregacion
    const informacionRequisicionAgregacion =
      detalleRequisicionAgregacion.requisicionAgregacion
    const informacionDetalleProductosAgregados =
      detalleRequisicionAgregacion.detalleProductosAgregados
    const { idProdcMot, idProdFin } = informacionRequisicionAgregacion

    let formatDataRequisicion = null
    // si no es una nueva presentacion
    if (idProdcMot !== 2) {
      // buscamos su referencia de producto final
      const referenciaProductoFinal = prodDetProdc.find(
        (element) => idProdFin === element.idProdt
      )

      formatDataRequisicion = {
        correlativo: `${numop} - A${String(prodDetAgr.length + 1).padStart(
          2,
          '0'
        )}`,
        detalleProductosAgregados: informacionDetalleProductosAgregados,
        requisicionAgregacion: {
          ...informacionRequisicionAgregacion,
          idProdc: idLotProdc, // lote de produccion
          idProdcMot: informacionRequisicionAgregacion.idProdcMot, // motivo de agregacion
          idProdFin: referenciaProductoFinal.id, // referencia directa a su producto programado
          idProdt: informacionRequisicionAgregacion.idProdFin // producto final agregado
        }
      }
    } else {
      formatDataRequisicion = {
        correlativo: `${numop} - A${String(prodDetAgr.length + 1).padStart(
          2,
          '0'
        )}`,
        detalleProductosAgregados: informacionDetalleProductosAgregados,
        requisicionAgregacion: {
          ...informacionRequisicionAgregacion,
          idProdc: idLotProdc, // lote de produccion
          idProdcMot: informacionRequisicionAgregacion.idProdcMot, // motivo de agregacion
          idProdFin: 0, // referencia directa a su producto programado
          idProdt: informacionRequisicionAgregacion.idProdFin // producto final agregado
        }
      }
    }

    // finalmente, agregamos el correlativo

    const resultPeticion = await createAgregacionesLoteProduccion(
      formatDataRequisicion
    )
    console.log(resultPeticion)
    const { message_error, description_error } = resultPeticion

    if (message_error.length === 0) {
      // regresamos a la anterior vista
      onNavigateBack()
      setfeedbackMessages({
        style_message: 'success',
        feedback_description_error: 'Creado con exito'
      })
      handleClickFeeback()
      setTimeout(() => {
        window.close()
      }, '1000')
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_error
      })
      handleClickFeeback()
    }
    setdisableButton(false)
  }

  const handleSubmitAgregacionesLoteProduccion = (e) => {
    e.preventDefault()
    if (
      detalleProductosAgregados.length === 0 ||
      requisicionAgregacion === null
    ) {
      let handleErrors = ''
      if (detalleProductosAgregados.length === 0) {
        handleErrors += '- No se ha agregado ningun detalle de agregacion\n'
      }
      if (requisicionAgregacion === null) {
        handleErrors += '- No se ha agregado ningun detalle de requisicion\n'
      }
      // MANEJAMOS FORMULARIOS INCOMPLETOS
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: handleErrors
      })
      handleClickFeeback()
    } else {
      setdisableButton(true)
      // crear devolucion
      crearAgregacionesLoteProduccion()
    }
  }

  useEffect(() => {
    // TRAEMOS LA DATA DE REQUSICION DETALLE
    traerDatosProduccionLoteWithAgregaciones()
  }, [])

  return (
    <>
      <div className="container-fluid px-4">
        <h1 className="mt-4 text-center">Registrar agregacion</h1>
        <div className="row mt-4 mx-4">
          {/* Datos de produccion */}
          <div className="card d-flex">
            <h6 className="card-header">Datos de produccion</h6>
            <div className="card-body">
              <div className="mb-3 row">
                {/* NUMERO DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Numero de Lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={codLotProd}
                    className="form-control"
                  />
                </div>
                {/* PRODUCTO */}
                <div className="col-md-4 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Producto</b>
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    value={nomProd}
                    className="form-control"
                  />
                </div>
                {/* KILOGRAMOS DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Peso de Lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${klgTotalLoteProduccion} KG`}
                    className="form-control"
                  />
                </div>
                {/* CANTIDAD DE LOTE */}
                <div className="col-md-2">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad Unidades</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={`${totalUnidadesLoteProduccion} UND`}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3 row d-flex align-items-center">
                {/* TIPO DE PRODUCCION */}
                <div className="col-md-3">
                  <label htmlFor="nombre" className="form-label">
                    <b>Tipo de produccion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desProdTip}
                    className="form-control"
                  />
                </div>
                {/* ESTADO DE PRODUCCION */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Estado de produccion</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={desEstPro}
                    className="form-control"
                  />
                </div>
                {/* FECHA DE VENCIMIENTO */}
                <div className="col-md-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Fecha vencimiento lote</b>
                  </label>
                  <input
                    type="text"
                    disabled={true}
                    value={fecVenLotProd}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DEVOLUCIONES ASOCIADAS AL LOTE DE PRODUCCION */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Agregaciones registradas</h6>
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
                        <TableCell align="left" width={100}>
                          <b>Motivo</b>
                        </TableCell>
                        <TableCell align="left" width={200}>
                          <b>Presentacion</b>
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
                      {prodDetAgr.map((row, i) => (
                        <RowDetalleAgregacionLoteProduccion
                          key={row.id}
                          index={i}
                          correlativo={row.correlativo}
                          detalle={row}
                          onRenderPDF={generatePDF}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* </Paper> */}
              </div>
            </div>
          </div>

          {/* AGREGAR PRODUCTOS AL DETALLE  */}
          <div className="card d-flex mt-4">
            <h6 className="card-header">Detalle de agregaciones</h6>

            <div className="card-body">
              <form className="row mb-4 d-flex flex-row justify-content-start align-items-end">
                {/* AGREGAR MOTIVO DE AGREGACION */}
                <div className="col-md-3">
                  <label className="form-label">Motivo</label>
                  {/* Filter de devolucion */}
                  <FilterMotivoAgregacionDynamic
                    defaultValue={productoLoteProduccion.idProdcMot}
                    onNewInput={onAddMotivoAgregacionProduccionAgregacion}
                  />
                </div>
                {/* AGREGAR PRODUCTO */}
                <div className="col-md-4">
                  <label className="form-label">Presentación Final</label>
                  {/* <FilterAllProductos onNewInput={onProductoId} /> */}
                  <FilterProductosProgramados
                    defaultValue={productoLoteProduccion.idProdFin}
                    onNewInput={onAddProductoFinalLoteProduccionAgregacion}
                    products={filterProductosDisponibles}
                  />
                </div>
                {/* KILOGRAMOS DE LOTE ASIGNADOS */}
                <div className="col-md-2">
                  <label className="form-label">Cantidad Lote (KG)</label>
                  <TextField
                    // type="number"
                    autoComplete="off"
                    size="small"
                    type="number"
                    name="cantidadDeLote"
                    disabled={
                      idProdcMot === 0
                        ? true
                        : idProdcMot === 1
                          ? false
                          : idProdcMot !== 2
                    }
                    value={cantidadDeLote}
                    onChange={handleInputsProductoFinalLoteAgregacion}
                  />
                </div>

                {/* CANTIDAD DE PRRODUCTOS FINALES ESPERADOS
                 */}

                <div className="col-md-2">
                  <label className="form-label">Cantidad Producto</label>
                  <TextField
                    // type="number"
                    autoComplete="off"
                    size="small"
                    type="number"
                    name="cantidadDeProducto"
                    value={cantidadDeProducto}
                    disabled={idProdcMot === 0}
                    onChange={handleInputsProductoFinalCantidadAgregacion}
                  />
                </div>

                {/* BOTON AGREGAR PRODUCTO */}
                <div className="col-md-1 d-flex justify-content-end align-self-center ms-auto">
                  <button
                    onClick={handleAddProductoProduccionLoteAgregacion}
                    className="btn btn-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-plus-circle-fill me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                    </svg>
                    Agregar
                  </button>
                </div>
              </form>

              <div>
                {/* DETALLE ENVASADO */}
                <div className="card text-bg-success d-flex">
                  <h6 className="card-header">Detalle envasado</h6>
                  <div className="card-body">
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
                              <TableCell align="left" width={230}>
                                <b>Nombre</b>
                              </TableCell>
                              <TableCell align="left" width={20}>
                                <b>U.M</b>
                              </TableCell>
                              <TableCell align="left" width={20}>
                                <b>Unidad</b>
                              </TableCell>
                              <TableCell align="left" width={120}>
                                <b>Total</b>
                              </TableCell>
                              <TableCell align="left" width={150}>
                                <b>Acciones</b>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {detalleProductosAgregados.map((row, i) => {
                              if (row.idAre === 5) {
                                return (
                                  <RowDetalleAgregacionLoteProduccionEditV2
                                    key={row.idProd}
                                    detalle={row}
                                    onChangeItemDetalle={
                                      handleChangeInputProductoAgregado
                                    }
                                    onDeleteItemRequisicion={
                                      handleDeleteProductoAgregado
                                    }
                                  />
                                )
                              } else {
                                return null
                              }
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </div>
                </div>

                {/* DETALLE ENCAJONADO */}
                <div className="card text-bg-warning d-flex mt-4">
                  <h6 className="card-header">Detalle encajonado</h6>
                  <div className="card-body">
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
                              <TableCell align="left" width={230}>
                                <b>Nombre</b>
                              </TableCell>
                              <TableCell align="left" width={20}>
                                <b>U.M</b>
                              </TableCell>
                              <TableCell align="left" width={20}>
                                <b>Unidad</b>
                              </TableCell>
                              <TableCell align="left" width={120}>
                                <b>Total</b>
                              </TableCell>
                              <TableCell align="left" width={150}>
                                <b>Acciones</b>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {detalleProductosAgregados.map((row, i) => {
                              if (row.idAre === 6) {
                                return (
                                  <RowDetalleAgregacionLoteProduccionEditV2
                                    key={row.idProd}
                                    detalle={row}
                                    onChangeItemDetalle={
                                      handleChangeInputProductoAgregado
                                    }
                                    onDeleteItemRequisicion={
                                      handleDeleteProductoAgregado
                                    }
                                  />
                                )
                              } else {
                                return null
                              }
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* BOTONES DE CANCELAR Y GUARDAR */}
          <div className="btn-toolbar mt-4">
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn btn-secondary me-2"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={disableButton}
              onClick={handleSubmitAgregacionesLoteProduccion}
              className="btn btn-primary"
            >
              Guardar
            </button>
          </div>
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
