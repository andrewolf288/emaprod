import axios from 'axios'
import config from '../../../config'

export const searchLoteProduccionDestino = async (body) => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/general/requisicion-materiales/searchLoteProduccionDestino.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
