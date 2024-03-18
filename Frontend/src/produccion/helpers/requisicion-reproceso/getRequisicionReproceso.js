import axios from 'axios'
import config from '../.././../config'

export const getRequisicionReproceso = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/requisicion-reproceso/listOrdenesReproceso.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
