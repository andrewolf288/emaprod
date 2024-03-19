import axios from 'axios'
import config from '../.././../config'

export const createSalidasParcialesStockAutomaticas = async (
  body,
  inputValue
) => {
  const domain = config.API_URL
  const path =
    '/almacen/salidas_stock/createSalidaParcialStockAutomaticaByRequisicion.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    ...body,
    canSalParDet: inputValue
  })
  return data
}
