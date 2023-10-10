import axios from 'axios';
import config from '../../../config';

export const getMedidas = async () => {

    const domain = config.API_URL;
    const path = '/referenciales/medida/list-medidas.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    return data.result;
}