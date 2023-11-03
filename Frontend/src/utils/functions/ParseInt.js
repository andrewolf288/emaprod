export function _parseInt(str, property) {
  if (str.canProdAgr) {
    str.canReqDet = str.canProdAgr;
  }
  if (str.canTotProgProdFin) {
    str.canReqDet = str.canTotProgProdFin;
  }

  if (property) {
    str.canReqDet = str[property];
  }
  str.canReqDet = parseFloat(str.canReqDet).toFixed(2);
  let index = str.canReqDet.toString().indexOf(".");
  let result = str.canReqDet.toString().substring(index + 1);
  //console.log("index: ",index, "result: ", result)
  let val =
    parseInt(result) >= 1 && str.simMed !== "KGM"
      ? Math.trunc(str.canReqDet) + 1
      : str.canReqDet;
  return val;
}
