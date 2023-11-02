import axios from "axios";
import config from "../.././../config";

export const createRequisicionMateriales = async (body) => {
  const domain = config.API_URL;
  const path =
    "/almacen/requisicion-materiales/create_requisicion_materiales.php";
  const url = domain + path;
  const { data } = await axios.post(url, {
    ...body,
  });
  return data;
};
