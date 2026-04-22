import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    type User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import apiClient from '../services/apiService';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signup: (email: string, password: string, name: string, technicalBackground: string, ageGroup: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

interface Props { children: ReactNode; }

export function AuthProvider({ children }: Props) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Attach Firebase ID token to every axios request automatically
    useEffect(() => {
        const interceptorId = apiClient.interceptors.request.use(async (config) => {
            if (auth.currentUser) {
                const token = await auth.currentUser.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
        return () => apiClient.interceptors.request.eject(interceptorId);
    }, []);

    async function signup(email: string, password: string, name: string, technicalBackground: string, ageGroup: string) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name });
        // Register user profile in our PostgreSQL database
        await apiClient.post('/auth/register', { name, technicalBackground, ageGroup });
    }

    async function login(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    async function loginWithGoogle() {
        const { user } = await signInWithPopup(auth, googleProvider);
        // Register with backend if this is their first Google login
        try {
            await apiClient.post('/auth/register', {
                name: user.displayName || 'User',
                technicalBackground: 'none',
                ageGroup: '18-24',
            });
        } catch {
            // User already exists — that's fine
        }
    }

    async function logout() {
        await signOut(auth);
    }

    async function resetPassword(email: string) {
        await sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-t-blue-400 border-white/10 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-medium">Initializing PhishGuard...</p>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
