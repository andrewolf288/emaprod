import { useEffect, useState } from 'react'
import { getRequisicionGeneralMaterialesAlmacenById } from '../../helpers/requisicion-materiales-almacen/getRequisicionGeneralMaterialesAlmacenById'
import { useNavigate, useParams } from 'react-router-dom'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { updateRequisicionGeneralMaterialesDetalle } from '../../helpers/requisicion-materiales-almacen/updateRequisicionGeneralMaterialesDetalle'
import { deleteRequisicionGeneralMaterialesDetalle } from '../../helpers/requisicion-materiales-almacen/deleteRequisicionGeneralMaterialesDetalle'
import { createSalidaRequisicionGeneralMaterialesDetalle } from '../../helpers/requisicion-materiales-almacen/createSalidaRequisicionGeneralMaterialesDetalle'

export function useRequisicionMaterialesAtencionRequisicion () {
  const { idReqMat } = useParams()
  const navigate = useNavigate()
  const [requisicionMateriales, setRequisicionMateriales] = useState(
    {
      idReqEst: 0,
      desReqEst: '',
      codReqMat: '',
      desMotReqMat: '',
      idAre: '',
      desAre: '',
      notReqMat: '',
      fecCreReqMat: '',
      detReq: []
    }
  )
  const [loading, setLoading] = useState(false)

  const handleOpenDialogLoading = () => {
    setLoading(true)
  }

  const handleCloseDialogLoading = () => {
    setLoading(false)
  }

  const crearSalidaRequisicionMateriales = async (detalle) => {
    const formatData = {
      ...detalle,
      idAre: requisicionMateriales.idAre
    }
    // abrimos el loader
    handleOpenDialogLoading()
    const { message_error, description_error } = await createSalidaRequisicionGeneralMaterialesDetalle(formatData)
    if (message_error.length === 0) {
      // llamamos a la data
      traerRequisicionMaterialesById()
    } else {
      alertError(description_error)
    }
    // cerramos el loader
    handleCloseDialogLoading()
  }

  const editarRequisicionMaterialesDetalle = async (detalle, inputValue) => {
    // abrimos el loader
    handleOpenDialogLoading()
    // canReqAgrDetNew
    const { message_error, description_error } =
      await updateRequisicionGeneralMaterialesDetalle(detalle, inputValue)
    if (message_error.length === 0) {
      // llamamos a la data
      traerRequisicionMaterialesById()
    } else {
      alertError(description_error)
    }
    // cerramos el loader
    handleCloseDialogLoading()
  }

  const eliminarRequisicionMaterialesDetalle = async (detalle) => {
    // abrimos el loader
    handleOpenDialogLoading()
    const { message_error, description_error } = await deleteRequisicionGeneralMaterialesDetalle(detalle)
    if (message_error.length === 0) {
      // llamamos a la data
      traerRequisicionMaterialesById()
    } else {
      alertError(description_error)
    }
    // cerramos el loader
    handleCloseDialogLoading()
  }

  const traerRequisicionMaterialesById = async () => {
    const resultPeticion = await getRequisicionGeneralMaterialesAlmacenById(idReqMat)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setRequisicionMateriales(result)
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerRequisicionMaterialesById()
  }, [])

  return {
    requisicionMateriales,
    navigate,
    idReqMat,
    crearSalidaRequisicionMateriales,
    editarRequisicionMaterialesDetalle,
    eliminarRequisicionMaterialesDetalle,
    loading
  }
}
