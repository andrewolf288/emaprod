import axios from 'axios'
import config from '../.././../config'

export const getDevolucionesMotivosByProductAndProduccion = async () => {
  const domain = config.API_URL
  const path = '/produccion/produccion-lote/get_devoluciones_motivos_by_producto_and_produccion.php'
  const url = domain + path
  const { data } = await axios.post(url)
  return data
}
