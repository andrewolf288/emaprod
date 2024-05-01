import { useState } from 'react'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { useDropzone } from 'react-dropzone'

export function useCreateEncuadreStock () {
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()
  const [almacen, setAlmacen] = useState(0)
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone()

  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ))

  const onChangeValueAlmacen = ({ id }) => {
    setAlmacen(id)
  }

  const generateReporteStock = () => {
    if (almacen === 0) {
      alertWarning('Debes seleccionar un almacen')
    } else {
      const URL = '/almacen/encuadre-stock/downloadPlantillaEncuadre.php'
      axiosInstance.post(URL, { idAlm: almacen }, {
        responseType: 'blob'
      })
        .then((response) => {
          // Crear un enlace temporal para descargar el archivo
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const a = document.createElement('a')
          a.href = url
          a.download = 'plantilla-cuadre-stock.xlsx'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        })
        .catch((error) => alertError('Error al descargar el archivo', error))
    }
  }

  const createEncuadreStock = () => {
    if (acceptedFiles.length !== 0) {
      alertSuccess()
    } else {
      alertWarning('Debes subir un archivo')
    }
  }

  return {
    loading,
    almacen,
    onChangeValueAlmacen,
    generateReporteStock,
    files,
    getInputProps,
    getRootProps,
    createEncuadreStock
  }
}
