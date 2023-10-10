import axios from 'axios';
import config from '../.././../config';

export const getFormulas = async () => {

    const domain = config.API_URL;
    const path = '/molienda/formula/list_formulas.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data;
}