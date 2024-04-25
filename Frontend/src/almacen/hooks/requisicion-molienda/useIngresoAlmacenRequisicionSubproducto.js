import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRequisicionSubproductoById } from '../../../produccion/helpers/requisicion-subproducto/getRequisicionSubproductoById'
import { alertError, alertLoading, alertSuccess } from '../../../utils/alerts/alertsCustoms'
import toast from 'react-hot-toast'
import { deleteIngresoRequisicionSubproductoById } from '../../helpers/requisicion-subproducto/deleteIngresoRequisicionSubproductoById'
import { updateIngresoRequisicionSubproductoById } from '../../helpers/requisicion-subproducto/updateIngresoRequisicionSubproductoById'
import { DiaJuliano, letraAnio } from '../../../utils/functions/FormatDate'
import { createIngresoAlmacenRequisicionSubproductoById } from '../../helpers/requisicion-subproducto/createIngresoAlmacenRequisicionSubproductoById'

export function useIngresoAlmacenRequisicionSubproducto () {
  const { idReq } = useParams()

  const [requisicionSubproducto, setRequisicionSubproducto] = useState({
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
  })

  // traer informacion de requisicion sub producto por by id
  const traerInformacionRequisicionSubproductoById = async () => {
    const resultPeticion = await getRequisicionSubproductoById(idReq)
    const { message_error, description_error, result } = resultPeticion
    if (message_error.length === 0) {
      console.log(result)
      const formatDetIngr = result.detIng.map((element) => {
        return {
          id: element.id,
          idReq: element.idReq,
          idProdt: element.idProdt,
          refProdtProg: null,
          nomProd: element.nomProd,
          codProd2: element.codProd2,
          canProdIng: element.canProdIng,
          fecProdIng: element.fecProdIng,
          fecProdVen: element.fecProdVen,
          esComProdIng: element.esComReqProdIng
        }
      })

      const formatData = {
        ...result,
        detIng: formatDetIngr
      }
      setRequisicionSubproducto(formatData)
    } else {
      alertError(description_error)
    }
  }

  // funcion para editar la requisicion de agregacion
  const onDeleteDetalleRequisicionAgregacion = async (detalle) => {
    const loadingToastId = alertLoading('Eliminando detalle ...')
    // abrimos el loader
    const { message_error, description_error } =
      await deleteIngresoRequisicionSubproductoById(detalle)
    if (message_error.length === 0) {
      // llamamos a la data
      traerInformacionRequisicionSubproductoById()
    } else {
      alertError(description_error)
    }
    // // cerramos el loader
    toast.dismiss(loadingToastId)
  }

  // funcion para eliminar la requisicion de agregacion
  const onUpdateDetalleRequisicionAgregacion = async (detalle, inputValue) => {
    console.log(detalle, inputValue)
    // abrimos el loader
    const loadingToastId = alertLoading('Actualizando detalle ...')
    const resultPeticion =
      await updateIngresoRequisicionSubproductoById(detalle, inputValue)
    console.log(resultPeticion)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      // llamamos a la data
      traerInformacionRequisicionSubproductoById()
    } else {
      alertError(description_error)
    }
    // // cerramos el loader
    toast.dismiss(loadingToastId)
  }

  // funcion para cumplir la requisicion de agregacion
  const onCheckDetalleRequisicionIngresoProducto = async (detalle) => {
    const letAniEntSto = letraAnio(detalle.fecProdIng)
    const diaJulEntSto = DiaJuliano(detalle.fecProdIng)
    const formatData = {
      ...detalle,
      letAniEntSto,
      diaJulEntSto
    }
    // // abrimos el loader
    const loadingToastId = alertLoading('Realizando operación...')
    const resultPeticion = await createIngresoAlmacenRequisicionSubproductoById(formatData)
    const { message_error, description_error } = resultPeticion
    if (message_error.length === 0) {
      alertSuccess()
      // llamamos a la data
      traerInformacionRequisicionSubproductoById()
    } else {
      alertError(description_error)
    }
    // // cerramos el loader
    toast.dismiss(loadingToastId)
  }

  useEffect(() => {
    traerInformacionRequisicionSubproductoById()
  }, [])

  return {
    requisicionSubproducto,
    onDeleteDetalleRequisicionAgregacion,
    onUpdateDetalleRequisicionAgregacion,
    onCheckDetalleRequisicionIngresoProducto
  }
}
