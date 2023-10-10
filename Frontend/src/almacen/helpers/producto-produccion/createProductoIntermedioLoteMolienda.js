import axios from 'axios';
import config from '../.././../config';

export const createProductoIntermedioLoteMolienda = async (body, idProdTip, dataEntrada) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/create_productos_intemedio_lote_molienda.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        detProdFinLotProd: body,
        idProdTip: idProdTip,
        datEntSto: dataEntrada
    });
    return data;
}