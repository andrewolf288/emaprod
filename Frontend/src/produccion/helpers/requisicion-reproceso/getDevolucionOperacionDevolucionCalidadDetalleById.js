import axios from 'axios'
import config from '../.././../config'

export const getDevolucionOperacionDevolucionCalidadDetalleById = async (idOpeDevCalDet) => {
  const domain = config.API_URL
  const path = '/produccion/requisicion-reproceso/viewLoteReprocesoRequisicionReproceso.php'
  const url = domain + path

  const { data } = await axios.post(url, {
    idOpeDevCalDet
  })
  return data
}
