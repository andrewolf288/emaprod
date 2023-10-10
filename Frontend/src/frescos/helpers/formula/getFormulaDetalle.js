import axios from 'axios';
import config from '../.././../config';

export const getFormulaDetalle = async () => {
    const domain = config.API_URL;
    const path = '/molienda/formula/list_formula_detalle.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data;
}