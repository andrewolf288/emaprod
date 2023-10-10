import axios from 'axios';
import config from '../../../config';

export const getMateriaPrimaById = async (idMateriaPrima) => {
    const domain = config.API_URL;
    const path = '/referenciales/producto/get_materia_prima_by_id.php';
    const url = domain + path;

    const { data } = await axios.post(
        url,
        {
            id: idMateriaPrima
        }
    );

    return data;
}