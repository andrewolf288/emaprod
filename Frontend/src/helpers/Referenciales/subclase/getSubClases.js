import axios from "axios";
import config from "../../../config";

export const getSubClases = async () => {
  const domain = config.API_URL;
  const path = "/referenciales/sub_clase/list_sub_clase.php";
  const url = domain + path;

  const { data } = await axios.post(url);
  return data.result;
};
