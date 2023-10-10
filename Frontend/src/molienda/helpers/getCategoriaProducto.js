import axios from 'axios';
import config from './../../config';

export const getCategoriaProducto = async () => {

    const domain = config.API_URL;
    const path = '/molienda/producto-categoria/list-categoria-producto.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data.result;
}