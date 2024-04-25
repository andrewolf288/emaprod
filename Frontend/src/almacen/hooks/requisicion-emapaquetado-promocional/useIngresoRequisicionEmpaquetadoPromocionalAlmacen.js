import { useEffect, useState } from 'react'
import { getIngresosRequisicionEmpaquetadoPromocionalById } from '../../helpers/requisicion-empaquetado-promocional/getIngresosRequisicionEmpaquetadoPromocionalById'
import { useParams } from 'react-router-dom'
import { alertError, alertSuccess } from '../../../utils/alerts/alertsCustoms'
import { updateIngresoRequisicionEmpaquetadoPromocional } from '../../helpers/requisicion-empaquetado-promocional/updateIngresoRequisicionEmpaquetadoPromocional'
import { deleteIngesoRequisicionEmpaquetadoPromocional } from '../../helpers/requisicion-empaquetado-promocional/deleteIngesoRequisicionEmpaquetadoPromocional'
import { createEntradaRequisicionEmpaquetadoPromocional } from '../../helpers/requisicion-empaquetado-promocional/createEntradaRequisicionEmpaquetadoPromocional'
import { DiaJuliano, letraAnio } from '../../../utils/functions/FormatDate'

export function useIngresoRequisicionEmpaquetadoPromocionalAlmacen () {
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
    detIngReqEmpProm: []
  })

  // actualizar ingreso requisicion empaquetado promocional
  const onUpdateIngresoRequisicionEmpaquetadoPromocional = async (detalle, newInput) => {
    const resultPeticion = await updateIngresoRequisicionEmpaquetadoPromocional(detalle, newInput)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      alertSuccess()
      traerIngresosRequisicionEmpaquetadoPromocional()
    } else {
      alertError(description_error)
    }
  }

  // eliminar ingreso requisicion empaquetado promocional
  const onDeleteIngresoRequisicionEmpaquetadoPromocional = async (detalle) => {
    const resultPeticion = await deleteIngesoRequisicionEmpaquetadoPromocional(detalle)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      alertSuccess()
      traerIngresosRequisicionEmpaquetadoPromocional()
    } else {
      alertError(description_error)
    }
  }

  // crear ingreso requisicion empaquetado promocional
  const onCreateIngresoRequisicionEmpaquetadoPromocional = async (detalle) => {
    const letAniEntSto = letraAnio(detalle.fecProdIng)
    const diaJulEntSto = DiaJuliano(detalle.fecProdIng)
    const formatData = {
      ...detalle,
      letAniEntSto,
      diaJulEntSto
    }
    const resultPeticion = await createEntradaRequisicionEmpaquetadoPromocional(formatData)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      alertSuccess()
      traerIngresosRequisicionEmpaquetadoPromocional()
    } else {
      alertError(description_error)
    }
  }

  // traer ingresos requisicion empaquetado promocional
  const traerIngresosRequisicionEmpaquetadoPromocional = async () => {
    const resultPeticion = await getIngresosRequisicionEmpaquetadoPromocionalById(idReqEmpProm)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setRequisicionEmpaquetadoPromocional(result)
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerIngresosRequisicionEmpaquetadoPromocional()
  }, [])

  return {
    requisicionEmpaquetadoPromocional,
    onUpdateIngresoRequisicionEmpaquetadoPromocional,
    onDeleteIngresoRequisicionEmpaquetadoPromocional,
    onCreateIngresoRequisicionEmpaquetadoPromocional
  }
}
