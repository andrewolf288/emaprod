import { ListLoteProduccion } from "./ListLoteProduccion";
import { ViewLoteProduccion } from "./ViewLoteProduccion";
//import { AtenderAgregaciones } from "./AtenderAgregaciones";
//import  { AtenderAgregaciones }  from "./AtenderAgregaciones";

export const RouterAlmacenLoteProduccion = [
  {
    path: "",
    element: <ListLoteProduccion />,
  },
  //{
  //  path: "assist-agregation/:id",
  //  element:<AtenderAgregaciones/>
  //},
  {
    path: "view/:id",
    element: <ViewLoteProduccion />,
  },
];
