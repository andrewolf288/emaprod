import axios from 'axios';
import config from '../../../config';

export const getMotivoDevoluciones = async () => {

    const domain = config.API_URL;
    const path = '/referenciales/motivo_devolucion/list_motivo_devolucion.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    return data.result;
}