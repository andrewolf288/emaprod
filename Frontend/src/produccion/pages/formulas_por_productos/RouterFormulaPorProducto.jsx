import { ListFormulaPorProducto } from "./ListFormulaPorProducto";
import { AgregarFormulaPorProducto } from "./AgregarFormulaPorProducto";
import { ActualizarFormulaPorProducto } from "./ActualizarFormulaPorProducto";

export const RouterFormulaPorProducto = [
  {
    path: "",
    element: <ListFormulaPorProducto />,
  },
  {
    path: "crear",
    element: <AgregarFormulaPorProducto />,
  },
  {
    path: "actualizar/:idForProd",
    element: <ActualizarFormulaPorProducto />,
  },
];
