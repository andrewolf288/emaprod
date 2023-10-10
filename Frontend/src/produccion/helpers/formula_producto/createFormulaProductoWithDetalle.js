import axios from 'axios';
import config from '../.././../config';

export const createFormulaProductoWithDetalle = async (body) => {

    const domain = config.API_URL;
    const path = '/produccion/formula-producto/create_formula_producto_detalle.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body,
    });
    return data;
}