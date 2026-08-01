export interface AuthErrorMessage {
  code: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

const AUTH_ERROR_MAP: Record<string, AuthErrorMessage> = {
  OAuthAccountNotLinked: {
    code: "OAuthAccountNotLinked",
    title: "Sign-In Method Mismatch",
    description:
      "We found an existing account with this email address registered using a different sign-in method. Please sign in using your original method first.",
    actionText: "Try Different Sign-In",
    actionHref: "/login",
  },
  OAuthCreateAccount: {
    code: "OAuthCreateAccount",
    title: "Account Creation Failed",
    description: "Could not create account using social provider. Please try signing up with email.",
    actionText: "Back to Login",
    actionHref: "/login",
  },
  EmailCreateAccount: {
    code: "EmailCreateAccount",
    title: "Account Creation Failed",
    description: "Could not create account using this email address. Please try again.",
    actionText: "Try Again",
    actionHref: "/login",
  },
  Callback: {
    code: "Callback",
    title: "Sign-In Interrupted",
    description: "Authentication callback was cancelled or interrupted. Please try signing in again.",
    actionText: "Try Again",
    actionHref: "/login",
  },
  NoAccountFound: {
    code: "NoAccountFound",
    title: "Account Not Found",
    description: "No registered account exists with this provider. Please create a new account first.",
    actionText: "Create Account",
    actionHref: "/register",
  },
  AccessDenied: {
    code: "AccessDenied",
    title: "Access Denied",
    description: "Access was denied by the identity provider. Please approve the permissions request to sign in.",
    actionText: "Try Again",
    actionHref: "/login",
  },
  ExpiredSession: {
    code: "ExpiredSession",
    title: "Session Expired",
    description: "Your sign-in session has expired. Please sign in again.",
    actionText: "Sign In",
    actionHref: "/login",
  },
  VerificationFailed: {
    code: "VerificationFailed",
    title: "Verification Failed",
    description: "We couldn't verify your identity code. Please request a new verification code.",
    actionText: "Request New Code",
    actionHref: "/login",
  },
  Configuration: {
    code: "Configuration",
    title: "Authentication Unavailable",
    description: "Authentication service is temporarily misconfigured or unavailable. Please try again shortly.",
    actionText: "Refresh Page",
    actionHref: "/login",
  },
  Default: {
    code: "Default",
    title: "Authentication Error",
    description: "An unexpected authentication error occurred. Please try signing in again.",
    actionText: "Back to Sign In",
    actionHref: "/login",
  },
};

export function getAuthErrorMessage(errorCode?: string | null): AuthErrorMessage {
  if (!errorCode) return AUTH_ERROR_MAP.Default;
  return AUTH_ERROR_MAP[errorCode] || {
    ...AUTH_ERROR_MAP.Default,
    description: `An authentication issue occurred (${errorCode}). Please try again.`,
  };
}
