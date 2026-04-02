"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthRedirect() {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Only redirect if explicitly authenticated and loading is finished
        if (!isLoading && isAuthenticated && user) {
            // Only redirect admins to their dashboard
            // Normal users stay on the home page as per user preference
            if (user.role === 'admin' || user.role === 'master_admin') {
                router.push('/admin/dashboard');
            }
        }
    }, [isAuthenticated, user, isLoading, router]);

    return null;
}
