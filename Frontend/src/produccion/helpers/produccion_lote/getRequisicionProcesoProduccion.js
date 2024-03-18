import axios from 'axios'
import config from '../.././../config'

export const getRequisicionProcesoProduccion = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/produccion-lote/get_requisicion_molienda_lote.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
