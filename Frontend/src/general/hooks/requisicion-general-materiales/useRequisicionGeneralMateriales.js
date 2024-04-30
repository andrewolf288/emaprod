import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { createRoot } from 'react-dom/client'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { PDFRequisicionMateriales } from '../../components/requisicion-materiales/PDFRequisicionMateriales'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'

export function useRequisicionGeneralMateriales () {
  const { user } = useAuth()
  const [requisicionMateriales, setRequisicionMateriales] = useState([])
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  // funcion para traer requisicion general por área
  const traerDataRequisicionesGeneralesMateriales = async () => {
    const URL = '/general/requisicion-materiales/listRequisicionGeneralMaterialesByArea.php'
    try {
      const { data } = await axiosInstance.post(URL, { ...dateState, idAre: user.idAre })
      const { message_error, description_error, result } = data
      if (message_error.length === 0) {
        setRequisicionMateriales(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  // funcion para mostrar pdf
  const generatePDFRequisicionMateriales = async (idReqMat) => {
    const URL = '/general/requisicion-materiales/viewDevolucionRequisicionGeneralMateriales.php'
    try {
      const { data } = await axiosInstance.post(URL, { idReqMat })
      const { message_error, description_error, result } = data
      if (message_error.length === 0) {
        const formatData = {
          requisicion: result
        }
        const newWindow = window.open(
          '',
          'Requisicion materiales',
          'fullscreen=yes'
        )
        // Crear un contenedor específico para tu aplicación
        const appContainer = newWindow.document.createElement('div')
        newWindow.document.body.appendChild(appContainer)
        const root = createRoot(appContainer)
        root.render(<PDFRequisicionMateriales data={formatData} />)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.getMessage())
    }
  }

  useEffect(() => {
    traerDataRequisicionesGeneralesMateriales()
  }, [dateState])

  return {
    requisicionMateriales,
    generatePDFRequisicionMateriales,
    loading,
    dateState,
    handleStartDateChange,
    handleEndDateChange
  }
}
