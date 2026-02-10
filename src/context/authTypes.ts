export type AuthContextType = {
  isLoggedIn: boolean;
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  logout: () => void;
};
