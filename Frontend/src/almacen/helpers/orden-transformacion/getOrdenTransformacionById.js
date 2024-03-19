import axios from 'axios'
import config from '../.././../config'

export const getOrdenTransformacionById = async (idOrdTrans) => {
  const domain = config.API_URL
  const path = '/almacen/operacion-transformacion/viewOrdenTransformacion.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    idOrdTrans
  })
  return data
}
