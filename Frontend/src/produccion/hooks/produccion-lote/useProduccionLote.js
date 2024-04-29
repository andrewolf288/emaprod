import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { getProduccionLote } from '../../helpers/produccion_lote/getProduccionLote'
import { getProduccionSumaryData } from '../../helpers/produccion_lote/getProduccionSumaryData'
import ReactDOM from 'react-dom'
import { PDFExample } from '../../components/pdf-components/PDFExample'
import config from '../../../config'
import axios from 'axios'

const generatePDF = (data) => {
  const windowName = data.produccion.numop
  const newWindow = window.open('', windowName, 'fullscreen=yes')
  ReactDOM.render(<PDFExample result={data} />, newWindow.document.body)
}

export function useProduccionLote () {
  const [produccionLote, setProduccionLote] = useState([])
  const [produccionLoteTemp, setProduccionLoteTemp] = useState([])

  const [filterData, setFilterData] = useState({
    codLotProd: '',
    numop: '',
    idProdt: 0
  })

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target
    setFilterData({
      ...filterData,
      [name]: value
    })
  }

  const onChangeProducto = ({ id }) => {
    setFilterData({
      ...filterData,
      idProdt: id
    })
  }

  // FUNCION PARA TRAER LA DATA DE REQUISICION MOLIENDA
  const obtenerDataProduccionLote = async (body = {}) => {
    const resultPeticion = await getProduccionLote(body)
    const { message_error, description_error, result } = resultPeticion

    if (message_error.length === 0) {
      setProduccionLote(result)
      setProduccionLoteTemp(result)
    } else {
      alertError(description_error)
    }
  }

  // boton de creacion de PDF sumary
  const handleButtonPDF = async (id) => {
    try {
      const { result } = await getProduccionSumaryData(id)
      // recorremos las requisiciones del proceso de produccion
      result?.requisiciones?.forEach((req) => {
        // esta variable guardara los totales: {idProdt: cantidad, idProdt: cantidad}
        const totales = {}
        // esta variable guardara los repetidos: {idProdt: {item}, idProdt: {item}}
        const repetidos = {}

        // recorremos el detalle de requisicion
        req.detalles.forEach((item) => {
          // obtenemos id y cantidad
          const { idProdt, canReqDet } = item
          // si aun no existe en totales, lo agregamos
          if (!totales[idProdt]) {
            totales[idProdt] = 0
          } else {
            // caso contrario chancamos repetios[idProdt] cada vez que se repita
            repetidos[idProdt] = { ...item }
          }

          // sumamos el total en totales[idProdt]
          totales[idProdt] += parseFloat(canReqDet)
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

        // agregamos el resumen de productos acumulados
        req.resumenProductos = totalesFinales
        // }
      })
      generatePDF(result)
    } catch (error) {
      // Mostramos una alerta
      alertError('Error al obtener los datos: ' + error)
    }
  }

  // funcion para descargar
  const exportarReporte = (idLotProd) => {
    const domain = config.API_URL
    const path = '/produccion/produccion-lote/generate_reporte_produccion.php'
    axios({
      url: domain + path,
      data: { idLotProd },
      method: 'POST',
      responseType: 'blob' // Importante para recibir datos binarios (Blob)
    })
      .then((response) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-produccion-${idLotProd}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      })
      .catch((error) => alertError('Error al descargar el archivo', error))
  }

  // MANEJO DE FILTROS
  useEffect(() => {
    const resultSearch = []
    produccionLote.forEach((data) => {
      if (
        (filterData.idProdt === data.idProdt ||
            filterData.idProdt === 0) &&
        (data.numop.includes(filterData.numop) || filterData.numop.length === 0) &&
        (data.codLotProd?.includes(filterData.codLotProd) ||
        filterData.codLotProd.length === 0)
      ) {
        resultSearch.push({ ...data })
      }
    })
    setProduccionLoteTemp(resultSearch)
  }, [filterData, produccionLote])

  useEffect(() => {
    obtenerDataProduccionLote()
  }, [])

  return {
    produccionLoteTemp,
    filterData,
    obtenerDataProduccionLote,
    handleButtonPDF,
    exportarReporte,
    handleFormFilter,
    onChangeProducto
  }
}
