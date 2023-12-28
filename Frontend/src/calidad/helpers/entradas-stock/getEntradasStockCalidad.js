import axios from "axios";
import config from "../../../config";

export const getEntradasStockCalidad = async (body) => {
  const { API_URL } = config;
  const domain = API_URL;
  const path = "/calidad/entradas_stock/get_entrada_stock_calidad.php";
  const url = domain + path;
  const { data } = await axios.post(url, {
    ...body
  });
  return data;
};
