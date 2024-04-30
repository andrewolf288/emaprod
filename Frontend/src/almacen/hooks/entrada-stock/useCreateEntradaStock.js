import { useEffect, useState } from 'react'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { useDatePickerRange } from '../../../hooks/useDatePickerRange'
import { alertError } from '../../../utils/alerts/alertsCustoms'

export function useCreateEntradaStock () {
  const [dataEntSto, setdataEntSto] = useState([])
  const [dataEntStoTemp, setDataEntStoTemp] = useState([])
  const [filterInputs, setFilterInputs] = useState({
    idProd: 0,
    idProv: 0,
    idAlm: 0,
    codEntSto: '',
    docEntSto: '',
    ordCom: '',
    guiRem: '',
    canTotEnt: 0,
    canTotDis: 0,
    merTot: 0
  })
  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target
    setFilterInputs({
      ...filterInputs,
      [name]: value
    })
    filter(value, name)
  }

  const onChangeProducto = ({ id }) => {
    setFilterInputs({
      ...filterInputs,
      idProd: id
    })
    filter(id, 'idProd')
  }

  const onChangeProveedor = ({ id }) => {
    setFilterInputs({
      ...filterInputs,
      idProv: id
    })
    filter(id, 'idProv')
  }

  const onChangeAlmacen = ({ id }) => {
    setFilterInputs({
      ...filterInputs,
      idAlm: id
    })
    filter(id, 'idAlm')
  }

  const filter = (terminoBusqueda, name) => {
    let resultSearch = []
    switch (name) {
    case 'idProd':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.idProd === terminoBusqueda) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    case 'idProv':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.idProv === terminoBusqueda
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    case 'idAlm':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.idAlm === terminoBusqueda
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    case 'codEntSto':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.codEntSto
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    case 'docEntSto':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.docEntSto
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    case 'ordCom':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.ordCom
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    case 'guiRem':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.guiRem
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    case 'canTotEnt':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.canTotEnt
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    case 'canTotDis':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.canTotDis
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    case 'merTot':
      resultSearch = dataEntStoTemp.filter((element) => {
        if (
          element.merTot
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setdataEntSto(resultSearch)
      break
    default:
      break
    }
  }

  const traerInformacionEntradasStock = async () => {
    const URL = '/almacen/entradas_stock/get_entrada_stock.php'
    const { data } = await axiosInstance.post(URL, dateState)
    const { message_error, description_error, result } = data
    if (message_error.length === 0) {
      setdataEntSto(result)
      setDataEntStoTemp(result)
    } else {
      alertError(description_error)
    }
  }

  const cleanFilter = () => {
    setFilterInputs({
      idProd: 0,
      idProv: 0,
      idAlm: 0,
      codEntSto: '',
      docEntSto: '',
      ordCom: '',
      guiRem: '',
      canTotEnt: 0,
      canTotDis: 0,
      merTot: 0
    })
    setdataEntSto(dataEntStoTemp)
  }

  useEffect(() => {
    traerInformacionEntradasStock()
  }, [dateState])

  return {
    dataEntSto,
    filterInputs,
    dateState,
    handleStartDateChange,
    handleEndDateChange,
    loading,
    handleFormFilter,
    onChangeProducto,
    onChangeProveedor,
    onChangeAlmacen,
    cleanFilter
  }
}
