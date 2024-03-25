import axios from 'axios'
import config from '../.././../config'

export const getRequisicionSubproductoById = async (idReq) => {
  const domain = config.API_URL
  const path = '/produccion/requisicion-subproducto/getRequisicionSubproductoById.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    idReq
  })
  return data
}
