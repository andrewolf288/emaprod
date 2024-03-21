import { useEffect, useState } from 'react'
import { getRequisicionGeneralMaterialesByArea } from '../../helpers/requisicion-materiales/getRequisicionGeneralMaterialesByArea'
import { useAuth } from '../../../hooks/useAuth'

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
    console.log(formatData)
    const resultPeticion = await getRequisicionGeneralMaterialesByArea(formatData)
    try {
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        console.log(result)
        setRequisicionMateriales(result)
      } else {
        alert(description_error)
      }
    } catch (e) {
      alert(e)
    }
  }

  useEffect(() => {
    traerDataRequisicionesGeneralesMateriales()
  }, [])

  return { requisicionMateriales, traerDataRequisicionesGeneralesMateriales }
}
