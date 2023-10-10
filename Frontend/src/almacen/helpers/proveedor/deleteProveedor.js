import axios from 'axios';
import config from '../.././../config';

export const deleteProveedor = async (idProveedor) => {

    const domain = config.API_URL;
    const path = '/almacen/proveedor/delete_proveedor.php';
    const url = domain + path;

    const { data } = await axios.delete(url,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                id: idProveedor,
            },
        }
    );
    return data;
}