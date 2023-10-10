import axios from 'axios';
import config from '../../../config';

export const getProduccionWhitProductosFinales = async (idProduccion) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/produccion/produccion-lote/get_produccion_lote_productos_finales_by_id.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        id: idProduccion
    });
    return data;
}