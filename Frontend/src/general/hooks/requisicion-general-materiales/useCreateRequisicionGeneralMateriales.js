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
      const resultPeticion = await getMateriaPrimaById(produtSelected.idProdt)
      const { message_error, description_error, result } = resultPeticion

      if (message_error.length === 0) {
        const { id, codProd, codProd2, desCla, desSubCla, nomProd, simMed } =
              result[0]
        // GENERAMOS NUESTRO DETALLE DE FORMULA DE MATERIA PRIMA
        const detalleFormulaMateriaPrima = {
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
    }
  }

  // handle delete detalle requisicion materiales
  const handleDeleteProductoDetalleRequisicionMateriales = (index) => {
    // FILTRAMOS EL ELEMENTO ELIMINADO
    const auxData = [...requisicionMateriales.detReqMat]
    auxData.splice(index, 1)

    // VOLVEMOS A SETEAR LA DATA
    setRequisicionMateriales({
      ...requisicionMateriales,
      detReqMat: auxData
    })
  }

  // handle change detalle requisicion materiales
  const handleChangeProductoDetalleRequisicionMateriales = ({ target }, index) => {
    const { value } = target

    const auxElement = { ...requisicionMateriales.detReqMat[index], canMatPriFor: value }
    const auxData = [...requisicionMateriales.detReqMat]
    auxData[index] = auxElement

    setRequisicionMateriales({
      ...requisicionMateriales,
      detReqMat: auxData
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
  const agregarLoteProduccionDetalleRequisicionMateriales = (index, result) => {
    const updatedDetalleProductosFinales = [...requisicionMateriales.detReqMat]
    updatedDetalleProductosFinales[index] = {
      ...updatedDetalleProductosFinales[index],
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

  // delete lote produccion detalle
  const quitarLoteProduccionDetalleRequisicionMateriales = (index) => {
    const updatedDetalleProductosFinales = [...requisicionMateriales.detReqMat]
    updatedDetalleProductosFinales[index] = {
      ...updatedDetalleProductosFinales[index],
      idProdc: null,
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
