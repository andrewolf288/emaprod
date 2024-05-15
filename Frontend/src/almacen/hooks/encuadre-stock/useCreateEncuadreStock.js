import { useState } from 'react'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { alertError, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { useDropzone } from 'react-dropzone'

const almacenesAceptados = [1, 8, 7]

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

  const resetData = () => {
    setAlmacen(0)
    acceptedFiles.splice(0)
  }

  const createEncuadreStock = () => {
    if (acceptedFiles.length !== 0 && almacen !== 0) {
      const formData = new FormData()
      formData.append('encuadre_excel', acceptedFiles[0])
      formData.append('idAlm', almacen)

      const URL = '/almacen/encuadre-stock/createEncuadre.php'
      axiosInstance.post(URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(function (response) {
        // Crear un objeto Blob con la respuesta del servidor
          const blob = new Blob([response.data], { type: 'text/plain' })
          // Crear una URL para el objeto Blob
          const url = window.URL.createObjectURL(blob)
          // Crear un enlace para descargar el archivo
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'respuesta.txt')
          // Agregar el enlace al cuerpo del documento
          document.body.appendChild(link)
          // Hacer clic en el enlace para descargar el archivo
          link.click()
          // Limpiar la URL creada para el objeto Blob
          window.URL.revokeObjectURL(url)
        })
        .catch(function (error) {
          alertError('Error al procesar la solicitud:', error)
        })
      resetData()
    } else {
      let handleErrors = ''
      if (almacen === 0) {
        handleErrors += 'Debes seleccionar un almacen'
      }
      if (acceptedFiles.length === 0) {
        handleErrors += 'Debes subir un archivo'
      }
      alertWarning(handleErrors)
    }
  }

  return {
    loading,
    almacen,
    almacenesAceptados,
    acceptedFiles,
    onChangeValueAlmacen,
    generateReporteStock,
    files,
    getInputProps,
    getRootProps,
    createEncuadreStock,
    resetData
  }
}
