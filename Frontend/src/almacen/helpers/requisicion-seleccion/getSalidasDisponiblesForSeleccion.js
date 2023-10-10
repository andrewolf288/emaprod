import axios from 'axios';
import config from '../.././../config';

export const getSalidasDisponiblesForSeleccion = async (idReqSel, idMatPri) => {
    const domain = config.API_URL;
    const path = '/almacen/requisicion-seleccion/getSalidasDisponiblesByReqSelDet.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        idReqSel: idReqSel,
        idMatPri: idMatPri,
    });
    return data;
}