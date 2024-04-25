import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { getIngresosRequisicionEmpaquetadoPromocionalById } from '../../helpers/requisicion-empaquetado-promocional/getIngresosRequisicionEmpaquetadoPromocionalById'
import { FormatDateTimeMYSQLNow, FormatDateTimeMYSQLNowPlusYears } from '../../../utils/functions/FormatDate'
import { createIngresoRequisicionEmpaquetadoPromocional } from '../../helpers/requisicion-empaquetado-promocional/createIngresoRequisicionEmpaquetadoPromocional'
import { parserInputQuantity } from '../../../utils/functions/validations'

export function useIngresarRequisicionEmpaquetadoPromocional () {
  const { idReqEmpProm } = useParams()
  const navigate = useNavigate()
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

  const [productoFinal, setproductoFinal] = useState({
    idReqEmpProm: 0,
    idProdt: 0,
    nomProd: '',
    desCla: '',
    desSubCla: '',
    simMed: '',
    canProdFin: 0.0,
    fecEntSto: '',
    fecVenEntProdFin: ''
  })

  const handleChangeInputProductoFinal = async ({ target }) => {
    const { value, name } = target
    setproductoFinal({ ...productoFinal, [name]: value })
  }

  const crearIngresoRequisicionEmpaquetadoPromocional = async (e) => {
    e.preventDefault()
    const formatCantidad = parserInputQuantity(productoFinal.canProdFin)
    if (formatCantidad > 0) {
      const resultPeticion = await createIngresoRequisicionEmpaquetadoPromocional(productoFinal)
      const { message_error, description_error } = resultPeticion
      if (message_error.length === 0) {
        alertSuccess()
        navigate(-1)
      } else {
        alertError(description_error)
      }
    } else {
      alertWarning('Debes proporcionar una cantidad mayor a 0')
    }
  }

  // traer ingresos requisicion empaquetado promocional
  const traerIngresosRequisicionEmpaquetadoPromocional = async () => {
    const resultPeticion = await getIngresosRequisicionEmpaquetadoPromocionalById(idReqEmpProm)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      let year = 0
      // si la UM de al presentacion final es LTS, entonces year = 1
      if (result.idSubCla === 50) {
        year = 1 // frescos
      } else {
        year = 4 // otros
      }
      setRequisicionEmpaquetadoPromocional(result)
      setproductoFinal({
        ...productoFinal,
        idReqEmpProm,
        idProdt: result.idProdt,
        nomProd: result.nomProd,
        desCla: result.desCla,
        desSubCla: result.desSubCla,
        simMed: result.simMed,
        fecEntSto: FormatDateTimeMYSQLNow(),
        fecVenEntProdFin: FormatDateTimeMYSQLNowPlusYears(year, FormatDateTimeMYSQLNow())
      })
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerIngresosRequisicionEmpaquetadoPromocional()
  }, [])

  return {
    idReqEmpProm,
    productoFinal,
    requisicionEmpaquetadoPromocional,
    handleChangeInputProductoFinal,
    crearIngresoRequisicionEmpaquetadoPromocional
  }
}
