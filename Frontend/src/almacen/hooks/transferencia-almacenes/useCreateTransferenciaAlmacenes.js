import { useState } from 'react'
import { alertError, alertSuccess, alertWarning } from '../../../utils/alerts/alertsCustoms'
import { getMateriaPrimaById } from '../../../helpers/Referenciales/producto/getMateriaPrimaById'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { useNavigate } from 'react-router-dom'

// almacenes permitidos
const almacenes = [1, 8, 7]

export function useCreateTransferenciaAlmacenes () {
  const {
    axiosInstance,
    loading
  } = useAxiosWithLoading()

  const navigate = useNavigate()

  const [transferenciaAlmacen, setTransferenciaAlmacen] = useState(
    {
      idAlmOri: 0,
      idAlmDes: 0,
      obsTranAlm: '',
      detTranAlm: []
    }
  )

  const handleChangeAlmacenOrigen = ({ id }) => {
    setTransferenciaAlmacen({
      ...transferenciaAlmacen,
      idAlmOri: id
    })
  }

  const handleChangeAlmacenDestino = ({ id }) => {
    setTransferenciaAlmacen({
      ...transferenciaAlmacen,
      idAlmDes: id
    })
  }

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
    if (produtSelected.idProdt === 0 || formatCantidad <= 0 || transferenciaAlmacen.idAlmOri == 0) {
      if (produtSelected.idProdt === 0) {
        handleErrors += 'Debes seleccionar un producto\n'
      }
      if (formatCantidad <= 0) {
        handleErrors += 'Debes ingresar una cantidad mayor a 0'
      }
      if (transferenciaAlmacen.idAlmOri == 0) {
        handleErrors += 'Debes seleccionar un almacen de origen'
      }
      alertWarning(handleErrors)
    } else {
      // si ya se ingreso el producto
      const findElement = transferenciaAlmacen.detTranAlm.find((element) => element.idProdt === produtSelected.idProdt)
      if (!findElement) {
        const resultPeticion = await getMateriaPrimaById(produtSelected.idProdt)
        const { message_error, description_error, result } = resultPeticion

        if (message_error.length === 0) {
          const { id, codProd, codProd2, desCla, desSubCla, nomProd, simMed, esProFin } =
            result[0]
          // GENERAMOS NUESTRO DETALLE DE FORMULA DE MATERIA PRIMA
          const detalleFormulaMateriaPrima = {
            detEntSto: [],
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
      } else {
        alertWarning('Este producto ya fue agregado al detalle')
      }
    }
  }

  // eliminar detalle de transferencia almacenes
  const deleteDetalleTransferenciaAlmacenes = (detalle) => {
    const findElementIndex = transferenciaAlmacen.detTranAlm.findIndex((item) => item.idProdt === detalle.idProdt)
    if (findElementIndex !== -1) {
      const dataAux = transferenciaAlmacen.detTranAlm.slice() // Crear una copia del array
      dataAux.splice(findElementIndex, 1)
      setTransferenciaAlmacen({
        ...transferenciaAlmacen,
        detTranAlm: dataAux
      })
    }
  }

  // actualizar detalle de transferencia almacenes
  const updateDetalleTransferenciaAlmacenes = ({ target }, detalle) => {
    const inputValue = target.value
    const findElementIndex = transferenciaAlmacen.detTranAlm.findIndex((item) => item.idProdt === detalle.idProdt)
    if (findElementIndex !== -1) {
      const dataAux = transferenciaAlmacen.detTranAlm.slice() // Crear una copia del array
      dataAux[findElementIndex] = {
        ...dataAux[findElementIndex],
        canMatPriFor: inputValue
      }
      setTransferenciaAlmacen({
        ...transferenciaAlmacen,
        detTranAlm: dataAux
      })
    }
  }

  // añadir referencia de entradas para salida de transferencia
  const onAddReferenciaEntradasSalidaTransferencia = (detalleEntradas, idProdt) => {
    const findIndexElement = transferenciaAlmacen.detTranAlm.findIndex((element) => element.idProdt === idProdt)
    const dataAux = transferenciaAlmacen.detTranAlm.slice()
    dataAux[findIndexElement] = {
      ...dataAux[findIndexElement],
      detEntSto: detalleEntradas
    }
    setTransferenciaAlmacen({
      ...transferenciaAlmacen,
      detTranAlm: dataAux
    })
  }

  // añadir referencia de lote de produccion para salida de transferencia
  const onAddReferenciaLoteProduccionSalidaTransferencia = (idProdt, result) => {
    const findIndexElement = transferenciaAlmacen.detTranAlm.findIndex((element) => element.idProdt === idProdt)
    const dataAux = transferenciaAlmacen.detTranAlm.slice()
    dataAux[findIndexElement] = {
      ...dataAux[findIndexElement],
      idProdc: result.id,
      codLotProd: result.codLotProd,
      fecVenLotProd: result.fecVenLotProd
    }
    setTransferenciaAlmacen({
      ...transferenciaAlmacen,
      detTranAlm: dataAux
    })
  }

  // quitar referencia de entradas para salida de transferencia
  const onRemoveReferenciaEntradasSalidaTransferencia = (idProdt) => {
    const findIndexElement = transferenciaAlmacen.detTranAlm.findIndex((element) => element.idProdt === idProdt)
    const dataAux = transferenciaAlmacen.detTranAlm.slice()
    dataAux[findIndexElement] = {
      ...dataAux[findIndexElement],
      detEntSto: []
    }
    setTransferenciaAlmacen({
      ...transferenciaAlmacen,
      detTranAlm: dataAux
    })
  }

  // quitar referencia de lote de produccion para salida de transferencia
  const onRemoveReferenciaLoteProduccionSalidaTransferencia = (idProdt) => {
    const findIndexElement = transferenciaAlmacen.detTranAlm.findIndex((element) => element.idProdt === idProdt)
    const dataAux = transferenciaAlmacen.detTranAlm.slice()
    dataAux[findIndexElement] = {
      ...dataAux[findIndexElement],
      idProdc: null,
      codLotProd: '',
      fecVenLotProd: ''
    }
    setTransferenciaAlmacen({
      ...transferenciaAlmacen,
      detTranAlm: dataAux
    })
  }

  // crear transferencia entre almacenes
  const crearTransferenciaAlmacenes = async () => {
    let handleErrors = ''
    if (transferenciaAlmacen.idAlmOri === 0 || transferenciaAlmacen.idAlmDes === 0 || transferenciaAlmacen.detTranAlm.length === 0) {
      if (transferenciaAlmacen.idAlmOri === 0) {
        handleErrors += '- Falta seleccionar almacen de origen\n'
      }
      if (transferenciaAlmacen.idAlmDes === 0) {
        handleErrors += '- Falta seleccionar almacen de destino\n'
      }
      if (transferenciaAlmacen.detTranAlm.length === 0) {
        handleErrors += '- El detalle de la transferencia debe tener al menos un producto\n'
      }
      alertWarning(handleErrors)
    } else {
      if (transferenciaAlmacen.idAlmOri === transferenciaAlmacen.idAlmDes) {
        alertWarning('Los almacenes no pueden ser lo mismo')
      } else {
        const findElement = transferenciaAlmacen.detTranAlm.find((element) => element.canMatPriFor <= 0)
        if (findElement) {
          alertWarning('Los detalles no deben tener cantidades menores iguales a 0')
        } else {
          const URL = '/almacen/transferencia-almacen/createTransferenciaEntreAlmacenes.php'
          try {
            // const { data } = await axiosInstance.post(URL, transferenciaAlmacen)
            // const { message_error, description_error } = data
            // if (message_error.length === 0) {
            //   alertSuccess()
            //   navigate(-1)
            // } else {
            //   alertError(description_error)
            // }
            console.log(transferenciaAlmacen)
          } catch (error) {
            alertError(error)
          }
        }
      }
    }
  }

  return {
    transferenciaAlmacen,
    produtSelected,
    handleChangeProductoRequisicionMateriales,
    handleChangeCantidadRequisicionMateriales,
    handleAddProductoDetalleRequisicionMateriales,
    almacenes,
    handleChangeAlmacenOrigen,
    handleChangeAlmacenDestino,
    updateDetalleTransferenciaAlmacenes,
    deleteDetalleTransferenciaAlmacenes,
    onAddReferenciaEntradasSalidaTransferencia,
    onAddReferenciaLoteProduccionSalidaTransferencia,
    onRemoveReferenciaEntradasSalidaTransferencia,
    onRemoveReferenciaLoteProduccionSalidaTransferencia,
    crearTransferenciaAlmacenes,
    loading
  }
}
