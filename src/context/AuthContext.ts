import type { AuthContextType } from "./authTypes";
import { createContext } from "react";

export const AuthContext = createContext<AuthContextType | null>(null);
