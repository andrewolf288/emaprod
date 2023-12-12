import axios from "axios";
import config from "../.././../config";

export const createSalidaLoteStockByDetalle = async (body) => {
  const domain = config.API_URL;
  const path =
    "/almacen/operacion-facturacion/create_salida_operacion_facturacion_by_detalle.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    ...body
  });
  return data;
};
