import { useEffect, useState } from 'react'
import { getRequisicionSubproductoById } from '../../helpers/requisicion-subproducto/getRequisicionSubproductoById'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { useParams } from 'react-router-dom'

export function useIngresarRequisicionSubproducto () {
  const { idReq } = useParams()
  const [requisicionSubproducto, setRequisicionSubproducto] = useState(
    {
      id: 0,
      idReqEst: 0,
      idProdt: 0,
      codLotProd: '',
      canLotProd: 0,
      desReqEst: '',
      nomProd: '',
      fecPedReq: '',
      fecEntReq: '',
      codReq: ''
    }
  )

  const traerInformacionRequisicionSubproductoById = async () => {
    const resultPeticion = await getRequisicionSubproductoById(idReq)
    console.log(resultPeticion)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setRequisicionSubproducto(result)
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerInformacionRequisicionSubproductoById()
  }, [])

  return {
    requisicionSubproducto
  }
}
