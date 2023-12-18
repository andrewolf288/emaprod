import axios from "axios";
import config from "../.././../config";

export const getRequisicionIngresosProductosByProduccion = async (idProdc) => {
  const domain = config.API_URL;
  const path =
    "/almacen/requisicion-ingreso-producto/getRequisicionIngresoProductoById.php";
  const url = domain + path;
  const { data } = await axios.post(url, {
    id: idProdc
  });
  return data;
};
