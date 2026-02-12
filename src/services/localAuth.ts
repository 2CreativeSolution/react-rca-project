import { LOCAL_AUTH_USERS_KEY } from "../constants/authStorage";

// Temporary client-side auth store used for email/password demo flows.
// This is separate from Salesforce OAuth and only manages local credential checks.
export type LocalAuthUser = {
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
};

type LocalAuthInput = {
  fullName: string;
  email: string;
  password: string;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getUsers(): LocalAuthUser[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(LOCAL_AUTH_USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LocalAuthUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: LocalAuthUser[]) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Registers a local user record in browser storage and prevents duplicate emails.
export function registerLocalUser(input: LocalAuthInput) {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const password = input.password;

  const users = getUsers();
  const exists = users.some((user) => normalizeEmail(user.email) === email);

  if (exists) {
    throw new Error("An account with this email already exists.");
  }

  const nextUser: LocalAuthUser = {
    fullName,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, nextUser]);
  return nextUser;
}

// Validates entered credentials against locally stored users.
export function validateLocalCredentials(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput);
  const user = getUsers().find((item) => normalizeEmail(item.email) === email);

  if (!user) {
    throw new Error("No account found for this email.");
  }

  if (user.password !== password) {
    throw new Error("Incorrect password.");
  }

  return user;
}
