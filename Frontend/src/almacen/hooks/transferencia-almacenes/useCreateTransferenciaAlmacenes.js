import { useState } from 'react'
import { alertError, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { getMateriaPrimaById } from '../../../helpers/Referenciales/producto/getMateriaPrimaById'

export function useCreateTransferenciaAlmacenes () {
  const [transferenciaAlmacen, setTransferenciaAlmacen] = useState(
    {
      idAlmOri: 0,
      idAlmDes: 0,
      idMotTranAlm: 0,
      obsTranAlm: '',
      detTranAlm: []
    }
  )

  const [produtSelected, setProductSelected] = useState({
    idProdt: 0,
    cantReqMatDet: 0
  })

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
        const { id, codProd, codProd2, desCla, desSubCla, nomProd, simMed, esProFin } =
              result[0]
        // GENERAMOS NUESTRO DETALLE DE FORMULA DE MATERIA PRIMA
        const detalleFormulaMateriaPrima = {
          idEntSto: null,
          codEntSto: '',
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
          esProFin,
          canMatPriFor: formatCantidad
        }

        // SETEAMOS SU ESTADO PARA QUE PUEDA SER MOSTRADO EN LA TABLA DE DETALLE
        const dataMateriaPrimaDetalle = [
          ...transferenciaAlmacen.detTranAlm,
          detalleFormulaMateriaPrima
        ]
        setTransferenciaAlmacen({
          ...transferenciaAlmacen,
          detTranAlm: dataMateriaPrimaDetalle
        })
      } else {
        alertError(description_error)
      }
    }
  }

  return {
    transferenciaAlmacen,
    produtSelected,
    handleChangeProductoRequisicionMateriales,
    handleChangeCantidadRequisicionMateriales,
    handleAddProductoDetalleRequisicionMateriales
  }
}
