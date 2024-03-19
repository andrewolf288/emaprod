import axios from 'axios'
import config from '../../../config'

export const getEstadoRequisicion = async () => {
  const domain = config.API_URL
  const path = '/referenciales/requisicion_estado/list_requisicion_estado.php'
  const url = domain + path
  const { data } = await axios.post(url)
  return data.result
}
