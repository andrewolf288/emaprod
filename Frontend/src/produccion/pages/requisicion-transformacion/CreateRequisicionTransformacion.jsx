import React, { useState } from 'react'
import { FilterProductoProduccionDynamic } from '../../../components/ReferencialesFilters/Producto/FilterProductoProduccionDynamic'
import {
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import MuiAlert from '@mui/material/Alert'
import { ComponentSearchLotesDisponibles } from '../../components/componentes-transdormacion/ComponentSearchLotesDisponibles'
import { getProductosDisponiblesByLote } from '../../helpers/requisicion-transformacion/getProductosDisponiblesByLote'
import { getProductosDisponiblesByProductoIntermedio } from '../../helpers/requisicion-transformacion/getProductosDisponiblesByProductoIntermedio'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import { RowDevolucionLoteProduccionEdit } from '../../../almacen/pages/devoluciones/RowDevolucionLoteProduccionEdit'
import { RowEditDetalleRequisicionProduccion } from '../../components/componentes-lote-produccion/RowEditDetalleRequisicionProduccion'
import { useNavigate } from 'react-router-dom'
import { createOrdenTransformacion } from '../../helpers/requisicion-transformacion/createOrdenTransformacion'

// CONFIGURACION DE FEEDBACK
const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
})

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

// se encarga de redondear los valores de las requisiciones
function _parseInt (str) {
  if (str.canReqProdLot) {
    str.canReqDet = str.canReqProdLot
  }

  if (str.canTotProgProdFin) {
    str.canReqDet = str.canTotProgProdFin
  }
  str.canReqDet = parseFloat(str.canReqDet).toFixed(2)
  const index = str.canReqDet.toString().indexOf('.')
  const result = str.canReqDet.toString().substring(index + 1)
  const val =
    parseInt(result) >= 1 && str.simMed !== 'KGM'
      ? Math.trunc(str.canReqDet) + 1
      : str.canReqDet
  return val
}

// para poder validar las requisicion
function onValidate (e) {
  const t = e.value
  e.value = t.indexOf('.') >= 0 ? t.slice(0, t.indexOf('.') + 3) : t
  return e.value
}

