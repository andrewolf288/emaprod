import axios from 'axios';
import config from '../../../config';

export const getProveedores = async () => {
    const domain = config.API_URL;
    const path = '/referenciales/proveedor/list_proveedores.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    return data.result;
}