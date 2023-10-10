import axios from 'axios';
import config from './../../../config';

export const getEstadosEntradasStock = async () => {

    const domain = config.API_URL;
    const path = '/almacen/entradas_stock/list-estados-entradas-stock.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data.result;
}