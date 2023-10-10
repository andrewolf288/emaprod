import axios from 'axios';
import config from '../.././../config';

export const getFormulaProductoDetalle = async () => {
    const domain = config.API_URL;
    const path = '/produccion/formula-producto/list_formula_producto_detalle.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data;
}