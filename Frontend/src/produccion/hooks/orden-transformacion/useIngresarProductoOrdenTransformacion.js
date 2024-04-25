import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getIngresosProductoOrdenTransformacionById } from '../../helpers/requisicion-transformacion/getIngresosProductoOrdenTransformacionById'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { FormatDateTimeMYSQLNow } from '../../../utils/functions/FormatDate'
import { getMateriaPrimaById } from '../../../helpers/Referenciales/producto/getMateriaPrimaById'
import { createIngresosOrdenTransformacion } from '../../helpers/requisicion-transformacion/createIngresosOrdenTransformacion'

export function useIngresarProductoOrdenTransformacion () {
  const { idOrdTrans } = useParams()
  const navigate = useNavigate()

  const [ordenTransformacion, setOrdenTransformacion] = useState(
    {
      id: 0,
      correlativo: '',
      idProdtInt: 0,
      idProdc: 0,
      codLotProd: '',
      fecVenLotProd: '',
      idProdtOri: 0,
      nomProd1: '',
      canUndProdtOri: 0,
      canPesProdtOri: 0,
      idProdtDes: 0,
      idSubCla: 0,
      nomProd2: '',
      codProd2: '',
      canUndProdtDes: 0,
      canPesProdtDes: 0,
      fecCreOrdTrans: '',
      prodDetIng: []
    }
  )

  const [productoFinal, setproductoFinal] = useState({
    idProdFin: 0,
    cantidadIngresada: 0.0,
    fecEntSto: FormatDateTimeMYSQLNow()
  })

  const [detalleProductosFinales, setdetalleProductosFinales] = useState([])

  // Manejador de cantidad de presentacion final
  const handledFormCantidadIngresada = ({ target }) => {
    const { name, value } = target
    setproductoFinal({
      ...productoFinal,
      [name]: value
    })
  }

  // MANEJADOR DE PRODUCTO
  const onAddProductoFinalSubProducto = (value) => {
    setproductoFinal({
      ...productoFinal,
      idProdFin: value.id // id de de la presentacion final
    })
  }

  // Manejador de fecha de ingreso de presentacion final
  const onAddFecEntSto = (newfecEntSto) => {
    setproductoFinal({
      ...productoFinal,
      fecEntSto: newfecEntSto
    })
  }

  // AÑADIR PRODUCTOS FINALES AL DETALLE
  const handleAddProductoFinal = async (e) => {
    e.preventDefault()
    // comprobamos si se ingresaron los datos necesarios
    if (productoFinal.idProdFin !== 0 && productoFinal.cantidadIngresada > 0.0) {
      // traemos los datos de presentacion final
      const resultPeticion = await getMateriaPrimaById(productoFinal.idProdFin)
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        const nextItem = detalleProductosFinales.length + 1
        const formatData = {
          ...result[0],
          index: nextItem,
          idProdt: result[0].id,
          idProdc: 0,
          codLotProd: '',
          fecVenLotProd: '',
          fecEntSto: productoFinal.fecEntSto,
          canProdFin: productoFinal.cantidadIngresada
        }
        const dataDetalle = [...detalleProductosFinales, formatData]
        setdetalleProductosFinales(dataDetalle)
      } else {
        alertError(description_error)
      }
    } else {
      let handledErrors = ''
      if (productoFinal.idProdFin === 0) {
        handledErrors += 'No se ha proporcionado una presentación final\n'
      }
      if (productoFinal.cantidadIngresada <= 0) {
        handledErrors += 'No se ha proporcionado una cantidad\n'
      }

      alertWarning(handledErrors)
    }

    // reset de los filtros
    setproductoFinal({
      idProdFin: 0,
      cantidadIngresada: 0.0,
      fecEntSto: FormatDateTimeMYSQLNow()
    })
  }

  // editar detalle
  const editarDetalleIngresoOrdenTransformacion = (index, { target }) => {
    const { value } = target
    const findElementIndex = detalleProductosFinales.findIndex((element) => element.index === index)
    if (findElementIndex !== -1) {
      const updatedDetalleProductosFinales = [...detalleProductosFinales]
      updatedDetalleProductosFinales[findElementIndex] = {
        ...updatedDetalleProductosFinales[findElementIndex],
        canProdFin: value
      }
      setdetalleProductosFinales(updatedDetalleProductosFinales)
    }
  }

  // eliminar detalle
  const eliminarDetalleIngresoOrdenTransformacion = (index) => {
    const dataFilter = detalleProductosFinales.filter((element) => element.index !== index)
    const dataIndexFormat = dataFilter.map((element, index) => {
      return {
        ...element,
        index
      }
    })
    setdetalleProductosFinales(dataIndexFormat)
  }

  // agregar lote produccion detalle
  const agregarLoteProduccionIngresoOrdenTransformacion = (index, result) => {
    console.log(index, result)
    const findElementIndex = detalleProductosFinales.findIndex((element) => element.index === index)
    if (findElementIndex !== -1) {
      const updatedDetalleProductosFinales = [...detalleProductosFinales]
      updatedDetalleProductosFinales[findElementIndex] = {
        ...updatedDetalleProductosFinales[findElementIndex],
        idProdc: result.id,
        codLotProd: result.codLotProd,
        fecVenLotProd: result.fecVenLotProd
      }
      setdetalleProductosFinales(updatedDetalleProductosFinales)
    }
  }

  // delete lote produccion detalle
  const quitarLoteProduccionIngresoOrdenTransformacion = (index) => {
    const findElementIndex = detalleProductosFinales.findIndex((element) => element.index === index)
    if (findElementIndex !== -1) {
      const updatedDetalleProductosFinales = [...detalleProductosFinales]
      updatedDetalleProductosFinales[findElementIndex] = {
        ...updatedDetalleProductosFinales[findElementIndex],
        idProdc: 0,
        codLotProd: '',
        fecVenLotProd: ''
      }
      setdetalleProductosFinales(updatedDetalleProductosFinales)
    }
  }

  // crear ingresos de productos finales
  const crearIngresosDetalleIingresoOrdenTransformacion = async () => {
    // debemos comprobar que las cantidades y el lote de produccion haya sido ingresado
    const findProduccionEmpty = detalleProductosFinales.find((element) => element.idProdc === 0)
    const findCantidadIncorrecta = detalleProductosFinales.find((element) => parseInt(element.canProdFin) <= 0)

    if (findProduccionEmpty || findCantidadIncorrecta) {
      let handleErrors = ''
      if (findProduccionEmpty) {
        handleErrors += '- Asegurate de que todos los detalles tengan asignado un lote producción\n'
      }
      if (findCantidadIncorrecta) {
        handleErrors += '- Asegurate de que todos los detalles tengan asignada una cantidad mayor a 0'
      }
      alertWarning(handleErrors)
    } else {
      const formatData = {
        detProdFinLotProd: detalleProductosFinales,
        datosTransformacion: ordenTransformacion
      }
      const resultPeticion = await createIngresosOrdenTransformacion(formatData)
      const { message_error, description_error } = resultPeticion
      if (message_error.length === 0) {
        alertSuccess()
        // regresamos a la vista de lista de requisicion de materiales
        navigate(-1)
      } else {
        alertError(description_error)
      }
    }
  }

  // traer informacion orden de transformacion
  const traerInformacionOrdenTransformacion = async () => {
    const resultPeticion = await getIngresosProductoOrdenTransformacionById(idOrdTrans)
    const { message_error, description_error, result } = resultPeticion

    if (message_error.length === 0) {
      setOrdenTransformacion(result)
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerInformacionOrdenTransformacion()
  }, [])

  return {
    ordenTransformacion,
    productoFinal,
    detalleProductosFinales,
    onAddProductoFinalSubProducto,
    onAddFecEntSto,
    handledFormCantidadIngresada,
    handleAddProductoFinal,
    editarDetalleIngresoOrdenTransformacion,
    eliminarDetalleIngresoOrdenTransformacion,
    agregarLoteProduccionIngresoOrdenTransformacion,
    quitarLoteProduccionIngresoOrdenTransformacion,
    crearIngresosDetalleIingresoOrdenTransformacion
  }
}
