import axios from 'axios';
import config from '../.././../config';

export const getAreaEncargada = async () => {

    const domain = config.API_URL;
    const path = '/referenciales/area/list_areas.php';
    const url = domain + path;
    const { data } = await axios.post(url);
    const { result } = data;
    return result;
}