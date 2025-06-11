// app/dashboard/layout.tsx
import { Sidebar } from '@/components/layout/sidebar';
import { Toaster } from '@/components/ui/toaster'; // It's good practice to have Toaster available in layouts that might trigger toasts

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8"> {/* Added some padding to main content area */}
        {children}
      </main>
      {/* Toaster can be here or in the root layout, depending on desired scope */}
      {/* <Toaster /> */}
    </div>
  );
}
