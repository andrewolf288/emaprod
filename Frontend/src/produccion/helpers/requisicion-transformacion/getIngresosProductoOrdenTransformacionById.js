import axios from 'axios'
import config from '../.././../config'

export const getIngresosProductoOrdenTransformacionById = async (
  idOrdTrans
) => {
  const { API_URL } = config
  const domain = API_URL
  const path =
    '/produccion/requisicion-transformacion/getOrdenTransformacionIngresosById.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    idOrdTrans
  })

  return data
}
