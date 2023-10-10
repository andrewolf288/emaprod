import axios from 'axios';
import config from '../../../config';

export const getClaseByProduccion = async () => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/referenciales/clase/list_clase.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data;
}