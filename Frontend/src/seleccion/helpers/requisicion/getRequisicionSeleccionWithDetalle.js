import axios from 'axios';
import config from '../.././../config';

export const getRequisicionSeleccionWithDetalle = async (body) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/almacen/requisicion-seleccion/list_requisicion_seleccion_detalle.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body
    });

    return data;
}