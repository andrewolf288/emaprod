import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { getRequisicionSubproducto } from '../../helpers/requisicion-subproducto/getRequisicionSubproducto'

export function useRequisicionSubProducto () {
  const [requisicionSubproductos, setRequisicionSubproductos] = useState([])

  // traer informacion de requiscion de subproductos
  const traerDataRequisicionesSubproductos = async (body = null) => {
    let formatData = {}
    if (body === null) {
      formatData = {
        fechaInicio: '',
        fechaFin: ''
      }
    } else {
      formatData = {
        ...body
      }
    }
    const resultPeticion = await getRequisicionSubproducto(formatData)
    try {
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        setRequisicionSubproductos(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  useEffect(() => {
    traerDataRequisicionesSubproductos()
  }, [])

  return {
    requisicionSubproductos,
    traerDataRequisicionesSubproductos
  }
}
