import axios from 'axios'
import config from '../.././../config'

export const createProductosFinalesLoteProduccion = async (
  body,
  datosProduccion
) => {
  const domain = config.API_URL
  const path =
    '/produccion/produccion-lote/create_productos_finales_lote_produccionV2.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    detProdFinLotProd: body,
    datosProduccion
  })
  return data
}
