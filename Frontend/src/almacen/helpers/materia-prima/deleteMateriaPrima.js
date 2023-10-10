import axios from 'axios';
import config from '../.././../config';

export const deleteMateriaPrima = async (idMateriaPrima) => {
    const domain = config.API_URL;
    const path = '/almacen/materia_prima/delete_materia_prima.php';
    const url = domain + path;
    const { data } = await axios.delete(url,
        {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                id: idMateriaPrima,
            },
        }
    );
    return data;
}