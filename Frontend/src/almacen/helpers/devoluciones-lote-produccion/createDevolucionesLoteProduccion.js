import axios from 'axios';
import config from '../.././../config';

export const createDevolucionesLoteProduccion = async (body) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/create_devoluciones_lote_produccion.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        detDevLotProd: body
    });
    return data;
}