import axios from 'axios';
import config from '../../../config';

export const getPresentacionFinal = async (idProdt) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/referenciales/producto/list_productos_presentacion_final.php';
    const url = domain + path;
    const { data } = await axios.post(url,{idProdt});
    console.log(data)
     return data.result;
}