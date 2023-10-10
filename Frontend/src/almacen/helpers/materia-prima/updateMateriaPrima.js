import axios from 'axios';
import config from '../.././../config';

export const updateMateriaPrima = async (idMateriaPrima, body) => {
    const domain = config.API_URL;
    const path = '/almacen/materia_prima/update_materia_prima.php';
    const url = domain + path;

    const { data } = await axios.put(
        url,
        {
            ...body,
            id: idMateriaPrima,
        },
    );
    return data;
}