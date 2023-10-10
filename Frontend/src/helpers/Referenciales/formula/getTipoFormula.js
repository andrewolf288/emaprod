import axios from 'axios';
import config from '../../../config';

export const getTipoFormula = async () => {

    const domain = config.API_URL;
    const path = '/referenciales/formula/list_tipo_formula.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data.result;
}