import axios from "axios";
import config from "../../../config";

export const getMateriaPrimaByRef = async (prodRef) => {
  const domain = config.API_URL;
  const path = "/referenciales/producto/list_materia_prima_by_ref.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    prodRef: prodRef,
  });

  return data;
};
