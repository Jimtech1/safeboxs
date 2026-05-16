import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [
    { title: "Agent Login — SafeBox" },
    { name: "description", content: "Sign in to your SafeBox agent dashboard." },
  ]}),
});

function Login() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-hero-gradient">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck /></div>
            <h1 className="mt-4 font-display text-2xl font-bold">Agent Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage trader savings and float.</p>
          </div>
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Welcome back, Adebayo"); navigate({ to: "/agent" }); }}>
            <div>
              <label className="text-sm font-medium">Phone or Agent ID</label>
              <Input className="mt-1.5 h-11" placeholder="0801 234 5678" defaultValue="AG-2000" />
            </div>
            <div>
              <label className="text-sm font-medium">PIN</label>
              <div className="relative">
                <Input type={show ? "text" : "password"} className="mt-1.5 h-11 pr-10" placeholder="••••" defaultValue="1234" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-muted-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Remember me</label>
              <a className="text-accent font-medium" href="#">Forgot PIN?</a>
            </div>
            <Button className="w-full h-11 bg-primary hover:bg-primary/90">Sign in</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to SafeBox? <Link to="/register" className="text-primary font-semibold">Open an account</Link>
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
