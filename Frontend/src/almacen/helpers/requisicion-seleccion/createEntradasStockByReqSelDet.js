import axios from 'axios';
import config from '../.././../config';

export const createEntradasStockByReqSelDet = async (body) => {
    const domain = config.API_URL;
    const path = '/almacen/requisicion-seleccion/createEntradasStockByReqSelDet.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}