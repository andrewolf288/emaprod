import axios from 'axios';
import config from '../.././../config';

export const deleteDetalleFormulaProducto = async (idForProdTerDet) => {
    const domain = config.API_URL;
    const path = '/produccion/formula-producto/delete_detalle_formula_producto.php';
    const url = domain + path;
    const { data } = await axios.delete(url,
        {
            data: {
                id: idForProdTerDet,
            },
        }
    );
    return data;
}