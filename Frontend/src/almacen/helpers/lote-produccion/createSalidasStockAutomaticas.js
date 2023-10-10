import axios from 'axios';
import config from '../.././../config';

export const createSalidasStockAutomaticas = async (body) => {

    const domain = config.API_URL;
    const path = '/almacen/salidas_stock/createSalidasStockAutomaticasByReqMolDet.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}