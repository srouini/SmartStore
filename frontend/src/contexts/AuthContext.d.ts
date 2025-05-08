import React from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials } from '../api/authService';
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}
declare const AuthContext: React.Context<AuthContextType>;
export declare const useAuth: () => AuthContextType;
interface AuthProviderProps {
    children: ReactNode;
}
export declare const AuthProvider: React.FC<AuthProviderProps>;
export default AuthContext;
