import axios from "axios";
import config from "../.././../config";

export const getSalidaVentaDetalleById = async (body) => {
  const domain = config.API_URL;
  const path =
    "/almacen/operacion-facturacion/view_operacion_facturacion_salida.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    ...body,
  });
  return data;
};
