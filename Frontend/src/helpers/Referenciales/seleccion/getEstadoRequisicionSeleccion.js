import axios from 'axios';
import config from '../../../config';

export const getEstadoRequisicionSeleccion = async () => {

    const domain = config.API_URL;
    const path = '/referenciales/requisicion_seleccion_estado/list_requisicion_seleccion_detalle_estado.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data.result;
}