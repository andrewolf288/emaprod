import { useState } from 'react'
import { parserInputQuantity, parserQuantityRequisicion } from '../../../utils/functions/validations'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { getFormulaEmpaquetadoPromocionalByProducto } from '../../helpers/requisicion-empaquetado-promocional/getFormulaEmpaquetadoPromocionalByProducto'
import { createRequisicionEmpaquetadoPromocional } from '../../helpers/requisicion-empaquetado-promocional/createRequisicionEmpaquetadoPromocional'
import { useNavigate } from 'react-router-dom'

export function useCreateRequisicionEmpaquetadoPromocional () {
  const navigate = useNavigate()
  const [requisicionEmpaquetadoPromocional, setRequisicionEmpaquetadoPromocional] = useState({
    idProdt: 0,
    canReqEmpPro: 0,
    detReqEmpProm: []
  })

  // cambiar de producto combo
  const onChangeProductoRequisicionEmpaquetadoPromocional = (value) => {
    const { id } = value
    setRequisicionEmpaquetadoPromocional(
      {
        ...requisicionEmpaquetadoPromocional,
        idProdt: id
      }
    )
  }

  // ingresar cantidad a transformar
  const onChangeCantidadRequisicionEmpaquetadoPromocional = ({ target }) => {
    const { value } = target
    setRequisicionEmpaquetadoPromocional({
      ...requisicionEmpaquetadoPromocional,
      canReqEmpPro: value
    })
  }

  // funcion para buscar formula de combo
  const traerFormulaProductoEmpaquetadoPromocional = async () => {
    const formatCantidad = parserInputQuantity(requisicionEmpaquetadoPromocional.canReqEmpPro)
    let handleErrors = ''
    if (requisicionEmpaquetadoPromocional.idProdt === 0 || formatCantidad <= 0) {
      if (requisicionEmpaquetadoPromocional.idProdt === 0) {
        handleErrors += 'Debes seleccionar un produto promocional'
      }
      if (formatCantidad <= 0) {
        handleErrors += 'Debes seleccionar una cantidad mayor a 0'
      }
      alertWarning(handleErrors)
    } else {
      const resultPeticion = await getFormulaEmpaquetadoPromocionalByProducto(requisicionEmpaquetadoPromocional.idProdt)
      const { message_error, description_error, result } = resultPeticion

      if (message_error.length === 0) {
        const { detForEmpProm, detForEmpPromReq } = result

        const auxDetalleRequisicion = []
        detForEmpProm.forEach((element) => {
          const { canEmpPromDet } = element
          const totalCantidad = parseInt(canEmpPromDet) * formatCantidad
          const auxElement = {
            ...element,
            idProdc: null,
            codLotProd: '',
            fecVenLotProd: '',
            canReqEmpPromUnd: canEmpPromDet,
            canReqEmpPromDet: totalCantidad,
            esProdFin: 1,
            esMatReq: 0
          }
          auxDetalleRequisicion.push(auxElement)
        })

        detForEmpPromReq.forEach((element) => {
          const { canForEmpPromReq } = element
          const totalCantidad = parserQuantityRequisicion(element.simMed, (canForEmpPromReq * formatCantidad))
          const auxElement = {
            ...element,
            idProdc: null,
            codLotProd: '',
            fecVenLotProd: '',
            canReqEmpPromUnd: canForEmpPromReq,
            canReqEmpPromDet: totalCantidad,
            esProdFin: 0,
            esMatReq: 1
          }
          auxDetalleRequisicion.push(auxElement)
        })

        setRequisicionEmpaquetadoPromocional({
          ...requisicionEmpaquetadoPromocional,
          detReqEmpProm: auxDetalleRequisicion
        })
      } else {
        alertError(description_error)
      }
    }
  }

  // actualizar detalle de requisicion
  const onUpdateRequisicionEmpaquetadoPromocionalDetalle = ({ target }, idProdt) => {
    const { value } = target
    const findIndex = requisicionEmpaquetadoPromocional.detReqEmpProm.findIndex((element) => element.idProdt === idProdt)
    if (findIndex !== -1) {
      const auxData = [...requisicionEmpaquetadoPromocional.detReqEmpProm]
      auxData[findIndex] = {
        ...auxData[findIndex],
        canReqEmpPromDet: value
      }
      setRequisicionEmpaquetadoPromocional({
        ...requisicionEmpaquetadoPromocional,
        detReqEmpProm: auxData
      })
    }
  }

  // eliminar detalle de requisicion
  const onDeleteRequisicionEmpaquetadoPromocionalDetalle = (idProdt) => {
    const filterData = requisicionEmpaquetadoPromocional.detReqEmpProm.filter((element) => element.idProdt !== idProdt)
    setRequisicionEmpaquetadoPromocional({
      ...requisicionEmpaquetadoPromocional,
      detReqEmpProm: filterData
    })
  }

  // agregar lote produccion detalle
  const agregarLoteProduccionIngresoRequisicionEmpaquetadoPromocional = (idProdt, result) => {
    const findElementIndex = requisicionEmpaquetadoPromocional.detReqEmpProm.findIndex((element) => element.idProdt === idProdt)
    if (findElementIndex !== -1) {
      const updatedDetalleProductosFinales = [...requisicionEmpaquetadoPromocional.detReqEmpProm]
      updatedDetalleProductosFinales[findElementIndex] = {
        ...updatedDetalleProductosFinales[findElementIndex],
        idProdc: result.id,
        codLotProd: result.codLotProd,
        fecVenLotProd: result.fecVenLotProd
      }
      setRequisicionEmpaquetadoPromocional({
        ...requisicionEmpaquetadoPromocional,
        detReqEmpProm: updatedDetalleProductosFinales
      })
    }
  }

  // delete lote produccion detalle
  const quitarLoteProduccionIngresoRequisicionEmpaquetadoPromocional = (idProdt) => {
    const findElementIndex = requisicionEmpaquetadoPromocional.detReqEmpProm.findIndex((element) => element.idProdt === idProdt)
    if (findElementIndex !== -1) {
      const updatedDetalleProductosFinales = [...requisicionEmpaquetadoPromocional.detReqEmpProm]
      updatedDetalleProductosFinales[findElementIndex] = {
        ...updatedDetalleProductosFinales[findElementIndex],
        idProdc: null,
        codLotProd: '',
        fecVenLotProd: ''
      }
      setRequisicionEmpaquetadoPromocional({
        ...requisicionEmpaquetadoPromocional,
        detReqEmpProm: updatedDetalleProductosFinales
      })
    }
  }

  // crear requisicion empaquetado promocional
  const crearRequisicionEmpaquetadoPromocional = async () => {
    const resultPeticion = await createRequisicionEmpaquetadoPromocional(requisicionEmpaquetadoPromocional)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      alertSuccess()
      navigate(-1)
    } else {
      alertError(description_error)
    }
  }

  return {
    requisicionEmpaquetadoPromocional,
    onChangeProductoRequisicionEmpaquetadoPromocional,
    onChangeCantidadRequisicionEmpaquetadoPromocional,
    traerFormulaProductoEmpaquetadoPromocional,
    onUpdateRequisicionEmpaquetadoPromocionalDetalle,
    onDeleteRequisicionEmpaquetadoPromocionalDetalle,
    crearRequisicionEmpaquetadoPromocional,
    agregarLoteProduccionIngresoRequisicionEmpaquetadoPromocional,
    quitarLoteProduccionIngresoRequisicionEmpaquetadoPromocional
  }
}
