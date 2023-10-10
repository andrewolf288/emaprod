import axios from 'axios';
import config from '../.././../config';

export const getIngresoMateriaPrimaById = async (id) => {

    const domain = config.API_URL;
    const path = '/almacen/entradas_stock/get_numero_ingreso_entrada_stock_by_idMatPri.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        id
    });
    return data;
}