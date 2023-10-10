import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavSeleccion from "./../seleccion/components/NavSeleccion";

export const ProtectedLayoutSeleccion = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth();
  const outlet = useOutlet();

  if (!user) {
    return <Navigate to={"/login"} />;
  } else {
    const { idAre } = user;
    if (idAre !== 3) {
      return <Navigate to={"/login"} />;
    }
  }
  return (
    <>
      <NavSeleccion />
      <main>{outlet}</main>
      <footer></footer>;
    </>
  );
};
