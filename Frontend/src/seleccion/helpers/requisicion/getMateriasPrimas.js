import axios from 'axios';
import config from '../.././../config';

export const getMateriaPrima = async () => {
    const domain = config.API_URL;
    const path = '/almacen/materia_prima/list_materias_primas.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    return data.result;
}