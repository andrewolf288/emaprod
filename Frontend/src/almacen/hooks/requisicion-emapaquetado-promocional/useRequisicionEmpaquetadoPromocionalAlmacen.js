import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRequisicionEmpaquetadoPromocionalAlmacenById } from '../../helpers/requisicion-empaquetado-promocional/getRequisicionEmpaquetadoPromocionalAlmacenById'
import { alertError, alertSuccess } from '../../../utils/alerts/alertsCustoms'
import { updateRequisicionEmpaquetadoPromocional } from '../../helpers/requisicion-empaquetado-promocional/updateRequisicionEmpaquetadoPromocional'
import { deleteRequisicionEmpaquetadoPromocional } from '../../helpers/requisicion-empaquetado-promocional/deleteRequisicionEmpaquetadoPromocional'
import { createSalidaRequisicionEmpaquetadoPromocional } from '../../helpers/requisicion-empaquetado-promocional/createSalidaRequisicionEmpaquetadoPromocional'

export function useRequisicionEmpaquetadoPromocionalAlmacen () {
  const { idReqEmpProm } = useParams()
  const [requisicionEmpaquetadoPromocional, setRequisicionEmpaquetadoPromocional] = useState({
    correlativo: '',
    idProdt: 0,
    nomProd: '',
    simMed: '',
    canReqEmpPro: 0,
    idReqEst: 0,
    desReqEst: '',
    fecCreReqEmpProm: '',
    detReqEmpProm: []
  })

  // traer informacion de requisicion empaquetado promocional
  const traerInformacionRequisicionEmpaquetadoPromocional = async () => {
    const resultPeticion = await getRequisicionEmpaquetadoPromocionalAlmacenById(idReqEmpProm)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setRequisicionEmpaquetadoPromocional(result)
    } else {
      alertError(description_error)
    }
  }

  // actualizar requisicion empaquetado promocional
  const onUpdateRequisicionEmpaquetadoPromocional = async (detalle, inputValue) => {
    const resultPeticion = await updateRequisicionEmpaquetadoPromocional(detalle, inputValue)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      // alerta de success
      alertSuccess()
      // actualizar datos
      traerInformacionRequisicionEmpaquetadoPromocional()
    } else {
      alertError(description_error)
    }
  }

  // eliminar requisicion empaquetado promocional
  const onDeleteRequisicionEmpaquetadoPromocional = async (detalle) => {
    const resultPeticion = await deleteRequisicionEmpaquetadoPromocional(detalle)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      // alerta de success
      alertSuccess()
      // actualizar datos
      traerInformacionRequisicionEmpaquetadoPromocional()
    } else {
      alertError(description_error)
    }
  }

  // realizar salida requisicion empaquetado promocional
  const onCheckRequisicionEmpaquetadoPromocional = async (detalle) => {
    console.log(detalle)
    const resultPeticion = await createSalidaRequisicionEmpaquetadoPromocional(detalle)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      // alerta de success
      alertSuccess()
      // actualizar datos
      traerInformacionRequisicionEmpaquetadoPromocional()
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerInformacionRequisicionEmpaquetadoPromocional()
  }, [])

  return {
    idReqEmpProm,
    requisicionEmpaquetadoPromocional,
    onUpdateRequisicionEmpaquetadoPromocional,
    onDeleteRequisicionEmpaquetadoPromocional,
    onCheckRequisicionEmpaquetadoPromocional
  }
}
