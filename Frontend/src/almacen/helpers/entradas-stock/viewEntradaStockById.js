import axios from 'axios';
import config from '../.././../config';

export const viewEntradaStockById = async (id) => {

    const domain = config.API_URL;
    const path = '/almacen/entradas_stock/view_entrada_stock_by_id.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        id
    });
    return data;
}