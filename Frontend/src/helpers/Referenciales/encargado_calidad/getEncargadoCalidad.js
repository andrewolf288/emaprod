import axios from "axios";
import config from "../../../config";

export const getEncargadoCalidad = async () => {
  const domain = config.API_URL;
  const path = "/referenciales/encargado_calidad/list_encargados_calidad.php";
  const url = domain + path;
  const { data } = await axios.post(url);
  return data.result;
};
