import axios from 'axios';
import config from '../.././../config';

export const updateFormulaDetalle = async (body) => {

    const domain = config.API_URL;
    const path = '/produccion/formula/update_formula_detalle.php';
    const url = domain + path;
    const { data } = await axios.put(url, {
        ...body
    });
    return data;
}