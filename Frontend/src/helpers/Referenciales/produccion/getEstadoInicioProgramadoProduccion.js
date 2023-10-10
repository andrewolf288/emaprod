import axios from 'axios';
import config from '../../../config';

export const getEstadoInicioProgramadoProduccion = async () => {
    const domain = config.API_URL;
    const path = '/referenciales/produccion/list_estado_inicio_programado_produccion.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    const { result } = data;

    return result;
}