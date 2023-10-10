import axios from 'axios';
import config from '../.././../config';

export const getProveedorById = async (idProveedor) => {

    const domain = config.API_URL;
    const path = '/almacen/proveedor/view_proveedor.php';
    const url = domain + path;

    const { data } = await axios.post(
        url,
        {
            id: idProveedor
        },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    );
    return data.result;
}