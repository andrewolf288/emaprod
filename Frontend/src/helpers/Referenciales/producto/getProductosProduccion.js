import axios from 'axios';
import config from '../../../config';

export const getProductosProduccion = async (idFrescos, idSalPar,idMol) => {
    const { API_URL } = config;
    const domain = API_URL;
    const path = '/referenciales/producto/list_productos_produccion.php';
    const url = domain + path;
    const { data } = await axios.post(url,{
        idFrescos, idSalPar,idMol
    });
    //console.log(data)
    return data.result;
}