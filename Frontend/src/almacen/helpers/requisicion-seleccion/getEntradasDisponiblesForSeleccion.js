import axios from 'axios';
import config from '../.././../config';

export const getEntradasDisponiblesForSeleccion = async (id) => {
    const domain = config.API_URL;
    const path = '/almacen/requisicion-seleccion/getEntradasDisponiblesByMatPriSel.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        idMatPri: id,
    });
    return data;
}