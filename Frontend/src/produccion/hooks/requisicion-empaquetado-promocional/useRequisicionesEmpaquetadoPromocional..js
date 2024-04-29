import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { createRoot } from 'react-dom/client'
import { PDFRequisicionEmpaquetadoPromocional } from '../../components/componentes-requisicion-empaquetado-promocional/PDFRequisicionEmpaquetadoPromocional'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'

export function useRequisicionesEmpaquetadoPromocional () {
  // estado de los datos
  const [requisicionesEmpaquetadoPromocional, setRequisicionesEmpaquetadoPromocional] = useState([])
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  const traerInformacionRequisicionesEmpaquetadoPromocional = async () => {
    const URL = '/produccion/requisicion-empaquetado-promocional/listRequisicionEmpaquetadoPromocional.php'
    try {
      const { data } = await axiosInstance.post(URL, dateState)
      const { message_error, description_error, result } = data
      if (message_error.length === 0) {
        setRequisicionesEmpaquetadoPromocional(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  // EXPORT PDF REQUISICION
  const exportPDFRequisicionTransformacion = async (idReqEmpProm) => {
    // primero hacemos una requisicion para traer los datos necesarios
    const URL =
      '/produccion/requisicion-empaquetado-promocional/reportPDFRequisicionEmpaquetadoPromocional.php'
    axiosInstance.post(URL, { idReqEmpProm })
      .then((response) => {
        const { data } = response
        const { message_error, description_error, result } = data

        if (message_error.length === 0) {
          const newWindow = window.open('', 'Requisicion-Empaquetado-Promocional', 'fullscreen=yes')
          // Crear un contenedor específico para tu aplicación
          const appContainer = newWindow.document.createElement('div')
          newWindow.document.body.appendChild(appContainer)
          const root = createRoot(appContainer)
          root.render(<PDFRequisicionEmpaquetadoPromocional data={result} />)
        } else {
          alert(description_error)
        }
      })
      .catch((error) => alert('Error al descargar el archivo', error))
  }

  useEffect(() => {
    traerInformacionRequisicionesEmpaquetadoPromocional()
  }, [dateState])

  return {
    requisicionesEmpaquetadoPromocional,
    exportPDFRequisicionTransformacion,
    loading,
    dateState,
    handleEndDateChange,
    handleStartDateChange
  }
}
