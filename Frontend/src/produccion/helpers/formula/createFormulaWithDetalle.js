import axios from 'axios';
import config from '../.././../config';

export const createFormulaWithDetalle = async (body) => {

    const domain = config.API_URL;
    const path = '/produccion/formula/create_formula_formula_detalle.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body,
    });
    return data;
}