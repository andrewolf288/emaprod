import axios from 'axios';
import config from '../../../config';

export const getProductoByClase = async (idCla) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/referenciales/producto/list_producto_by_clase.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        idCla: idCla,
    });
    return data;
}