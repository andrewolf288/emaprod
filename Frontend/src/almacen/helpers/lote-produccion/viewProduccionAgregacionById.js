import axios from 'axios';
import config from '../.././../config';

export const viewProduccionAgregacionById = async (idProdLot, codAgre) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/view_produccion_lote_with_agregaciones.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        id: idProdLot,
        codAgre:codAgre
    });
    return data;
}