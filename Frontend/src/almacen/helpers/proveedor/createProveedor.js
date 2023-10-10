import axios from 'axios';
import config from '../.././../config';

export const createProveedor = async (body) => {

    const domain = config.API_URL;
    const path = '/almacen/proveedor/create_proveedor.php';
    const url = domain + path;
    const { data } = await axios.post(url, {
        ...body,
    });
    return data;
}