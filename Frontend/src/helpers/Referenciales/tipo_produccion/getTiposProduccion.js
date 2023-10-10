import axios from 'axios';
import config from '../../../config';

export const getTiposProduccion = async () => {
    const domain = config.API_URL;
    const path = '/referenciales/tipo_produccion/list_tipo_produccion.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    return data.result;
}