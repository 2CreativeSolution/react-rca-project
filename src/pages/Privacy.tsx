import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export default function Privacy() {
  return <Navigate to={`${ROUTES.legal}#privacy`} replace />;
}
