import axios from "axios";
import config from "../.././../config";

export const deleteRequisicionAgregacionDetalleById = async (body) => {
  const domain = config.API_URL;
  const path =
    "/almacen/requisicion-agregaciones/deleteRequisicionAgregacionDetalle.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    ...body,
  });
  return data;
};
