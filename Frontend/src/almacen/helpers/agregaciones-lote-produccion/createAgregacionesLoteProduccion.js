import axios from 'axios';
import config from '../.././../config';

export const createAgregacionesLoteProduccion = async (body) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/create_agregaciones_lote_produccion.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        detAgrLotProd: body
    });
    return data;
}