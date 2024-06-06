import { useState } from 'react'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { alertError, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { mostrarMesYAnio } from '../../../utils/functions/FormatDate'

export function useReporteTrazabilidadLote () {
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()
  const [dataLoteProduccion, setDataLoteProducccion] = useState({
    idProdc: null,
    codLotProd: '',
    fecVenLotProd: ''
  })

  const textInfoLote = dataLoteProduccion.idProdc
    ? `${dataLoteProduccion.codLotProd} - ${mostrarMesYAnio(dataLoteProduccion.fecVenLotProd)}`
    : 'No asignado'

  const agregarLoteProduccions = (index, result) => {
    const formatData = {
      idProdc: result.id,
      codLotProd: result.codLotProd,
      fecVenLotProd: result.fecVenLotProd

    }
    setDataLoteProducccion(formatData)
  }

  // delete lote produccion detalle
  const quitarLoteProduccion = (index) => {
    setDataLoteProducccion(
      {
        idProdc: null,
        codLotProd: '',
        fecVenLotProd: ''
      }
    )
  }

  const submitDataFilterToExcel = (URL, title) => {
    if (dataLoteProduccion.idProdc === null) {
      alertWarning('Debe seleccionar un lote de producción')
    } else {
      console.log(dataLoteProduccion)
      axiosInstance.post(URL, dataLoteProduccion, {
        responseType: 'blob'
      })
        .then((response) => {
          // Crear un enlace temporal para descargar el archivo
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const a = document.createElement('a')
          a.href = url
          a.download = title
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        })
        .catch((error) => alertError('Error al descargar el archivo', error))
    }
  }

  return {
    loading,
    dataLoteProduccion,
    submitDataFilterToExcel,
    agregarLoteProduccions,
    quitarLoteProduccion,
    textInfoLote
  }
}
