import axios from 'axios';
import config from '../../../config';

export const updateFechasProduccion = async (id, body) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/update_fechas_produccion.php';
    const url = domain + path;

    const { data } = await axios.put(url, {
        id: id,
        ...body
    });
    return data;
}