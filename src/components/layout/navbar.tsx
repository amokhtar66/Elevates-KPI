import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-xl font-bold text-primary">KPI Hub</h1>
        {session?.user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {session.user.name
                  ?.split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) ?? "?"}
              </div>
              <span className="text-sm font-medium">
                {session.user.name}
              </span>
            </div>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
