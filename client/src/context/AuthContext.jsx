import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ role: 'GUEST', phone: null, isSuperAdmin: false });

    // Persist admin session lightly
    useEffect(() => {
        const stored = localStorage.getItem('badminton_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const login = (role, phone, isSuperAdmin) => {
        const newUser = { role, phone, isSuperAdmin };
        setUser(newUser);
        localStorage.setItem('badminton_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser({ role: 'GUEST', phone: null, isSuperAdmin: false });
        localStorage.removeItem('badminton_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAdmin: user.role === 'ADMIN',
            isSuperAdmin: user.isSuperAdmin,
            userPhone: user.phone
        }}>
            {children}
        </AuthContext.Provider>
    );
};
