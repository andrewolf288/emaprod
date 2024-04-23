import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { getFormulasEmpaquetadoPromocional } from '../../helpers/formula-empaquetado-promocional/getFormulasEmpaquetadoPromocional'

export function useFormulasEmpaquetadoPromocional () {
  const [formulasEmpaquetadoPromocional, setFormulasEmpaquetadoPromocional] = useState([])

  const traerInformacionFormulasEmpaquetadoPromocional = async (body = null) => {
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

    const resultPeticion = await getFormulasEmpaquetadoPromocional(formatData)
    console.log(resultPeticion)
    try {
      const { message_error, description_error, result } = resultPeticion
      if (message_error.length === 0) {
        console.log(result)
        setFormulasEmpaquetadoPromocional(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  useEffect(() => {
    traerInformacionFormulasEmpaquetadoPromocional()
  }, [])

  return {
    formulasEmpaquetadoPromocional,
    traerInformacionFormulasEmpaquetadoPromocional
  }
}
