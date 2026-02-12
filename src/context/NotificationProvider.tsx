import { Alert, Snackbar } from "@mui/material";
import { useMemo, useState, type ReactNode } from "react";
import type {
  NotificationContextType, NotificationSeverity,
  NotifyOptions,
} from "./NotificationContext";
import { NotificationContext } from "./NotificationContext";

const DEFAULT_SEVERITY: NotificationSeverity = "info";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    open: false,
    message: "",
    severity: DEFAULT_SEVERITY,
  });

  const notify = ({ message, severity = DEFAULT_SEVERITY }: NotifyOptions) => {
    setState({
      open: true,
      message,
      severity,
    });
  };

  const value = useMemo<NotificationContextType>(
    () => ({
      notify,
      notifySuccess: (message: string) => notify({ message, severity: "success" }),
      notifyInfo: (message: string) => notify({ message, severity: "info" }),
      notifyWarning: (message: string) => notify({ message, severity: "warning" }),
      notifyError: (message: string) => notify({ message, severity: "error" }),
    }),
    []
  );

  const close = () => {
    setState((previous) => ({ ...previous, open: false }));
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={3500}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={close} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
          {state.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
