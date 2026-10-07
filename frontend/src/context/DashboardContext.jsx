import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api";
import { useAuth } from "./AuthContext";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
    const auth = useAuth();

    const isAuthenticated = auth?.isAuthenticated;
    const isAdmin = auth?.isAdmin;
    const authLoading = auth?.loading;

    const [stats, setStats] = useState(null);
    const [recentReservations, setRecentReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardStats = async () => {
        if (!isAuthenticated || !isAdmin) {
            setStats(null);
            setRecentReservations([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [statsResponse, reservationsResponse] =
                await Promise.all([
                    api.get("/dashboard/stats"),
                    api.get("/dashboard/recent-reservations"),
                ]);

            setStats(statsResponse.data?.data || null);

            setRecentReservations(
                reservationsResponse.data?.data || []
            );
        } catch (error) {
            console.error("Dashboard API error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) {
            return;
        }

        fetchDashboardStats();
    }, [authLoading, isAuthenticated, isAdmin]);

    return (
        <DashboardContext.Provider
            value={{
                stats,
                recentReservations,
                loading: loading || authLoading,
                error,
                fetchDashboardStats,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error(
            "useDashboard must be used inside DashboardProvider"
        );
    }

    return context;
}