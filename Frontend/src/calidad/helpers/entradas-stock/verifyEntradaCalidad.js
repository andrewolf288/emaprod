import axios from "axios";
import config from "../../../config";

export const verifyEntradaCalidad = async (body) => {
  const { API_URL } = config;
  const domain = API_URL;
  const path = "/calidad/entradas_stock/verify_entrada_calidad.php";
  const url = domain + path;
  const { data } = await axios.put(url, {
    ...body
  });
  return data;
};
