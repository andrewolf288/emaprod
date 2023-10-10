import axios from 'axios';
import config from '../../../config';

export const getClases = async () => {

    const domain = config.API_URL;
    const path = '/referenciales/clase/list_clase.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    return data.result;
}