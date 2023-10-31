import axios from "axios";
import config from "../.././../config";

export const createEntradasStockRequisicionDevolucionDetalle = async (
  body,
  idProdc
) => {
  const domain = config.API_URL;
  // const path = '/produccion/produccion-lote/create_agregaciones_lote_produccion.php';
  const path =
    "/almacen/requisicion-devoluciones/createEntradasStockRequisicionDevolucionDetalle.php";
  const url = domain + path;

  const { data } = await axios.post(url, {
    ...body,
    idProdc,
  });
  return data;
};
