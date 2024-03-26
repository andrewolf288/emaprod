import { useEffect, useState } from 'react'
import { getRequisicionSubproductoById } from '../../helpers/requisicion-subproducto/getRequisicionSubproductoById'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { useNavigate, useParams } from 'react-router-dom'
import { FormatDateTimeMYSQLNow, FormatDateTimeMYSQLNowPlusYears } from '../../../utils/functions/FormatDate'
import { createIngresoRequisicionSubproducto } from '../../helpers/requisicion-subproducto/createIngresoRequisicionSubproducto'

export function useIngresarRequisicionSubproducto () {
  const { idReq } = useParams()
  const navigate = useNavigate()
  const [requisicionSubproducto, setRequisicionSubproducto] = useState(
    {
      id: 0,
      idReqEst: 0,
      idProdt: 0,
      idSubCla: 0,
      codLotProd: '',
      canLotProd: 0,
      desReqEst: '',
      nomProd: '',
      fecPedReq: '',
      fecEntReq: '',
      codReq: '',
      detIng: []
    }
  )
  const [productoFinal, setproductoFinal] = useState({
    idReq: 0,
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

  const crearIngresoRequisicionSubproducto = async (e) => {
    e.preventDefault()
    if (productoFinal.canProdFin > 0.0) {
      const resultPeticion = await createIngresoRequisicionSubproducto(productoFinal)
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

  const traerInformacionRequisicionSubproductoById = async () => {
    const resultPeticion = await getRequisicionSubproductoById(idReq)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      let year = 0
      // si la UM de al presentacion final es LTS, entonces year = 1
      if (result.idSubCla === 50) {
        year = 1 // frescos
      } else {
        year = 4 // otros
      }
      console.log(result)
      setRequisicionSubproducto(result)
      setproductoFinal({
        ...productoFinal,
        idReq: result.id,
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
    traerInformacionRequisicionSubproductoById()
  }, [])

  return {
    requisicionSubproducto,
    productoFinal,
    handleChangeInputProductoFinal,
    crearIngresoRequisicionSubproducto
  }
}
