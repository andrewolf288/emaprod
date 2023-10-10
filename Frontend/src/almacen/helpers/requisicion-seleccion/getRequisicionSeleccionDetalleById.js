import axios from 'axios';
import config from '../.././../config';

export const getRequisicionSeleccionDetalleById = async (id) => {
    const domain = config.API_URL;
    const path = '/almacen/requisicion-seleccion/get_requisicion_seleccion_detalle_by_id.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        id,
    });
    return data;
}