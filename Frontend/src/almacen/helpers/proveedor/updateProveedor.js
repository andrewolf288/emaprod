import axios from 'axios';
import config from '../.././../config';

export const updateProveedor = async (idProveedor, body) => {

    const domain = config.API_URL;
    const path = '/almacen/proveedor/update_proveedor.php';
    const url = domain + path;

    const { data } = await axios.put(
        url,
        {
            ...body,
            id: idProveedor,
        },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    );
    return data;
}