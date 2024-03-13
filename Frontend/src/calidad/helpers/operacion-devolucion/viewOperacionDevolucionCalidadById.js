import axios from "axios";
import config from "../../../config";

export const viewOperacionDevolucionCalidadById = async (id) => {
  const { API_URL } = config;
  const domain = API_URL;
  const path =
    "/calidad/operacion-devolucion/viewOperacionDevolucionCalidadById.php";
  const url = domain + path;
  const { data } = await axios.post(url, {
    idOpeDevCal: id
  });
  return data;
};
