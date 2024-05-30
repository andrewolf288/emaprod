import { useEffect, useState } from 'react'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import { alertError } from '../../../utils/alerts/alertsCustoms'

export function useEntradasStock () {
  const [dataEntSto, setdataEntSto] = useState([])
  const [dataEntStoTemp, setDataEntStoTemp] = useState([])
  const [filterInputs, setFilterInputs] = useState({
    producto: '',
    proveedor: '',
    almacen: '',
    codEntSto: '',
    docEntSto: '',
    ordCom: '',
    guiRem: '',
    canTotEnt: '',
    canTotDis: ''
  })
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()
  const [flagReset, setFlagReset] = useState()
  const handledFilterData = () => {
    console.log(filterInputs.proveedor)
    const dataFilter = dataEntSto.filter((element) => {
      const productoElement = element.idProd
      const proveedorElement = element.idProv
      const almacenElement = element.idAlm
      const codigoEntradaStockElement = element.codEntSto.toString().toLowerCase()
      const documentoEntradaStockElement = element.docEntSto.toString().toLowerCase()
      const ordenCompraElement = element.ordCom.toString().toLowerCase()
      const guiaRemisionElement = element.guiRem.toString().toLowerCase()
      const canTotEntElement = element.canTotEnt.toString().toLowerCase()
      const canTotDisElement = element.canTotDis.toString().toLowerCase()

      if (
        (filterInputs.producto !== '' &&
          productoElement !== filterInputs.producto) ||
        (filterInputs.proveedor !== '' &&
          proveedorElement !== filterInputs.proveedor) ||
        (filterInputs.almacen !== '' &&
          almacenElement !== filterInputs.almacen) ||
        (filterInputs.codEntSto !== '' &&
          !codigoEntradaStockElement.includes(filterInputs.codEntSto.toString().toLowerCase())) ||
        (filterInputs.docEntSto !== '' &&
          !documentoEntradaStockElement.includes(filterInputs.docEntSto.toString().toLowerCase())) ||
        (filterInputs.ordCom !== '' &&
          !ordenCompraElement.includes(filterInputs.ordCom.toString().toLowerCase())) ||
        (filterInputs.guiRem !== '' &&
          !guiaRemisionElement.includes(filterInputs.guiRem.toString().toLowerCase())) ||
        (filterInputs.canTotDis !== '' &&
          !canTotDisElement.includes(filterInputs.canTotDis.toString().toLowerCase())) ||
        (filterInputs.canTotEnt !== '' &&
          !canTotEntElement.includes(filterInputs.canTotEnt.toString().toLowerCase()))
      ) {
        return false
      }
      return true
    })

    setDataEntStoTemp(dataFilter)
    setFlagReset(true)
  }
  const handledResetDataFilter = () => {
    setDataEntStoTemp(dataEntSto)
    setFilterInputs({
      producto: '',
      proveedor: '',
      almacen: '',
      codEntSto: '',
      docEntSto: '',
      ordCom: '',
      guiRem: '',
      canTotEnt: '',
      canTotDis: ''
    })
    setFlagReset(false)
  }

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target
    setFilterInputs({
      ...filterInputs,
      [name]: value
    })
    setFlagReset(false)
  }

  const onChangeProducto = (value) => {
    setFilterInputs({
      ...filterInputs,
      producto: value.id
    })
    setFlagReset(false)
  }

  const onChangeProveedor = (value) => {
    setFilterInputs({
      ...filterInputs,
      proveedor: value.id
    })
    setFlagReset(false)
  }

  const onChangeAlmacen = (value) => {
    setFilterInputs({
      ...filterInputs,
      almacen: value.id
    })
    setFlagReset(false)
  }

  const traerInformacionEntradasStock = async () => {
    const URL = '/almacen/entradas_stock/get_entrada_stock.php'
    const { data } = await axiosInstance.post(URL, dateState)
    const { message_error, description_error, result } = data
    if (message_error.length === 0) {
      console.log(result)
      setdataEntSto(result)
      setDataEntStoTemp(result)
    } else {
      alertError(description_error)
    }
  }

  useEffect(() => {
    traerInformacionEntradasStock()
  }, [dateState])

  return {
    dataEntStoTemp,
    filterInputs,
    dateState,
    handleStartDateChange,
    handleEndDateChange,
    loading,
    handleFormFilter,
    onChangeProducto,
    onChangeProveedor,
    onChangeAlmacen,
    flagReset,
    handledFilterData,
    handledResetDataFilter
  }
}
