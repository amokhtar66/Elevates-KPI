import { Navbar } from "./navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
}
