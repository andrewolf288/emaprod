import { ListAgregacion } from "./ListAgregacion";
import { AgregarAgregacion } from "./AgregarAgregacion";
import  { AtenderAgregaciones }  from "./AtenderAgregaciones";

export const RouterAlmacenAgregaciones = [
  {
    path: "",
    element: <ListAgregacion />,
  },
  {
    path: "crear",
    element: <AgregarAgregacion />,
  },
  {
    path: "assist-agregation/:id/:codAgre",
    element:<AtenderAgregaciones/>
  },
];
