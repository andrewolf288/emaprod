import { AgregarAtributosCalidad } from "./AgregarAtributosCalidad";
import { ListAtributosCalidad } from "./ListAtributosCalidad";
import { UpdateAtributosCalidad } from "./UpdateAtributosCalidad";

export const RouterAtributoCalidad = [
  {
    path: "",
    element: <ListAtributosCalidad />
  },
  {
    path: "update/:idAtributoCalidad",
    element: <UpdateAtributosCalidad />
  },
  {
    path: "crear",
    element: <AgregarAtributosCalidad />
  }
];
