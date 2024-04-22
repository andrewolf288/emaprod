import axios from 'axios'
import config from '../../../config'

export const getProductosCombo = async () => {
  const { API_URL } = config
  const domain = API_URL
  const path = '/referenciales/producto/list_productos_combo.php'
  const url = domain + path
  const { data } = await axios.post(url)
  return data.result
}
