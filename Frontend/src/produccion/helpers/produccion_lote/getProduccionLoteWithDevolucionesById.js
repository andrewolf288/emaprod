import axios from 'axios'
import config from '../../../config'

export const getProduccionLoteWithDevolucionesById = async (idLotProdc) => {
  const domain = config.API_URL
  //   const path =
  //     "/produccion/produccion-lote/get_produccion_lote_devoluciones_by_id.php";
  const path =
    '/produccion/produccion-lote/get_produccion_lote_devoluciones_by_idV2.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    id: idLotProdc
  })
  return data
}
