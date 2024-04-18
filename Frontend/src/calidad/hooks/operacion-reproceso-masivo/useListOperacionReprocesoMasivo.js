import { useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { useGetOperacionReprocesoMasivo } from './useGetOperacionReprocesoMasivo'

export function useListOperacionReprocesoMasivo () {
  const [operacionReprocesoMasivo, setOperacionReprocesoMasivo] = useState([])

  const traerInformacionOperacionReprocesoMasivo = async (body = null) => {
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
    const resultPeticion = await useGetOperacionReprocesoMasivo(formatData)
    try {
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        setOperacionReprocesoMasivo(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  return {
    operacionReprocesoMasivo,
    traerInformacionOperacionReprocesoMasivo
  }
}
