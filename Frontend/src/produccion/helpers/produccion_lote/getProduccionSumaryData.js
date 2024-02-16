import axios from "axios";
import config from "../../../config";

export const getProduccionSumaryData = async (id) => {
  const domain = config.API_URL;
  const path = `/produccion/produccion-lote/get_produccion_data.php?id=${id}`;
  const url = domain + path;

  const { data } = await axios.get(url);
  return data;
};
