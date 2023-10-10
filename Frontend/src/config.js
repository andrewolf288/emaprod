
const dev = {
    //API_URL: "http://localhost/EMAPROD/Backend"
    API_URL: "http://192.168.1.136/EMAPROD/Backend"
    //API_URL: "http://127.0.0.1:8000"

    //API_URL: "http://localhost/EMAPROD/Backend"
    //url = `http://localhost/EMAPROD/Backend/produccion/produccion-lote/get_produccion_data.php?id=${id}`;

}
const prod = {
    API_URL: "https://emaprod.emaransac.com/"
}
const config = process.env.NODE_ENV == 'development' ? dev : prod
export default config