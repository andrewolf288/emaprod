import axios from 'axios';
import config from '../.././../config';

export const createSalidasStockByReqSelDet = async (body) => {
    const domain = config.API_URL;
    const path = '/almacen/requisicion-seleccion/createSalidasStockByReqSelDet.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}