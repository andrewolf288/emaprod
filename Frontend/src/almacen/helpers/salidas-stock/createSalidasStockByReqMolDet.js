import axios from 'axios';
import config from '../.././../config';

export const createSalidasStockByReqMolDet = async (body) => {
    const domain = config.API_URL;
    const path = '/almacen/salidas_stock/createSalidasStockByReqMolDet.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}