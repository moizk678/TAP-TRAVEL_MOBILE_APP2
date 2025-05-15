// src/Context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Automatically check token when app starts
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem("token");
            setIsAuthenticated(!!token);
        };
        checkToken();
    }, []);

    // Login function (save token + set auth state)
    const login = async (token) => {
        await AsyncStorage.setItem("token", token);
        setIsAuthenticated(true);
    };

    // Logout function (remove token + unset auth state)
    const logout = async () => {
        await AsyncStorage.removeItem("token");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
