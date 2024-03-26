import { useEffect, useState } from 'react'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { getRequisicionGeneralMaterialById } from '../../helpers/requisicion-materiales/getRequisicionGeneralMaterialById'
import { useParams } from 'react-router-dom'

export function useDevolucionRequisicionGeneralMateriales () {
  const { idReqMat } = useParams()
  const [requisicionMaterial, setRequisicionMaterial] = useState(
    {
      idReqEst: 0,
      desReqEst: '',
      desMotReqMat: '',
      idAre: '',
      desAre: '',
      codReqMat: '',
      notReqMat: '',
      fecCreReqMat: '',
      detReq: []
    }
  )

  const traerInformacionRequisicionMaterial = async () => {
    const resultPeticion = await getRequisicionGeneralMaterialById(idReqMat)
    console.log(resultPeticion)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setRequisicionMaterial(result)
    } else {
      alertError(description_error)
    }
  }

  const handleCreateDevolucionRequisicionMateriales = async () => {

  }

  useEffect(() => {
    traerInformacionRequisicionMaterial()
  }, [])

  return {
    requisicionMaterial,
    traerInformacionRequisicionMaterial,
    handleCreateDevolucionRequisicionMateriales
  }
}
