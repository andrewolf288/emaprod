import axios from 'axios';
import config from '../.././../config';

export const anularRequisicionSeleccion = async (body) => {
    const domain = config.API_URL;
    const path = '/almacen/requisicion-seleccion/AnularRequisicion.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        ...body
    });
    return data;
}