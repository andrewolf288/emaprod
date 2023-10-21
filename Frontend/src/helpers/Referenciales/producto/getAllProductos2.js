import axios from "axios";
import config from "../../../config";

export const getAllProductos2 = async (user) => {
  const domain = config.API_URL;
  const path = "/referenciales/producto/list_all_productos.php";
  const url = domain + path;

  const { data } = await axios.post(url);
  const { result } = data;
  return result;
};
