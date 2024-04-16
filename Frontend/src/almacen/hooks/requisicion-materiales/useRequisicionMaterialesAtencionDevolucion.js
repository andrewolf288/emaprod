import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRequisicionDevolucionesGeneralMateriales } from '../../helpers/requisicion-materiales-almacen/getRequisicionDevolucionesGeneralMateriales'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { createEntradaRequisicionGeneralMaterialesDetalle } from '../../helpers/requisicion-materiales-almacen/createEntradaRequisicionGeneralMaterialesDetalle'
import { updateRequisicionGeneralDevolucionMaterialesDetalle } from '../../helpers/requisicion-materiales-almacen/updateRequisicionGeneralDevolucionMaterialesDetalle'
import { deleteRequisicionGeneralDevolucionMaterialesDetalle } from '../../helpers/requisicion-materiales-almacen/deleteRequisicionGeneralDevolucionMaterialesDetalle'

export function useRequisicionMaterialesAtencionDevolucion () {
  const { idReqMat } = useParams()
  const [requisicionMaterial, setRequisicionMaterial] = useState(
    {
      id: 0,
      idReqEst: 0,
      codReqMat: '',
      desReqEst: '',
      desMotReqMat: '',
      idAre: '',
      desAre: '',
      notReqMat: '',
      fecCreReqMat: '',
      detReq: [],
      detDev: []
    }
  )

  const [loading, setLoading] = useState(false)

  const handleOpenDialogLoading = () => {
    setLoading(true)
  }

  const handleCloseDialogLoading = () => {
    setLoading(false)
  }

  const crearEntradaDevolucionRequisicionMateriales = async (detalle) => {
    const formatData = {
      ...detalle,
      idReqMat: requisicionMaterial.id
    }
    // abrimos el loader
    handleOpenDialogLoading()
    const { message_error, description_error } = await createEntradaRequisicionGeneralMaterialesDetalle(formatData)
    if (message_error.length === 0) {
      // llamamos a la data
      traerRequisicionMaterialesWithDevoluciones()
    } else {
      alertError(description_error)
    }
    // cerramos el loader
    handleCloseDialogLoading()
  }

  const editarRequisicionMaterialesDevolucionDetalle = async (detalle, inputValue) => {
    // abrimos el loader
    handleOpenDialogLoading()
    // canReqAgrDetNew
    const { message_error, description_error } =
      await updateRequisicionGeneralDevolucionMaterialesDetalle(detalle, inputValue)
    if (message_error.length === 0) {
      // llamamos a la data
      traerRequisicionMaterialesWithDevoluciones()
    } else {
      alertError(description_error)
    }
    // cerramos el loader
    handleCloseDialogLoading()
  }

  const eliminarRequisicionDevolucionMaterialesDetalle = async (detalle) => {
    // abrimos el loader
    handleOpenDialogLoading()
    const { message_error, description_error } = await deleteRequisicionGeneralDevolucionMaterialesDetalle(detalle)
    if (message_error.length === 0) {
      // llamamos a la data
      traerRequisicionMaterialesWithDevoluciones()
    } else {
      alertError(description_error)
    }
    // cerramos el loader
    handleCloseDialogLoading()
  }

  const traerRequisicionMaterialesWithDevoluciones = async () => {
    const resultPeticion = await getRequisicionDevolucionesGeneralMateriales(idReqMat)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      setRequisicionMaterial(result)
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerRequisicionMaterialesWithDevoluciones()
  }, [])

  return {
    requisicionMaterial,
    loading,
    crearEntradaDevolucionRequisicionMateriales,
    editarRequisicionMaterialesDevolucionDetalle,
    eliminarRequisicionDevolucionMaterialesDetalle
  }
}
