import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isOwner: boolean;
  unlockOwnerMode: (passcode: string) => boolean;
  lockOwnerMode: () => void;
  ownerToken: string | null;
  authHeader: Record<string, string>;
}

const AuthContext = createContext<AuthContextType>({
  isOwner: false,
  unlockOwnerMode: () => false,
  lockOwnerMode: () => {},
  ownerToken: null,
  authHeader: {},
});

const STORAGE_KEY = "yashuverse_owner_session";
const VALID_PASSCODES = ["yashuverse-owner-2026", "yashwanth-architect-auth"];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ownerToken, setOwnerToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(STORAGE_KEY);
    }
    return null;
  });

  const isOwner = Boolean(ownerToken);

  useEffect(() => {
    if (ownerToken) {
      sessionStorage.setItem(STORAGE_KEY, ownerToken);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [ownerToken]);

  const unlockOwnerMode = (passcode: string): boolean => {
    const trimmed = passcode.trim();
    if (VALID_PASSCODES.includes(trimmed)) {
      const token = `owner_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setOwnerToken(token);
      return true;
    }
    return false;
  };

  const lockOwnerMode = () => {
    setOwnerToken(null);
  };

  const authHeader: Record<string, string> = ownerToken
    ? { "X-Owner-Token": ownerToken }
    : {};

  return (
    <AuthContext.Provider
      value={{
        isOwner,
        unlockOwnerMode,
        lockOwnerMode,
        ownerToken,
        authHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
