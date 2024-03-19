import axios from 'axios'
import config from '../../../config'

export const getAtributoCalidadTipo = async () => {
  const domain = config.API_URL
  const path = '/referenciales/atributo_calidad_tipo/atributo_calidad_tipo.php'
  const url = domain + path

  const { data } = await axios.get(url)
  return data.result
}
