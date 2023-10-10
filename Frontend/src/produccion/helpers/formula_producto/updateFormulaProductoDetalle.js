import axios from 'axios';
import config from '../.././../config';

export const updateFormulaProductoDetalle = async (body) => {

    const domain = config.API_URL;
    const path = '/produccion/formula-producto/update_formula_producto_detalle.php';
    const url = domain + path;
    const { data } = await axios.put(url, {
        ...body
    });
    return data;
}