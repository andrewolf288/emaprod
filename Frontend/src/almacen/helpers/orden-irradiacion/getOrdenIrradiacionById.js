import axios from "axios";
import config from "../.././../config";

export const getOrdenIrradiacionById = async (body) => {
  const domain = config.API_URL;
  const path = "/almacen/operacion-irradiacion/viewSalidaOrdenIrradiacion.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    ...body
  });
  return data;
};
