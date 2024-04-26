import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { getRequisicionEmpaquetadoPromocional } from '../../helpers/requisicion-empaquetado-promocional/getRequisicionEmpaquetadoPromocional'
import config from '../../../config'
import axios from 'axios'
import { createRoot } from 'react-dom/client'
import { PDFRequisicionEmpaquetadoPromocional } from '../../components/componentes-requisicion-empaquetado-promocional/PDFRequisicionEmpaquetadoPromocional'

export function useRequisicionesEmpaquetadoPromocional () {
  const [requisicionesEmpaquetadoPromocional, setRequisicionesEmpaquetadoPromocional] = useState([])

  const traerInformacionRequisicionesEmpaquetadoPromocional = async (body = null) => {
    let formatData = {}
    if (body === null) {
      formatData = {
        ...formatData,
        fechaInicio: '',
        fechaFin: ''
      }
    } else {
      formatData = {
        ...formatData,
        ...body
      }
    }

    const resultPeticion = await getRequisicionEmpaquetadoPromocional(formatData)
    try {
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        setRequisicionesEmpaquetadoPromocional(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  // EXPORT PDF REQUISICION
  const exportPDFRequisicionTransformacion = async (idReqEmpProm) => {
    // primero hacemos una requisicion para traer los datos necesarios
    const domain = config.API_URL
    const path =
      '/produccion/requisicion-empaquetado-promocional/reportPDFRequisicionEmpaquetadoPromocional.php'
    axios({
      url: domain + path,
      data: {
        idReqEmpProm
      },
      method: 'POST'
    })
      .then((response) => {
        const { data } = response
        const { message_error, description_error, result } = data

        if (message_error.length === 0) {
          const newWindow = window.open('', 'Requisicion-Empaquetado-Promocional', 'fullscreen=yes')
          // Crear un contenedor específico para tu aplicación
          const appContainer = newWindow.document.createElement('div')
          newWindow.document.body.appendChild(appContainer)
          const root = createRoot(appContainer)
          root.render(<PDFRequisicionEmpaquetadoPromocional data={result} />)
        } else {
          alert(description_error)
        }
      })
      .catch((error) => alert('Error al descargar el archivo', error))
  }

  useEffect(() => {
    traerInformacionRequisicionesEmpaquetadoPromocional()
  }, [])

  return {
    requisicionesEmpaquetadoPromocional,
    traerInformacionRequisicionesEmpaquetadoPromocional,
    exportPDFRequisicionTransformacion
  }
}
