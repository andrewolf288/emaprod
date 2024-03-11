import axios from "axios";
import config from "../.././../config";

export const getRetornosVenta = async (body) => {
  const domain = config.API_URL;
  const path = "/almacen/operacion-devolucion/list_operacion_devolucion.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    ...body
  });
  return data;
};
