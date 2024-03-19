import axios from 'axios'
import config from '../.././../config'

export const updateRequisicionMaterialesDetalleById = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/produccion-lote/update_detalle_requisicion.php'
  const url = domain + path

  const { data } = await axios.put(url, {
    ...body
  })
  return data
}
