import axios from 'axios';
import config from '../.././../config';

export const getFormulaProductoDetalleByProducto = async (idProdFin) => {

    const domain = config.API_URL;
    const path = '/produccion/formula-producto/get_formula_producto_detalle_by_producto.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        idProdFin: idProdFin
    });
    return data;
}