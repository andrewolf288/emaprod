import axios from "axios";
import config from "../../../config";

export const getMotivoDevolucionesCalidad = async () => {
  const domain = config.API_URL;
  const path =
    "/referenciales/motivo_devolucion_calidad/list_motivo_devolucion_calidad.php";
  const url = domain + path;

  const { data } = await axios.post(url);
  return data.result;
};
