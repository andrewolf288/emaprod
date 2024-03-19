import axios from 'axios'
import config from '../.././../config'

export const getOrdenReprocesoById = async (idOpeDevCal) => {
  const domain = config.API_URL
  const path = '/almacen/operacion-reproceso/viewOrdenReproceso.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    idOpeDevCal
  })
  return data
}
