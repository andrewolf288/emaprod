import axios from 'axios';
import config from '../../../config';

export const getSubClaseByClase = async (idCla) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/referenciales/sub_clase/list_sub_clase_by_clase.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        idCla: idCla
    });
    return data;
}