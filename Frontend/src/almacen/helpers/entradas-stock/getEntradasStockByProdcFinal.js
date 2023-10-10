import axios from 'axios';
import config from '../../../config';

export const getEntradasStockByProdcFinal = async (body) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/almacen/entradas_stock/get_entrada_stock_producto_final.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}