import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { getRequisicionGeneralMaterialesAlmacen } from '../../helpers/requisicion-materiales-almacen/getRequisicionGeneralMaterialesAlmacen'

export function useRequisicionMaterialesAlmacen () {
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
    const resultPeticion = await getRequisicionGeneralMaterialesAlmacen(formatData)
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

  useEffect(() => {
    traerDataRequisicionesGeneralesMateriales()
  }, [])

  return {
    requisicionMateriales,
    traerDataRequisicionesGeneralesMateriales
  }
}
