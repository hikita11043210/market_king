import { Sidebar } from "@/components/layout/Sidebar";

export default function ShippingCalculatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50">
                {children}
            </main>
        </div>
    );
} 