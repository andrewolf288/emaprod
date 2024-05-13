import { useEffect, useState } from 'react'
import useAxiosWithLoading from '../../../api/useAxiosWithLoading'
import { alertError } from '../../../utils/alerts/alertsCustoms'
import { useParams } from 'react-router-dom'

export function useOperacionEncuadreStockView () {
  const { idOpeEnStock } = useParams()
  const [operacionEncuadreStockDetail, setOperacionEncuadreStockDetail] = useState({

    idAlm: 0,
    nomAlm: '',
    codAlm: '',
    fecCreOpeEnc: '',
    detOpeEncStockDet: []

  })
  // manejar loading con instancia de axios
  const { loading, axiosInstance } = useAxiosWithLoading()

  const traerInformacionOperacionEncuadreStockView = async () => {
    const URL = '/almacen/encuadre-stock/viewOperacionEncuadre.php'
    try {
      const { data } = await axiosInstance.post(URL, { idOpeEnStock })
      console.log(data)
      const { message_error, description_error, result } = data
      if (message_error.length === 0) {
        setOperacionEncuadreStockDetail(result)
      } else {
        alertError(description_error)
      }
    } catch (e) {
      alertError(e.message)
    }
  }

  useEffect(() => {
    traerInformacionOperacionEncuadreStockView()
  }, [])

  return {
    loading,
    operacionEncuadreStockDetail
  }
}
