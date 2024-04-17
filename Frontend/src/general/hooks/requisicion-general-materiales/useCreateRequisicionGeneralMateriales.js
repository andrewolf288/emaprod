import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { getMateriaPrimaById } from '../../../helpers/Referenciales/producto/getMateriaPrimaById'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { createRequisicionGeneralMaterialWithDetalle } from '../../helpers/requisicion-materiales/createRequisicionGeneralMaterialWithDetalle'
import { useNavigate } from 'react-router-dom'

export function useCreateRequisicionGeneralMateriales () {
  const { user } = useAuth()
  const [requisicionMateriales, setRequisicionMateriales] = useState({
    idAre: user.idAre,
    idMotReqMat: 0,
    notReqMat: '',
    detReqMat: []
  })
  const [produtSelected, setProductSelected] = useState({
    idProdt: 0,
    cantReqMatDet: 0
  })
  const navigate = useNavigate()

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

  // handle añadir item al detalle requisicion materiales
  const handleAddProductoDetalleRequisicionMateriales = async (e) => {
    e.preventDefault()
    const formatCantidad = isNaN(produtSelected.cantReqMatDet) ? 0 : parseFloat(produtSelected.cantReqMatDet)
    let handleErrors = ''
    if (produtSelected.idProdt === 0 || formatCantidad <= 0) {
      if (produtSelected.idProdt === 0) {
        handleErrors += 'Debes seleccionar un producto\n'
      }
      if (formatCantidad <= 0) {
        handleErrors += 'Debes ingresar una cantidad mayor a 0'
      }
      alertWarning(handleErrors)
    } else {
      // si ya se ingreso el producto
      const findElementDetalle = requisicionMateriales.detReqMat.some((element) => element.idProdt === produtSelected.idProdt)
      if (!findElementDetalle) {
        const resultPeticion = await getMateriaPrimaById(produtSelected.idProdt)
        const { message_error, description_error, result } = resultPeticion

        if (message_error.length === 0) {
          const { id, codProd, codProd2, desCla, desSubCla, nomProd, simMed } =
              result[0]
          // GENERAMOS NUESTRO DETALLE DE FORMULA DE MATERIA PRIMA
          const detalleFormulaMateriaPrima = {
            index: id,
            idProdc: null,
            codLotProd: '',
            fecVenLotProd: '',
            idProdt: id,
            codProd,
            codProd2,
            desCla,
            desSubCla,
            nomProd,
            simMed,
            canMatPriFor: formatCantidad
          }

          // SETEAMOS SU ESTADO PARA QUE PUEDA SER MOSTRADO EN LA TABLA DE DETALLE
          const dataMateriaPrimaDetalle = [
            ...requisicionMateriales.detReqMat,
            detalleFormulaMateriaPrima
          ]
          setRequisicionMateriales({
            ...requisicionMateriales,
            detReqMat: dataMateriaPrimaDetalle
          })
        } else {
          alertError(description_error)
        }
      } else {
        alertWarning('¡Ya agregaste este producto al detalle!')
      }
    }
  }

  // handle delete detalle requisicion materiales
  const handleDeleteProductoDetalleRequisicionMateriales = (idItem) => {
    // FILTRAMOS EL ELEMENTO ELIMINADO
    const nuevaDataDetalleRequisicion = requisicionMateriales.detReqMat.filter((element) => {
      if (element.idProdt !== idItem) {
        return element
      } else {
        return false
      }
    })

    // VOLVEMOS A SETEAR LA DATA
    setRequisicionMateriales({
      ...requisicionMateriales,
      detReqMat: nuevaDataDetalleRequisicion
    })
  }

  // handle change detalle requisicion materiales
  const handleChangeProductoDetalleRequisicionMateriales = ({ target }, idItem) => {
    const { value } = target
    const editFormDetalle = requisicionMateriales.detReqMat.map((element) => {
      if (element.idProdt === idItem) {
        return {
          ...element,
          canMatPriFor: value
        }
      } else {
        return element
      }
    })

    setRequisicionMateriales({
      ...requisicionMateriales,
      detReqMat: editFormDetalle
    })
  }

  // handle create requisicion materiales
  const handleCreateRequisicionMateriales = async () => {
    let handleErrors = ''
    if (requisicionMateriales.idMotReqMat === 0 || requisicionMateriales.detReqMat.length === 0) {
      if (requisicionMateriales.idMotReqMat === 0) {
        handleErrors += 'Debes agregar un motivo de requisición de materiales\n'
      }
      if (requisicionMateriales.detReqMat.length === 0) {
        handleErrors += 'Debes agregar productos al detalle\n'
      }
      alertWarning(handleErrors)
    } else {
      const resultPeticion = await createRequisicionGeneralMaterialWithDetalle(requisicionMateriales)
      const { message_error, description_error } = resultPeticion
      if (message_error.length === 0) {
        // mostramos mensaje de exito
        alertSuccess()
        // regresamos a la vista de lista de requisicion de materiales
        navigate(-1)
      } else {
        alertError(description_error)
      }
    }
  }

  // agregar lote produccion detalle
  const agregarLoteProduccionDetalleRequisicionMateriales = (idProdt, result) => {
    const findElementIndex = requisicionMateriales.detReqMat.findIndex((element) => element.idProdt === idProdt)
    if (findElementIndex !== -1) {
      const updatedDetalleProductosFinales = [...requisicionMateriales.detReqMat]
      updatedDetalleProductosFinales[findElementIndex] = {
        ...updatedDetalleProductosFinales[findElementIndex],
        idProdc: result.id,
        codLotProd: result.codLotProd,
        fecVenLotProd: result.fecVenLotProd
      }
      setRequisicionMateriales(
        {
          ...requisicionMateriales,
          detReqMat: updatedDetalleProductosFinales
        }
      )
    }
  }

  // delete lote produccion detalle
  const quitarLoteProduccionDetalleRequisicionMateriales = (idProdt) => {
    const findElementIndex = requisicionMateriales.detReqMat.findIndex((element) => element.idProdt === idProdt)
    if (findElementIndex !== -1) {
      const updatedDetalleProductosFinales = [...requisicionMateriales.detReqMat]
      updatedDetalleProductosFinales[findElementIndex] = {
        ...updatedDetalleProductosFinales[findElementIndex],
        idProdc: 0,
        codLotProd: '',
        fecVenLotProd: ''
      }
      setRequisicionMateriales(
        {
          ...requisicionMateriales,
          detReqMat: updatedDetalleProductosFinales
        }
      )
    }
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
    handleChangeProductoDetalleRequisicionMateriales,
    handleCreateRequisicionMateriales,
    agregarLoteProduccionDetalleRequisicionMateriales,
    quitarLoteProduccionDetalleRequisicionMateriales
  }
}
