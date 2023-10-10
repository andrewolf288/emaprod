import axios from 'axios';
import config from '../.././../config';

export const getFormulaProductoWithDetalleById = async (idForProd) => {

    const domain = config.API_URL;
    const path = '/produccion/formula-producto/get_formula_producto_detalle_by_id.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        id: idForProd,
    });
    return data;
}