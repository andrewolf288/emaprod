import axios from 'axios';
import config from '../../../config';

export const getEstadoFinProgramadoProduccion = async () => {
    const domain = config.API_URL;
    const path = '/referenciales/produccion/list_estado_fin_programado_produccion.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    const { result } = data;

    return result;
}