export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    token: string;
}
export interface LoginCredentials {
    username: string;
    password: string;
}
declare const authService: {
    getCSRFToken: () => Promise<any>;
    login: (credentials: LoginCredentials) => Promise<any>;
    logout: () => Promise<any>;
    getCurrentUser: () => Promise<any>;
};
export default authService;
