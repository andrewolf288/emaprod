import axios from 'axios';
import config from '../.././../config';

export const getRequisicionMoliendaWithDetalle = async (body) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/almacen/requisicion-molienda/list_requisicion_molienda_detalle.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body
    });

    return data;
}