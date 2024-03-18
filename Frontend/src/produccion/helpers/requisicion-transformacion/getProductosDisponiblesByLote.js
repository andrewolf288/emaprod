import axios from 'axios'
import config from '../.././../config'

export const getProductosDisponiblesByLote = async (idProdc) => {
  const { API_URL } = config
  const domain = API_URL
  const path =
    '/produccion/requisicion-transformacion/getProductosDisponiblesByLote.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    idProdc
  })

  return data
}
