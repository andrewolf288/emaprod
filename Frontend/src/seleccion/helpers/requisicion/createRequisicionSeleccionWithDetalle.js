import axios from 'axios';
import config from '../.././../config';

export const createRequisicionSeleccionWithDetalle = async (body) => {

    const domain = config.API_URL;
    const path = '/seleccion/requisicion/create_requisicion_requisicion_detalle.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body,
    });
    return data;
}