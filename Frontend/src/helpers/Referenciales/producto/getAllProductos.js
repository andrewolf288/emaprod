import axios from 'axios';
import config from '../../../config';

export const getAllProductos = async (user) => {
    const domain = config.API_URL;
    const path = '/referenciales/producto/list_all_productos.php';
    const url = domain + path;

    const { data } = await axios.post(url);
    const { result } = data;

    //24 - 05 => 1 - 1
    //24 - 03 => 1
    //24 - 02
    //24 - 01
    let sss = ["2400","2401","2402","2403","2405"]
    //let sss = []


    result.map((item)=>{
        if(item.nomProd == "CC"){
            console.log(item)

        }
    })
    let unique = result.reduce(function (acc, curr) {
        if (!acc.map((obj) => obj.id).includes(curr.id))
            acc.push(curr);
        return acc;
    }, []);

  
    if(user.idAre === 4 ){
        unique = unique.filter((obj)=> !sss.includes(obj.codSubCla) )
    }
    return unique;

}