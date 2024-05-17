import axios from 'axios'
import config from '../../../config'

export const buscarEntradasStockDisponibles = async (body) => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/common/global/searchEntradasDisponibles.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
