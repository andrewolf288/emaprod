import axios from 'axios';
import config from '../../../config';

export const getProductosDisponiblesProduccion = async () => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/almacen/productos-produccion/listProductosFinalesByLoteProduccion.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data;
}