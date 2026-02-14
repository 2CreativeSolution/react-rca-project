import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export default function Terms() {
  return <Navigate to={`${ROUTES.legal}#terms`} replace />;
}
