import { ListProduccionLote } from "./ListProduccionLote";
import { CrearProduccionLote } from "./CrearProduccionLote";
import { ListAgregacion } from "./produccion_agregacion/ListAgregacion";
import { CrearProduccionLote2 } from "./CrearProduccionLote2";

export const RouterProduccionLote = [
  {
    path: "",
    element: <ListProduccionLote />,
  },
  {
    path: "crear",
    element: <CrearProduccionLote2 />,
  },
  {
    path: "produccion-agregacion",
    element: <ListAgregacion />,
  },
];
