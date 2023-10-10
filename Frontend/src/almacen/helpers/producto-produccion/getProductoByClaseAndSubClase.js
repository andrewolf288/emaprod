import axios from 'axios';
import config from '../../../config';

export const getProductoByClaseAndSubClase = async (idCla, idSubCla) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/referenciales/producto/list_producto_by_clase_subclase.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        idCla: idCla,
        idSubCla: idSubCla
    });
    return data;
}