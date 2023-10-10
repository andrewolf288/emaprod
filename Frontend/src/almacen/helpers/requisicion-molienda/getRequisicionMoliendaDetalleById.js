import axios from 'axios';
import config from '../.././../config';

export const getRequisicionMoliendaDetalleById = async (id) => {
    const domain = config.API_URL;
    const path = '/almacen/requisicion-molienda/get_requisicion_molienda_detalle_by_id.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        id,
    });
    return data;
}