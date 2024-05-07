import { useState } from 'react'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import { alertError, alertWarning } from '../../../utils/alerts/alertsCustoms'

export function useReporteCategoria () {
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()
  // menajador de categoria
  const [categoria, setCategoria] = useState(0)

  // controlador de cambio de categoria
  const onChangeCategoria = ({ id }) => {
    setCategoria(id)
  }

  // submit data filter to excel
  const submitDataFilterToExcel = (URL, data) => {
    if (categoria !== 0) {
      console.log(data)
      axiosInstance.post(URL, { ...data }, {
        responseType: 'blob'
      })
        .then((response) => {
          // Crear un enlace temporal para descargar el archivo
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const a = document.createElement('a')
          a.href = url
          a.download = 'reporte-emacal-F09.xlsx'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        })
        .catch((error) => alertError('Error al descargar el archivo', error))
    } else {
      alertWarning('Selecciona una categoria')
    }
  }

  return {
    loading,
    dateState,
    handleEndDateChange,
    handleStartDateChange,
    submitDataFilterToExcel,
    categoria,
    onChangeCategoria
  }
}
