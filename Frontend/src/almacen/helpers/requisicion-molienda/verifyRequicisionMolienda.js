import axios from 'axios';
import config from '../.././../config';

export const verifyRequisicionMolienda = async (idReqMol) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/almacen/requisicion-molienda/verify_requisicion_molienda.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        id: idReqMol
    });

    return data;
}