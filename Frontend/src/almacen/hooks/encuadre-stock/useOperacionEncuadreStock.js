import { useEffect, useState } from 'react'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import { alertError } from '../../../utils/alerts/alertsCustoms'

export function useOperacionEncuadreStock () {
  const [operacionesEncuadreStock, setOperacionesEncuadreStock] = useState([])
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  const traerInformacionOperacionesEncuadreStock = async () => {
    const URL = '/almacen/encuadre-stock/listOperacionEncuadre.php'
    try {
      const { data } = await axiosInstance.post(URL, dateState)
      const { message_error, description_error, result } = data
      if (message_error.length === 0) {
        setOperacionesEncuadreStock(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  useEffect(() => {
    traerInformacionOperacionesEncuadreStock()
  }, [dateState])

  return {
    operacionesEncuadreStock,
    loading,
    dateState,
    handleStartDateChange,
    handleEndDateChange
  }
}
