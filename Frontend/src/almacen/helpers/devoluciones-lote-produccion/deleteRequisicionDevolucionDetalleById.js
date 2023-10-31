import axios from "axios";
import config from "../.././../config";

export const deleteRequisicionDevolucionDetalleById = async (body) => {
  const domain = config.API_URL;
  const path =
    "/almacen/requisicion-devoluciones/deleteRequisicionDevolucionDetalle.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    ...body,
  });
  return data;
};
