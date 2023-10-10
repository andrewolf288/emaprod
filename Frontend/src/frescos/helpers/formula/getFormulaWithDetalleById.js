import axios from 'axios';
import config from '../.././../config';

export const getFormulaWithDetalleById = async (idFormula) => {

    const domain = config.API_URL;
    const path = '/molienda/formula/get_formula_formula_detalle_by_id.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        id: idFormula,
    });
    return data;
}