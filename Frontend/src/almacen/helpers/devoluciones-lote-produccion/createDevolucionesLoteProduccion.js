import axios from 'axios'
import config from '../.././../config'

export const createDevolucionesLoteProduccion = async (body) => {
  const domain = config.API_URL
  const path =
    '/produccion/produccion-lote/create_devoluciones_lote_produccionV2.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
