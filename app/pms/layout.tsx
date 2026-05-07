"use client";

import "../globals.css";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {AppSidebar} from "@/components/app-sidebar"

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <SidebarProvider>
                <AppSidebar/>
                <main className="flex-1 p-6 bg-gray-50 min-h-screen">
                    <div className="sticky top-6">
                        <SidebarTrigger/>
                    </div>
                    {children}
                </main>
            </SidebarProvider>
        </div>
    );
}