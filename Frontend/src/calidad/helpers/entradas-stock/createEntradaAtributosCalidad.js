import axios from "axios";
import config from "../../../config";

export const createEntradaAtributosCalidad = async (body) => {
  const { API_URL } = config;
  const domain = API_URL;
  const path =
    "/calidad/entradas_stock/create_entrada_stock_atributos_calidad.php";
  const url = domain + path;
  const { data } = await axios.post(url, {
    ...body
  });
  return data;
};
