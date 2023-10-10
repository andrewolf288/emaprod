import axios from 'axios';
import config from '../../../config';

export const getLoteProduccionMolienda = async (body) => {

    const domain = config.API_URL;
    const path = '/molienda/requisicion/get_lote_produccion_molienda.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body,
    });
    return data;
}