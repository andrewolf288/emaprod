import axios from 'axios'
import config from '../.././../config'

export const deleteProduccionDetalleRequisicion = async (body) => {
  const domain = config.API_URL
  const path = '/produccion/produccion-lote/delete_detalle_requisicion.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body
  })
  return data
}
