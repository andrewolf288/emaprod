import axios from 'axios'
import config from '../.././../config'

export const getRequisicionSubproducto = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/requisicion-subproducto/listRequisicionSubproducto.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
