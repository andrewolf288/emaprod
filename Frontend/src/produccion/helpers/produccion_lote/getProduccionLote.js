import axios from 'axios';
import config from '../../../config';

export const getProduccionLote = async (body) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/get_produccion_lote.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}