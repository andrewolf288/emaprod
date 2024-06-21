import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import { alertError } from '../../../utils/alerts/alertsCustoms'

export function useExportParteEntrada () {
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  const submitDataFilterToExcel = (URL, data, title) => {
    axiosInstance.post(URL, { ...data }, {
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

  return {
    loading,
    dateState,
    handleEndDateChange,
    handleStartDateChange,
    submitDataFilterToExcel
  }
}
