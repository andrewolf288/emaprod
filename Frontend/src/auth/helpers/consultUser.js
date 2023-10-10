import axios from 'axios';
import config from './../../config';

export const consultUser = async (body) => {
    const domain = config.API_URL;
    const path = "/auth/login/consult_user.php";
    const url = domain + path;
    var { data } = await axios.post(url, {
        ...body,
    })
    //var result = { idAre :4  } 
    //var message_error = ""
    //var description_error = ""
    //var data = {  message_error, description_error, result}
    //result = { idAre :4  } 

    return data;
}
