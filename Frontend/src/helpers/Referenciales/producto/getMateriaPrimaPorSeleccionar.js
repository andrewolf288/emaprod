import axios from 'axios';
import config from '../../../config';

export const getMateriaPrimaPorSeleccionar = async () => {
    const domain = config.API_URL;
    const path = '/referenciales/producto/list_materia_prima_por_seleccionar.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    const { result } = data;

    return result;
}