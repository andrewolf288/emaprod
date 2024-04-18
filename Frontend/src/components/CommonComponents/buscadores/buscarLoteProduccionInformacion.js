import axios from 'axios'
import config from '../../../config'

export const buscarLoteProduccionInformacion = async (body) => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/common/global/searchLoteProduccion.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
