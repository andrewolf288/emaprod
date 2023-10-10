import axios from 'axios';
import config from '../.././../config';

export const getAgregacionByIdProduccion = async (idProdc) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/getAgregacionByIdProduccion.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        id: idProdc
    });
    return data;
}