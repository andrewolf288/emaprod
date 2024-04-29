import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'

export function useFormulasEmpaquetadoPromocional () {
  // estado
  const [formulasEmpaquetadoPromocional, setFormulasEmpaquetadoPromocional] = useState([])
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  const traerInformacionFormulasEmpaquetadoPromocional = async () => {
    const URL = '/produccion/formula-empaquetado-promocional/listFormulaEmpaquetadoPromocional.php'
    try {
      const { data } = await axiosInstance.post(URL, dateState)
      const { message_error, description_error, result } = data
      if (message_error.length === 0) {
        setFormulasEmpaquetadoPromocional(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  useEffect(() => {
    traerInformacionFormulasEmpaquetadoPromocional()
  }, [dateState])

  return {
    loading,
    formulasEmpaquetadoPromocional,
    dateState,
    handleStartDateChange,
    handleEndDateChange
  }
}
