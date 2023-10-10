import axios from 'axios';
import config from '../.././../config';

export const getFormulaWithDetalleByPrioridad = async (body) => {

    const domain = config.API_URL;
    const path = '/produccion/formula/get_formula_formula_detalle_by_prioridad.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}