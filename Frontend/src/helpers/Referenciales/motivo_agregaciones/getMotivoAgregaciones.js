import axios from 'axios';
import config from '../../../config';

export const getMotivoAgregaciones = async () => {

    const domain = config.API_URL;
    const path = '/referenciales/motivo_agregacion/list_motivo_agregacion.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    return data.result;
}