import { useEffect, useState } from 'react'
import { getRequisicionGeneralMaterialesByArea } from '../../helpers/requisicion-materiales/getRequisicionGeneralMaterialesByArea'
import { useAuth } from '../../../hooks/useAuth'
import { createRoot } from 'react-dom/client'
import { getRequisicionGeneralMaterialById } from '../../helpers/requisicion-materiales/getRequisicionGeneralMaterialById'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { PDFRequisicionMateriales } from '../../components/requisicion-materiales/PDFRequisicionMateriales'

export function useRequisicionGeneralMateriales () {
  const { user } = useAuth()
  const [requisicionMateriales, setRequisicionMateriales] = useState([])

  // funcion para traer requisicion general por área
  const traerDataRequisicionesGeneralesMateriales = async (body = null) => {
    let formatData = { idAre: user.idAre }
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
    const resultPeticion = await getRequisicionGeneralMaterialesByArea(formatData)
    try {
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        setRequisicionMateriales(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  // funcion para mostrar pdf
  const generatePDFRequisicionMateriales = async (idReqMat) => {
    const resultPeticion = await getRequisicionGeneralMaterialById(idReqMat)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      const formatData = {
        requisicion: result
      }
      const newWindow = window.open(
        '',
        'Requisicion materiales',
        'fullscreen=yes'
      )
      // Crear un contenedor específico para tu aplicación
      const appContainer = newWindow.document.createElement('div')
      newWindow.document.body.appendChild(appContainer)
      const root = createRoot(appContainer)
      root.render(<PDFRequisicionMateriales data={formatData} />)
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerDataRequisicionesGeneralesMateriales()
  }, [])

  return {
    requisicionMateriales,
    traerDataRequisicionesGeneralesMateriales,
    generatePDFRequisicionMateriales
  }
}
