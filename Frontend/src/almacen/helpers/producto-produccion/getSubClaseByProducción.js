import axios from 'axios';
import config from '../../../config';

export const getSubClaseByProduccion = async (body) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/referenciales/sub_clase/list_sub_clase.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}