import axios from 'axios';
import config from '../.././../config';

export const createMateriaPrima = async (body) => {

    const domain = config.API_URL;
    const path = '/almacen/materia_prima/create_materia_prima.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        ...body,
    });
    return data;
}