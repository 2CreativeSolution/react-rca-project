import axios from "axios";

export class ApiError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

export const httpClient = axios.create({
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed";
    return new ApiError(message, error.response?.status);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("Unknown API error");
}
