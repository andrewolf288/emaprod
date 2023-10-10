import axios from 'axios';
import config from '../.././../config';

export const deleteDetalleFormula = async (idForDet) => {
    const domain = config.API_URL;
    const path = '/produccion/formula/delete_detalle_formula.php';
    const url = domain + path;
    const { data } = await axios.delete(url,
        {
            data: {
                id: idForDet,
            },
        }
    );
    return data;
}