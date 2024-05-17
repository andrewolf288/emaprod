import axios from 'axios'
import config from '../../../config'

export const searchLoteProductoFinal = async (body) => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/common/global/searchLoteProduccionWithValidated.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
