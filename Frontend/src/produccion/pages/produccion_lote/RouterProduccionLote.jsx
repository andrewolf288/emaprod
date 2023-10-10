import { ListProduccionLote } from "./ListProduccionLote";
import { CrearProduccionLote } from "./CrearProduccionLote";
import { ListAgregacion } from "./produccion_agregacion/ListAgregacion";

export const RouterProduccionLote = [
  {
    path: "",
    element: <ListProduccionLote />,
  },
  {
    path: "crear",
    element: <CrearProduccionLote />,
  },
  {
    path: "produccion-agregacion",
    element: <ListAgregacion />,
  },
];
