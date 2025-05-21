// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Automatically check token when app starts
    useEffect(() => {
        const checkToken = async () => {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem("token");
                
                if (token) {
                    setIsAuthenticated(true);
                    // Fetch user data if token exists
                    await fetchUserData(token);
                } else {
                    setIsAuthenticated(false);
                    setUserData(null);
                }
            } catch (err) {
                console.error("Error checking authentication:", err);
                setError("Authentication check failed");
            } finally {
                setLoading(false);
            }
        };
        
        checkToken();
    }, []);
    
    // Fetch user data with token
    const fetchUserData = async (token) => {
        try {
            // Replace this with your actual API call to get user data
            // Example:
            // const response = await fetch('https://your-api.com/user/profile', {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            // const data = await response.json();
            // setUserData(data);
            
            // For now, we'll just simulate getting user data
            console.log("Fetching user data with token:", token);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Simulated user data
            const mockUserData = {
                id: "user123",
                name: "Travel User",
                email: "user@taptravel.com",
                recentTrips: []
            };
            
            setUserData(mockUserData);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to load user data");
        }
    };

    // Add refreshUserData function for pull-to-refresh functionality
    const refreshUserData = async () => {
        if (!isAuthenticated) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }
            
            // Refresh user data from API
            await fetchUserData(token);
            
            // You can also refresh other app data here
            console.log("User data refreshed successfully");
        } catch (err) {
            console.error("Failed to refresh user data:", err);
            setError("Failed to refresh data");
        } finally {
            setLoading(false);
        }
    };

    // Login function (save token + set auth state)
    const login = async (token) => {
        try {
            setLoading(true);
            await AsyncStorage.setItem("token", token);
            setIsAuthenticated(true);
            
            // Fetch user data after successful login
            await fetchUserData(token);
        } catch (err) {
            console.error("Login error:", err);
            setError("Login failed");
        } finally {
            setLoading(false);
        }
    };

    // Logout function (remove token + unset auth state)
    const logout = async () => {
        try {
            setLoading(true);
            await AsyncStorage.removeItem("token");
            setIsAuthenticated(false);
            setUserData(null);
        } catch (err) {
            console.error("Logout error:", err);
            setError("Logout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                userData,
                loading,
                error,
                login,
                logout,
                refreshUserData, // Added refreshUserData function
                setError // Expose for error handling
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;