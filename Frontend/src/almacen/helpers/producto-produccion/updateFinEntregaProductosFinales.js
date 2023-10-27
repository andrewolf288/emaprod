import axios from "axios";
import config from "../.././../config";

export const updateFinEntregaProductosFinales = async (body) => {
  const domain = config.API_URL;
  const path =
    "/produccion/produccion-lote/update_fin_entradas_presentacion_final.php";
  const url = domain + path;

  const { data } = await axios.put(url, {
    ...body,
  });
  return data;
};
