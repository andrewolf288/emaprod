import axios from 'axios';
import config from '../.././../config';

export const viewProduccionRequisicionDetalleById = async (idProdLot) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/view_produccion_lote_with_requisiciones.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        id: idProdLot
    });
    return data;
}