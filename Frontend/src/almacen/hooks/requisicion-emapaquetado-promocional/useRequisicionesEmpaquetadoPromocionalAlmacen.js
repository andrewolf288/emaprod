import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { getRequisicionEmpaquetadoPromocionalAlmacen } from '../../helpers/requisicion-empaquetado-promocional/getRequisicionEmpaquetadoPromocionalAlmacen'

export function useRequisicionesEmpaquetadoPromocionalAlmacen () {
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

    const resultPeticion = await getRequisicionEmpaquetadoPromocionalAlmacen(formatData)
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

  useEffect(() => {
    traerInformacionRequisicionesEmpaquetadoPromocional()
  }, [])

  return {
    requisicionesEmpaquetadoPromocional,
    traerInformacionRequisicionesEmpaquetadoPromocional
  }
}
