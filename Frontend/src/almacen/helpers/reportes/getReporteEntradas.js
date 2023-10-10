import axios from 'axios';
import config from '../.././../config';

export const getReporteEntradas = async (body) => {
    const domain = config.API_URL;
    const path = '/almacen/reportes/reporte-entrada.php';
    const url = domain + path;

    const { data } = await axios.post(url, {
        ...body
    });
    console.log(data);
    return data;
}