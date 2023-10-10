import axios from 'axios';
import config from '../.././../config';

export const createSalidasByReqSelDetAutomatico = async (body) => {
    const domain = config.API_URL;
    const path = '/almacen/requisicion-seleccion/createSalidasStockByReqSelDetAutomatica.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}