import axios from 'axios';
import config from '../../../config';

export const getProduccionLoteWithAgregacionesById = async (idLotProdc) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/get_produccion_lote_agregaciones_by_id.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        id: idLotProdc
    });
    return data;
}