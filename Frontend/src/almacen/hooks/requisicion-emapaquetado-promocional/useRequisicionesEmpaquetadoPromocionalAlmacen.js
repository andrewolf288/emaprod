import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'

export function useRequisicionesEmpaquetadoPromocionalAlmacen () {
  const [requisicionesEmpaquetadoPromocional, setRequisicionesEmpaquetadoPromocional] = useState([])
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  const traerInformacionRequisicionesEmpaquetadoPromocional = async () => {
    const URL = '/almacen/requisicion-empaquetado-promocional/lisRequisicionesEmpaquetadoPromocional.php'
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

  useEffect(() => {
    traerInformacionRequisicionesEmpaquetadoPromocional()
  }, [dateState])

  return {
    requisicionesEmpaquetadoPromocional,
    loading,
    dateState,
    handleStartDateChange,
    handleEndDateChange
  }
}
