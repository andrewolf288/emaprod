import axios from 'axios';
import config from '../../../config';

export const getSummary = async (id_) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/get_produccion_data.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        id: id_
    });
    return data;
}