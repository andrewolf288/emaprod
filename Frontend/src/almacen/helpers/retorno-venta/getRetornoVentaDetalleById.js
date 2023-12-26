import axios from "axios";
import config from "../.././../config";

export const getRetornoVentaDetalleById = async (body) => {
  const domain = config.API_URL;
  const path =
    "/almacen/operacion-facturacion/view_operacion_facturacion_retorno.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    ...body
  });
  return data;
};
