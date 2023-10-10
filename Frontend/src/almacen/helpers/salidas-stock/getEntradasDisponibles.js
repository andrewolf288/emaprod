import axios from 'axios';
import config from '../.././../config';

export const getEntradasDisponibles = async (id) => {
    const domain = config.API_URL;
    const path = '/almacen/salidas_stock/getEntradasDisponiblesByMatPri.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        idMatPri: id,
    });
    return data;
}