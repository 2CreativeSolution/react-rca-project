export const AUTH_COPY = {
  login: {
    panelTitle: "Manage plans, orders, and account actions in one workspace.",
    panelSubtitle:
      "Sign in once to unlock a unified catalog and faster customer-ready workflows.",
    valuePills: ["Secure sign-in", "Unified catalog", "Fast checkout"],
    actionTitle: "Sign in",
    actionSubtitle: "Use your email and password to continue.",
    submitLabel: "Sign in",
    signupCta: "Create account",
    credentialErrorMessage: "Unable to sign in with credentials.",
    missingIdentityWarningMessage:
      "Unable to find your RCA profile details. Redirecting to catalog page.",
    decisionWarningMessage:
      "Unable to verify active status right now. Redirecting to landing page.",
  },
  signup: {
    panelTitle: "Create your account and start from a unified catalog.",
    panelSubtitle:
      "Register with your credentials, then continue to protected workflows in one place.",
    valuePills: ["Quick setup", "Protected routes", "Session persistence"],
    actionTitle: "Sign up",
    actionSubtitle: "Use your email and password to create an account.",
    submitLabel: "Create account",
    loginCta: "Have an account? Sign in",
    fallbackErrorMessage: "Unable to create account.",
    profileWarningMessage: "Account created, but your profile details are still updating.",
    syncWarningMessage: "Account created, but profile sync is still pending.",
    defaultQuoteWarningMessage: "Account created, but default quote setup is still pending.",
    decisionWarningMessage: "Unable to verify active status right now. Redirecting to landing page.",
    validation: {
      fullNameRequired: "Full name is required.",
      invalidEmail: "Enter a valid email address.",
      passwordTooShort: "Password must be at least 8 characters.",
      passwordMismatch: "Passwords do not match.",
    },
  },
  logout: {
    preSignedOut: {
      panelTitle: "Your session is currently signed out.",
      panelSubtitle:
        "Sign in again to return to catalog workflows and protected account actions.",
      valuePills: ["Session cleared", "Secure sign-in", "Catalog ready"],
      actionTitle: "You are signed out",
      actionSubtitle: "Start a new session or go back to home.",
    },
    postSignedOut: {
      panelTitle: "Signed out successfully.",
      panelSubtitle: "Your active session was removed and protected routes now require sign-in.",
      valuePills: ["Session removed", "Data protected", "Ready to sign in"],
      actionTitle: "Sign-out complete",
      actionSubtitle: "Choose your next step.",
      alertMessage: "You have been signed out.",
      errorMessage: "Unable to sign out right now. Please try again.",
    },
    confirmSignOut: {
      panelTitle: "Finish your session on this device.",
      panelSubtitle: "Signing out clears local access and keeps protected data behind login.",
      valuePills: ["Protected routes", "Session control", "Secure logout"],
      actionTitle: "Confirm sign out",
      actionSubtitle: "You can stay signed in if you still need catalog access.",
      helperText: "You can sign in again any time.",
      confirmButtonLabel: "Sign out now",
      staySignedInLabel: "Stay signed in",
    },
    actions: {
      goToLogin: "Go to login",
      backToHome: "Back to home",
      signInAgain: "Sign in again",
    },
  },
} as const;
