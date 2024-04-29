import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'

export function useRequisicionSubProducto () {
  const [requisicionSubproductos, setRequisicionSubproductos] = useState([])
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  // traer informacion de requiscion de subproductos
  const traerDataRequisicionesSubproductos = async () => {
    const URL = '/produccion/requisicion-subproducto/listRequisicionSubproducto.php'
    console.log(dateState)
    const { data } = await axiosInstance.post(URL, dateState)
    try {
      const { message_error, description_error, result } = data
      if (message_error.length === 0) {
        setRequisicionSubproductos(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  useEffect(() => {
    traerDataRequisicionesSubproductos()
  }, [dateState])

  return {
    requisicionSubproductos,
    dateState,
    handleStartDateChange,
    handleEndDateChange,
    loading
  }
}
