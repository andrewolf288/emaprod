import axios from "axios";
import config from "../.././../config";

export const createDevolucionOrdenTransformacion = async (body) => {
  const domain = config.API_URL;
  const path =
    "/almacen/operacion-transformacion/createDevolucionOrdenTransformacion.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    ...body
  });
  return data;
};
