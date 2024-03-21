import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'

export function useCreateRequisicionGeneralMateriales () {
  const { user } = useAuth()
  const [requisicionMateriales, setRequisicionMateriales] = useState({
    idAre: user.idAre,
    idMotReqMat: 0,
    notReqMat: '',
    detReq: []
  })
  const [produtSelected, setProductSelected] = useState({
    idProdt: 0,
    cantReqMatDet: 0
  })

  // handle change atributos requisicion
  const handleChangeAtributoRequisicionMateriales = ({ target }) => {
    const { name, value } = target
    setRequisicionMateriales({
      ...requisicionMateriales,
      [name]: value
    })
  }

  // handle change atributos selectores
  const handleChangeMotivoRequisicionMateriales = (value) => {
    const { id } = value
    setRequisicionMateriales({
      ...requisicionMateriales,
      idMotReqMat: id
    })
  }

  // handle añadir producto
  const handleChangeProductoRequisicionMateriales = (value) => {
    const { id } = value
    setProductSelected({
      ...produtSelected,
      idProdt: id
    })
  }

  // handle cambiar cantidad requisicion
  const handleChangeCantidadRequisicionMateriales = ({ target }) => {
    const { value } = target
    setProductSelected({
      ...produtSelected,
      cantReqMatDet: value
    })
  }

  // handle añadir producto al detalle
  const handleAddProductoDetalleRequisicionMateriales = (e) => {
    e.preventDefault()
    const formatCantidad = isNaN(produtSelected.cantReqMatDet) || produtSelected.cantReqMatDet.trim() === '' ? 0 : parseFloat(produtSelected.cantReqMatDet)
    console.log(formatCantidad)
    let handleErrors = ''
    if (produtSelected.idProdt === 0 || formatCantidad <= 0) {
      if (produtSelected.idProdt === 0) {
        handleErrors += 'Debes seleccionar un producto\n'
      }
      if (formatCantidad <= 0) {
        handleErrors += 'Debes ingresar una cantidad mayor a 0'
      }
      console.log(handleErrors)
    } else {
      console.log('peticion')
    }
  }

  // handle delete producto al detalle
  const handleDeleteProductoDetalleRequisicionMateriales = () => {

  }

  // handle change detalle de producto
  const handleChangeProductoDetalleRequisicionMateriales = () => {

  }

  return {
    requisicionMateriales,
    handleChangeAtributoRequisicionMateriales,
    handleChangeMotivoRequisicionMateriales,
    produtSelected,
    handleChangeProductoRequisicionMateriales,
    handleChangeCantidadRequisicionMateriales,
    handleAddProductoDetalleRequisicionMateriales,
    handleDeleteProductoDetalleRequisicionMateriales,
    handleChangeProductoDetalleRequisicionMateriales
  }
}
