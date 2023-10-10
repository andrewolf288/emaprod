import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NavMolienda from "./../molienda/components/NavMolienda";

export const ProtectedLayoutMolienda = () => {
  // OBTENEMOS INFORMACION DEL LOCALSTORAGE
  const { user } = useAuth();
  const outlet = useOutlet();

  if (!user) {
    return <Navigate to={"/login"} />;
  } else {
    const { idAre } = user;
    if (idAre !== 2) {
      return <Navigate to={"/login"} />;
    }
  }
  return (
    <>
      <NavMolienda />
      <main>{outlet}</main>
      <footer></footer>;
    </>
  );
};