export const CreateRequisicionTransformacion = () => {
  // data productos finales por lote
  const [productosFinalesDisponiblesLote, setProductosFinalesDisponiblesLote] =
    useState([])
  const [valueProductoOrigenSeleccionado, setValueProductoOrigenSeleccionado] =
    useState(null)
  // data productos finales por producto intermedio
  const [
    productosFinalesDisponiblesProductoIntermedio,
    setProductosFinalesDisponiblesProductoIntermedio
  ] = useState([])
  const [
    valueProductoDestinoSeleccionado,
    setValueProductoDestinoSeleccionado
  ] = useState(null)
  // data de requisicion de transformacion
  const [requisicionTransformacion, setRequisicionTransformacion] = useState({
    idProdtInt: 0,
    idProdc: 0,
    codLotProd: '',
    idProdtOri: 0,
    canUndProdtOri: 0,
    canPesProdtOri: 0,
    idProdtDes: 0,
    canUndProdtDes: 0,
    canPesProdtDes: 0
  })
  const {
    idProdtInt,
    codLotProd,
    idProdtOri,
    canUndProdtOri,
    canPesProdtOri,
    idProdtDes,
    canUndProdtDes,
    canPesProdtDes
  } = requisicionTransformacion

  // requisicion de devolucion
  const [
    requisicionDevolucionTransformacion,
    setRequisicionDevolucionTransformacion
  ] = useState({
    idProdt: 0,
    canDevUnd: 0,
    canDevPes: 0,
    detDev: []
  })
  // requisicion de materiales
  const [
    requisicionMaterialesTransformacion,
    setRequisicionMaterialesTransformacion
  ] = useState({
    idProdt: 0,
    canReqUnd: 0,
    canReqPes: 0,
    detReq: []
  })

  // ESTADOS PARA LA NAVEGACION
  const navigate = useNavigate()
  const onNavigateBack = () => {
    navigate(-1)
  }

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

  // funcion para producto intermedio
  const onAddProductoProduccion = async ({ id }) => {
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      idProdtInt: id
    })
  }

  // cambiar producto origen
  const onAddProductoFinalOrigen = (event) => {
    const { target } = event
    // buscamos el elemento de origen
    const valueFind = productosFinalesDisponiblesLote.find(
      (element) => element.idProd === parseInt(target.value)
    )
    setValueProductoOrigenSeleccionado(valueFind)
    // debemos colocar su valor de cantidad unidades y cantidad de peso
    // cantidad en unidades
    const cantidadUnidades = valueFind.canTotDis
    const { detFor } = valueFind
    const valueFindProductoIntermedio = detFor.find(
      (element) => element.idAre !== 6 && element.idAre !== 5
    )
    const pesoPorUnidad = parseFloat(
      valueFindProductoIntermedio.canForProDet
    )
    const pesoTotal = cantidadUnidades * pesoPorUnidad
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      canUndProdtOri: cantidadUnidades,
      canPesProdtOri: pesoTotal,
      idProdtOri: target.value
    })
  }

  // cambiar producto destino
  const onAddProductoFinalDestino = (event) => {
    const { target } = event
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      idProdtDes: target.value,
      canUndProdtDes: 0,
      canPesProdtDes: 0
    })
    // buscamos el elemento de origen
    const valueFind = productosFinalesDisponiblesProductoIntermedio.find(
      (element) => element.idProdFin === parseInt(target.value)
    )
    setValueProductoDestinoSeleccionado(valueFind)
  }

  // funcion que selecciona un lote de produccion y trae sus productos finales disponibles
  const onAddLoteProduccion = async (idProdc, lote) => {
    // ahora debemos consultar los productos finales por lote
    const resultPeticionA = await getProductosDisponiblesByLote(idProdc)
    const {
      result: resultA,
      message_error: message_errorA,
      description_error: description_errorA
    } = resultPeticionA

    if (message_errorA.length === 0) {
      if (resultA.length === 0) {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error: 'Este lote no tiene stock'
        })
        handleClickFeeback()
        // reset
        resetContenedores()
      } else {
        // ahora debemos consultar los posibles productos finales por producto intermedio
        const resultPeticionB =
          await getProductosDisponiblesByProductoIntermedio(idProdtInt)
        const {
          result: resultB,
          message_error: message_errorB,
          description_error: description_errorB
        } = resultPeticionB

        if (message_errorB.length === 0) {
          if (resultB.length === 0) {
            setfeedbackMessages({
              style_message: 'warning',
              feedback_description_error:
                'No hay formulaciones para este producto intermedio'
            })
            handleClickFeeback()
            // reset
            resetContenedores()
          } else {
            setProductosFinalesDisponiblesLote(resultA)
            // reset producto origen
            resetProductoOrigen()

            setProductosFinalesDisponiblesProductoIntermedio(resultB)
            // reset producto origen
            resetProductoDestino()
          }
        } else {
          setfeedbackMessages({
            style_message: 'error',
            feedback_description_error: description_errorB
          })
          handleClickFeeback()
          // reset
          resetContenedores()
        }
      }
    } else {
      setfeedbackMessages({
        style_message: 'error',
        feedback_description_error: description_errorA
      })
      handleClickFeeback()
      // reset
      resetContenedores()
    }

    // seteamos los valores
    resetDataOrdenTransformacion(idProdc, lote)
    resetDetalleDevoluciones()
    resetDetalleMateriales()
  }

  // reset orden de transformacion
  const resetDataOrdenTransformacion = (idProdc, lote) => {
    setRequisicionTransformacion({
      ...requisicionTransformacion,
      idProdc,
      codLotProd: lote,
      idProdtOri: 0,
      idProdtDes: 0,
      canPesProdtDes: 0,
      canPesProdtOri: 0,
      canUndProdtDes: 0,
      canUndProdtOri: 0
    })
  }

  // reset detalle devoluciones
  const resetDetalleDevoluciones = () => {
    setRequisicionDevolucionTransformacion({
      idProdt: 0,
      canDevUnd: 0,
      canDevPes: 0,
      detDev: []
    })
  }

  // reset detalle materiales de transformacion
  const resetDetalleMateriales = () => {
    setRequisicionMaterialesTransformacion({
      idProdt: 0,
      canReqUnd: 0,
      canReqPes: 0,
      detReq: []
    })
  }

  // reset contenedores
  const resetContenedores = () => {
    // resetamos los contenedores
    setProductosFinalesDisponiblesLote([])
    setProductosFinalesDisponiblesProductoIntermedio([])
  }

  // reset producto origen
  const resetProductoOrigen = () => {
    // reseteamos el elemento seleccionado
    setValueProductoOrigenSeleccionado(null)
  }

  // reset producto destino
  const resetProductoDestino = () => {
    // reseteamos el elemento seleccionado
    setValueProductoDestinoSeleccionado(null)
  }

  // funcion para manejar la cantidad de klg requerida
  const handleChangePesoTotalProductoDestino = ({ target }) => {
    const { value } = target
    // cantidad requerida de klg de lote para presentacion final
    try {
      const cantidadTotalPesoKlg = value

      if (valueProductoDestinoSeleccionado !== null) {
        // cantidad de klg de producto intermedio por unidad de presentacion final
        const canKlgProdIntByUni =
          valueProductoDestinoSeleccionado.canForProdInt
        // cantidad de unidades obtenidas segun klg requerido ingresado
        const cantidadUniRequerida = parseInt(
          parseFloat(cantidadTotalPesoKlg) / parseFloat(canKlgProdIntByUni)
        )
        setRequisicionTransformacion({
          ...requisicionTransformacion,
          canPesProdtDes: cantidadTotalPesoKlg,
          canUndProdtDes: cantidadUniRequerida
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  // funcion para manejar la cantidad de unidades requeridas
  const handleChangeUnidadesTotalProductoDestino = ({ target }) => {
    const { value } = target
    // cantidad requerida de klg de lote para presentacion final
    try {
      const cantidadUniRequerida = value
      let cantidadTotalPesoKlg = 0

      if (valueProductoDestinoSeleccionado !== null) {
        // cantidad de klg de producto intermedio por unidad de presentacion final
        const canKlgProdIntByUni =
          valueProductoDestinoSeleccionado.canForProdInt
        // cantidad de unidades obtenidas segun klg requerido ingresado
        cantidadTotalPesoKlg =
          parseInt(cantidadUniRequerida) * parseFloat(canKlgProdIntByUni)
        cantidadTotalPesoKlg = cantidadTotalPesoKlg.toFixed(3)
        setRequisicionTransformacion({
          ...requisicionTransformacion,
          canUndProdtDes: cantidadUniRequerida,
          canPesProdtDes: cantidadTotalPesoKlg
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  // calcular requisicion de devolucion y de materiales
  const calcularDetallesTransformacion = () => {
    // condicional
    if (
      canPesProdtDes > 0 &&
      canUndProdtDes > 0 &&
      canPesProdtOri > 0 &&
      canUndProdtOri > 0 &&
      idProdtOri !== idProdtDes
    ) {
      // buscamos el peso por unidad del producto de origen
      const { detFor } = valueProductoOrigenSeleccionado
      const valueFindProductoIntermedio = detFor.find(
        (element) => element.idAre !== 6 && element.idAre !== 5
      )
      const pesoPorUnidad = parseFloat(
        valueFindProductoIntermedio.canForProDet
      )
      const totalUnidades = canPesProdtDes / pesoPorUnidad
      const formatFloatUnidadesTotales = parseFloat(totalUnidades.toFixed(3))
      let formatEnteroUnidadesTotales = 0

      // debemos hacer que si contiene decimales, se redondee hacia arriba el entero ya que hablamos de unidades fisicas
      if (formatFloatUnidadesTotales % 1 === 0) {
        formatEnteroUnidadesTotales = formatFloatUnidadesTotales // Si el número es entero, no se hace ningún cambio
      } else {
        formatEnteroUnidadesTotales = Math.ceil(formatFloatUnidadesTotales) // Si hay decimales, se redondea hacia arriba
      }

      // ahora que ya se tiene el valor entero, se calcula la requisicion de devolucion
      const detalleRequisicionDevolucion = []
      detFor.forEach((detalle) => {
        if (detalle.idAre === 5 || detalle.idAre === 6) {
          const cantidadRequisicionDevuelta = parseFloat(
            detalle.canForProDet * formatEnteroUnidadesTotales
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
                canProdDev: cantidadParser
              },
              {
                idProdDevMot: 5,
                nomDevMot: 'Transformación',
                canProdDev: 0
              }
            ]
          }
        }
      )

      setRequisicionDevolucionTransformacion({
        ...requisicionDevolucionTransformacion,
        idProdt: idProdtOri,
        detDev: detalleRequisicionMotivos,
        canDevUnd: formatEnteroUnidadesTotales,
        canDevPes: canPesProdtDes
      })

      // calculamos la requisicion de materiales
      const { detFor: detForReq } = valueProductoDestinoSeleccionado
      const detalleRequisicionMateriales = []
      detForReq.forEach((detalle) => {
        if (detalle.idAre === 5 || detalle.idAre === 6) {
          const cantidadRequisicionMateriales = parseFloat(
            canUndProdtDes * detalle.canForProDet
          ).toFixed(5)
          detalleRequisicionMateriales.push({
            ...detalle,
            indexProdFin: 1,
            canReqProdLot: cantidadRequisicionMateriales
          })
        }
      })

      detalleRequisicionMateriales.forEach((obj) => {
        // obj.canReqProdLot = _parseInt(obj.canReqProdLot)
        obj.canReqProdLot = _parseInt(obj)
      })

      setRequisicionMaterialesTransformacion({
        ...requisicionMaterialesTransformacion,
        idProdt: idProdtDes,
        detReq: detalleRequisicionMateriales,
        canReqUnd: canUndProdtDes,
        canReqPes: canPesProdtDes
      })
    } else {
      if (idProdtOri === idProdtDes) {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error:
            'Los productos de origen y destino son iguales'
        })
        handleClickFeeback()
      } else {
        setfeedbackMessages({
          style_message: 'warning',
          feedback_description_error:
            'No se han indicado cantidades mayores a cero. Revise el detalle de transformación'
        })
        handleClickFeeback()
      }
    }
  }

  // --------------- OPERACIONES EDIT Y DELETE DE DEVOLUCION ----------------------

  // operación de edicion
  const handleChangeInputProductoDevuelto = (
    { target },
    detalle,
    indexProd
  ) => {
    const { value } = target
    // Crear una copia del arreglo de detalles
    const editFormDetalle = requisicionDevolucionTransformacion.detDev.map(
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

    setRequisicionDevolucionTransformacion({
      ...requisicionDevolucionTransformacion,
      detDev: editFormDetalle
    })
  }

  // Manejador de eliminacion de un detalle de devolucion
  const handleDeleteProductoDevuelto = (idItem) => {
    const dataDetalleProductosDevueltos =
      requisicionDevolucionTransformacion.detDev.filter((element) => {
        if (element.idProd !== idItem) {
          return true
        } else {
          return false
        }
      })

    setRequisicionDevolucionTransformacion({
      ...requisicionDevolucionTransformacion,
      detDev: dataDetalleProductosDevueltos
    })
  }

  // --------------- OPERACIONES EDIT Y DELETE DE REQUISICION ----------------------
  // operación de eliminacion
  const handleDeleteItemRequisicionTransformacion = (idItem, index) => {
    const dataDetalleRequisicionMateriales =
      requisicionMaterialesTransformacion.detReq.filter((element) => {
        if (element.idProd === idItem && element.indexProdFin === index) {
          return false
        } else {
          return true
        }
      })

    setRequisicionMaterialesTransformacion({
      ...requisicionMaterialesTransformacion,
      detReq: dataDetalleRequisicionMateriales
    })
  }

  // operación de edicion
  const handleEditItemRequisicionTransformacion = (
    { target },
    idItem,
    index
  ) => {
    const { value } = target
    const editFormDetalle = requisicionMaterialesTransformacion.detReq.map(
      (element) => {
        if (element.idProd === idItem && element.indexProdFin === index) {
          return {
            ...element,
            canReqProdLot: value
          }
        } else {
          return element
        }
      }
    )
    setRequisicionMaterialesTransformacion({
      ...requisicionMaterialesTransformacion,
      detReq: editFormDetalle
    })
  }

  // creamos la orden de transformacion
  const handleCrearOrdenTransformacion = async () => {
    // eliminar requisiciones en cero de devoluciones
    const detDevParser = []
    requisicionDevolucionTransformacion.detDev.forEach((element) => {
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

    const requisicionDevolucionTransformacionParser = {
      ...requisicionDevolucionTransformacion,
      detDev: detDevParser
    }

    // eliminar requisiciones en cero de materiales
    const { detReq } = requisicionMaterialesTransformacion
    const detReqParser = detReq.filter((element) => {
      const parserCantidad = parseFloat(element.canReqProdLot)
      if (!isNaN(parserCantidad) && parserCantidad !== 0) {
        return true
      } else {
        return false
      }
    })

    const requisicionMaterialesTransformacionParser = {
      ...requisicionMaterialesTransformacion,
      detReq: detReqParser
    }

    if (detReqParser.length !== 0) {
      // formamos la data para enviar al backend
      const formatData = {
        ordenTransformacion: requisicionTransformacion,
        requisicionMateriales: requisicionMaterialesTransformacionParser,
        requisicionDevolucion: requisicionDevolucionTransformacionParser
      }

      console.log(formatData)
      const resultPeticion = await createOrdenTransformacion(formatData)
      console.log(resultPeticion)
      const { message_error, description_error } = resultPeticion
      if (message_error.length === 0) {
        setfeedbackMessages({
          style_message: 'success',
          feedback_description_error: 'Guardado con exito'
        })
        handleClickFeeback()
        // cerramos la ventana
        setTimeout(() => {
          onNavigateBack()
        }, '1000')
      } else {
        // mostramos el mensaje de advertencia
        setfeedbackMessages({
          style_message: 'error',
          feedback_description_error: description_error
        })
        handleClickFeeback()
      }
    } else {
      let handleErrors = ''
      if (requisicionDevolucionTransformacion.detDev.length === 0) {
        handleErrors += 'No hay detalle de devolucion\n'
      }
      if (requisicionMaterialesTransformacion.detReq.length === 0) {
        handleErrors += 'No hay detalle de requisicion de materiales\n'
      }
      // mostramos el mensaje de advertencia
      setfeedbackMessages({
        style_message: 'warning',
        feedback_description_error: handleErrors
      })
      handleClickFeeback()
    }
  }

  return (
    <>
      <div className="container-fluid mx-3">
        <h1 className="mt-4 text-center">Crear Orden de transformacion</h1>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Datos de Producción</h6>
            <div className="card-body">
              <form>
                <div className="mb-3 row">
                  <div className="col-md-6 me-4">
                    <label htmlFor="nombre" className="form-label">
                      <b>Producto Intermedio</b>
                    </label>
                    <FilterProductoProduccionDynamic
                      defaultValue={idProdtInt}
                      onNewInput={onAddProductoProduccion}
                    />
                  </div>
                  <div className="col-md-2 d-flex">
                    <div className="col">
                      <label htmlFor="nombre" className="form-label">
                        <b>Número de Lote</b>
                      </label>
                      <input
                        type="text"
                        name="codLotProd"
                        value={codLotProd}
                        className="form-control"
                        readOnly
                      />
                    </div>
                    <ComponentSearchLotesDisponibles
                      idProdtInt={idProdtInt}
                      handleClickFeeback={handleClickFeeback}
                      setfeedbackMessages={setfeedbackMessages}
                      onConfirmOperation={onAddLoteProduccion}
                      disabled={idProdtInt === 0}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Detalle de transformacion</h6>
            {productosFinalesDisponiblesLote.length === 0 ||
            productosFinalesDisponiblesProductoIntermedio.length === 0
              ? (
                <p className="text-center mt-2 fs-4">
                No hay información disponible
                </p>
              )
              : (
                <div className="card-body row">
                  <div className="col">
                    <div className="card d-flex">
                      <h6 className="card-header">Producto origen</h6>
                      <div className="card-body">
                        {/* MANEJADORES DE CANTIDADES EN PRODUCTOS DE ORIGEN */}
                        <div className="row mb-4">
                          <div className="col">
                            <label htmlFor="nombre" className="form-label">
                              <b>Can. unidades</b>
                            </label>
                            <input
                              type="number"
                              value={canUndProdtOri}
                              disabled={true}
                              className={
                                canPesProdtOri < canPesProdtDes
                                  ? 'text-danger'
                                  : 'text-success'
                              }
                            />
                          </div>
                          <div className="col">
                            <label htmlFor="nombre" className="form-label">
                              <b>Can. peso (Kg)</b>
                            </label>
                            <input
                              type="number"
                              value={canPesProdtOri}
                              disabled={true}
                              className={
                                canPesProdtOri < canPesProdtDes
                                  ? 'text-danger'
                                  : 'text-success'
                              }
                            />
                          </div>
                        </div>
                        {/* PRODUCTOS */}
                        <FormControl>
                          <FormLabel id="demo-radio-buttons-group-label">
                          Productos
                          </FormLabel>
                          <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            name="radio-buttons-group"
                            value={idProdtOri}
                            onChange={onAddProductoFinalOrigen}
                          >
                            {productosFinalesDisponiblesLote.map((element) => (
                              <FormControlLabel
                                key={element.idProd}
                                value={element.idProd}
                                control={<Radio />}
                                label={`${element.nomProd}`}
                              />
                            ))}
                          </RadioGroup>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="card d-flex">
                      <h6 className="card-header">Productos destino</h6>
                      <div className="card-body">
                        {/* MANEJADORES DE CANTIDADES EN PRODUCTOS DE DESTINO */}
                        <div className="row mb-4">
                          <div className="col">
                            <label htmlFor="nombre" className="form-label">
                              <b>Can. unidades</b>
                            </label>
                            <input
                              type="number"
                              value={canUndProdtDes}
                              disabled={idProdtDes === 0}
                              onChange={handleChangeUnidadesTotalProductoDestino}
                            />
                          </div>
                          <div className="col">
                            <label htmlFor="nombre" className="form-label">
                              <b>Can. peso (Kg)</b>
                            </label>
                            <input
                              type="number"
                              value={canPesProdtDes}
                              disabled={idProdtDes === 0}
                              onChange={handleChangePesoTotalProductoDestino}
                            />
                          </div>
                        </div>
                        {/* PRODUCTOS */}
                        <FormControl>
                          <FormLabel id="demo-radio-buttons-group-label">
                          Productos
                          </FormLabel>
                          <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            name="radio-buttons-group"
                            value={idProdtDes}
                            onChange={onAddProductoFinalDestino}
                          >
                            {productosFinalesDisponiblesProductoIntermedio.map(
                              (element) => (
                                <FormControlLabel
                                  key={element.idProdFin}
                                  value={element.idProdFin}
                                  control={<Radio />}
                                  label={element.nomProd}
                                />
                              )
                            )}
                          </RadioGroup>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            {/* BOTON DE GENERACION */}
            <button
              type="button"
              className="btn btn-primary mb-2"
              onClick={calcularDetallesTransformacion}
              disabled={
                productosFinalesDisponiblesLote.length === 0 ||
                productosFinalesDisponiblesProductoIntermedio.length === 0
              }
            >
              Generar
            </button>
          </div>
        </div>
        <div className="row mt-4 mx-4">
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
                    value={requisicionDevolucionTransformacion.canDevUnd}
                    disabled={true}
                  />
                </div>
                <div className="col-3 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad peso (Kg)</b>
                  </label>
                  <input
                    type="number"
                    value={requisicionDevolucionTransformacion.canDevPes}
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
                      {requisicionDevolucionTransformacion.detDev.map(
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
        </div>
        <div className="row mt-4 mx-4">
          <div className="card d-flex">
            <h6 className="card-header">Detalle de requisicion</h6>
            <div className="card-body">
              <div className="mb-3 row">
                <div className="col-3 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad unidades</b>
                  </label>
                  <input
                    type="number"
                    value={requisicionMaterialesTransformacion.canReqUnd}
                    disabled={true}
                  />
                </div>
                <div className="col-3 me-4">
                  <label htmlFor="nombre" className="form-label">
                    <b>Cantidad peso (Kg)</b>
                  </label>
                  <input
                    type="number"
                    value={requisicionMaterialesTransformacion.canReqPes}
                    disabled={true}
                  />
                </div>
              </div>
              {/* DETALLE DE ENVASADO */}
              <div className="card text-bg-success d-flex mt-3">
                <h6 className="card-header">Detalle Envasado</h6>
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
                            <TableCell align="left" width={20}>
                              <b>Prod-Asociado</b>
                            </TableCell>
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
                          {requisicionMaterialesTransformacion.detReq.map(
                            (row, i) => {
                              if (row.idAre === 5) {
                                return (
                                  <RowEditDetalleRequisicionProduccion
                                    key={`${row.idProd}-${i}`}
                                    detalle={row}
                                    onChangeItemDetalle={
                                      handleEditItemRequisicionTransformacion
                                    }
                                    onDeleteItemRequisicion={
                                      handleDeleteItemRequisicionTransformacion
                                    }
                                    onValidate={onValidate}
                                  />
                                )
                              } else {
                                return null
                              }
                            }
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </div>
              </div>
              {/* DETALLE DE ENCAJONADO */}
              <div className="card text-bg-warning d-flex mt-3">
                <h6 className="card-header">Detalle Encajado</h6>
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
                            <TableCell align="left" width={20}>
                              <b>Prod-Asociado</b>
                            </TableCell>
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
                          {requisicionMaterialesTransformacion.detReq.map(
                            (row, i) => {
                              if (row.idAre === 6) {
                                return (
                                  <RowEditDetalleRequisicionProduccion
                                    key={`${row.idProd}-${i}`}
                                    detalle={row}
                                    onChangeItemDetalle={
                                      handleEditItemRequisicionTransformacion
                                    }
                                    onDeleteItemRequisicion={
                                      handleDeleteItemRequisicionTransformacion
                                    }
                                    onValidate={onValidate}
                                  />
                                )
                              } else {
                                return null
                              }
                            }
                          )}
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
        <div className="btn-toolbar mt-4 ms-4">
          <button
            type="button"
            onClick={onNavigateBack}
            className="btn btn-secondary me-2"
          >
            Volver
          </button>
          <button
            type="submit"
            onClick={handleCrearOrdenTransformacion}
            className="btn btn-primary"
          >
            Guardar
          </button>
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
