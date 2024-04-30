import { useEffect, useState } from 'react'
import { useDatePickerRange } from '../../hooks/useDatePickerRange'
import useAxiosWithLoading from '../../api/useAxiosWithLoading'
import { alertError } from '../../utils/alerts/alertsCustoms'

export function useRequisicionesFrescos () {
  const [requisicionMolienda, setRequisicionMolienda] = useState([])
  const [requisicionMoliendaTemp, setRequisicionMoliendaTemp] = useState([])

  // manejador de filtros de rango de fecha
  const { dateState, handleEndDateChange, handleStartDateChange } = useDatePickerRange()
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()
  // ESTADOS PARA EL MODAL
  const [mostrarDetalle, setMostrarDetalle] = useState(false)
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null)

  // Manejadores de cambios
  const handleFormFilter = ({ target }) => {
    const { name, value } = target
    filter(value, name)
  }

  const onChangeProducto = ({ label }) => {
    filter(label, 'filterProducto')
  }

  const onChangeEstadoRequisicionMolienda = ({ label }) => {
    filter(label, 'filterEstado')
  }

  // Funcion para filtrar la data
  const filter = (terminoBusqueda, name) => {
    let resultSearch = []
    switch (name) {
    case 'filterCodReq':
      resultSearch = requisicionMolienda.filter((element) => {
        if (
          element.codReq
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setRequisicionMoliendaTemp(resultSearch)
      break
    case 'filterLoteProduccion':
      resultSearch = requisicionMolienda.filter((element) => {
        if (
          element.codLotProd
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setRequisicionMoliendaTemp(resultSearch)
      break
    case 'filterProducto':
      resultSearch = requisicionMolienda.filter((element) => {
        if (
          element.nomProd
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setRequisicionMoliendaTemp(resultSearch)
      break
    case 'filterPeso':
      resultSearch = requisicionMolienda.filter((element) => {
        if (
          element.klgLotProd
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setRequisicionMoliendaTemp(resultSearch)
      break
    case 'filterEstado':
      resultSearch = requisicionMolienda.filter((element) => {
        if (
          element.desReqEst
            .toString()
            .toLowerCase()
            .includes(terminoBusqueda.toLowerCase())
        ) {
          return true
        } else {
          return false
        }
      })
      setRequisicionMoliendaTemp(resultSearch)
      break
    default:
      break
    }
  }

  const closeDetalleRequisicionMolienda = () => {
    // ocultamos el modal
    setMostrarDetalle(false)
    // dejamos el null la data del detalle
    setDetalleSeleccionado(null)
  }

  const traerrequisicionMoliendaesMolienda = async () => {
    const URL = '/almacen/requisicion-molienda/list_requisicion_molienda_detalle.php'
    try {
      const { data } = await axiosInstance.post(URL, { ...dateState, idAre: 7 })
      const { message_error, description_error, result } = data
      if (message_error.length === 0) {
        setRequisicionMolienda(result)
        setRequisicionMoliendaTemp(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  useEffect(() => {
    traerrequisicionMoliendaesMolienda()
  }, [dateState])

  return {
    requisicionMolienda,
    loading,
    dateState,
    handleStartDateChange,
    handleEndDateChange,
    requisicionMoliendaTemp,
    closeDetalleRequisicionMolienda,
    mostrarDetalle,
    handleFormFilter,
    onChangeProducto,
    onChangeEstadoRequisicionMolienda,
    detalleSeleccionado
  }
}
