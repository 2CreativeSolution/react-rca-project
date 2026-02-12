import { createContext } from "react";

export type NotificationSeverity = "success" | "info" | "warning" | "error";

export type NotifyOptions = {
  message: string;
  severity?: NotificationSeverity;
};

export type NotificationContextType = {
  notify: (options: NotifyOptions) => void;
  notifySuccess: (message: string) => void;
  notifyInfo: (message: string) => void;
  notifyWarning: (message: string) => void;
  notifyError: (message: string) => void;
};

export const NotificationContext = createContext<NotificationContextType | null>(null);
