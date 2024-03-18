import axios from 'axios'
import config from '../.././../config'

export const getProductosDisponiblesByProductoIntermedio = async (
  idProdtInt
) => {
  const { API_URL } = config
  const domain = API_URL
  const path =
    '/produccion/requisicion-transformacion/getProductosDisponiblesByProductoIntermedio.php'
  const url = domain + path
  const { data } = await axios.post(url, {
    idProdtInt
  })

  return data
}
