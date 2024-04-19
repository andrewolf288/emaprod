import axios from 'axios'
import config from '../.././../config'

export const updateLoteProduccionRequisicionGeneralMaterialesDetalle = async (detalle, idProdc) => {
  const domain = config.API_URL
  const path = '/general/requisicion-materiales/updateLoteProduccionOrigenDestnoRequisicionGeneralDetalle.php'
  const url = domain + path

  const { data } = await axios.put(url, {
    ...detalle,
    idProdc
  })
  return data
}
