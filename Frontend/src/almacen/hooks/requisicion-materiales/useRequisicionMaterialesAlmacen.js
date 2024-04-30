import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'

export function useRequisicionMaterialesAlmacen () {
  const { user } = useAuth()
  const [requisicionMateriales, setRequisicionMateriales] = useState([])
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  // funcion para traer requisicion general por área
  const traerDataRequisicionesGeneralesMateriales = async () => {
    const URL = '/general/requisicion-materiales/listRequisicionGeneralMateriales.php'
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

  useEffect(() => {
    traerDataRequisicionesGeneralesMateriales()
  }, [dateState])

  return {
    requisicionMateriales,
    loading,
    dateState,
    handleStartDateChange,
    handleEndDateChange
  }
}
