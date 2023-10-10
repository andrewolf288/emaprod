import axios from 'axios';
import config from '../../../config';

export const getEstadoRequisicionMolienda = async () => {

    const domain = config.API_URL;
    const path = '/referenciales/requisicion_molienda_estado/list_requisicion_molienda_estado.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data.result;
}