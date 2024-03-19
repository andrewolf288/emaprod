import axios from 'axios'
import config from '../../../config'

export const getAllProductos = async (user) => {
  const domain = config.API_URL
  const path = '/referenciales/producto/list_all_productos.php'
  const url = domain + path

  const { data } = await axios.post(url)
  const { result } = data

  const sss = ['2400', '2401', '2402', '2403', '2405']
  let unique = result.reduce(function (acc, curr) {
    if (!acc.map((obj) => obj.id).includes(curr.id)) acc.push(curr)
    return acc
  }, [])

  if (user.idAre === 4) {
    unique = unique.filter((obj) => !sss.includes(obj.codSubCla))
  }
  return unique
}
