"use client";

import "../globals.css";


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            <main　className="flex-1 p-6 bg-gray-50">
                {children}
            </main>
        </div>
    );
}