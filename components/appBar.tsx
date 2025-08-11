// components/appBar.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { bottomNavRoutes } from "@/config/navigation";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";

// Se crea el cliente una sola vez para que sea persistente en el ciclo de vida del componente
const supabase = createClient();

export default function AppBar() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Escucha todos los cambios en el estado de autenticación.
    // Este listener se dispara una vez inmediatamente con el estado actual de la sesión.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Evento de autenticación:', event); // Para depuración, puedes ver qué evento se dispara
      setUser(session?.user ?? null);
    });

    // Limpieza del listener al desmontar el componente
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, []);

  const handleClick = (path: string, index: number) => {
    router.push(path);
    const btn = navRef.current?.children[index] as HTMLButtonElement;
    if (btn) {
      gsap.fromTo(
        btn,
        { scale: 1 },
        { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.out" }
      );
    }
  };

  return (
    <div
      ref={navRef}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <nav className="flex gap-4 px-4 py-2 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-gray-200 items-center">
        {bottomNavRoutes.map(({ label, path, icon: Icon }, index) => {
          const isActive = pathname === path;

          return (
            <button
              key={path}
              onClick={() => handleClick(path, index)}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-xl transition-colors",
                isActive
                  ? ""
                  : "text-muted-foreground hover:bg-muted"
              )}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.05,
                  duration: 0.2,
                  ease: "power1.out",
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1,
                  duration: 0.2,
                  ease: "power1.out",
                });
              }}
            >
              <Icon className="h-5 w-5" />
              {isActive && (
                <span
                  className="text-sm font-bold whitespace-nowrap"
                  style={{ overflow: "hidden" }}
                >
                  {label}
                </span>
              )}
            </button>
          );
        })}
        {user && (
          <button onClick={() => router.push('/dashboard')}>
            <Avatar>
              <AvatarImage src={user.user_metadata.avatar_url} />
              <AvatarFallback>
                {user.user_metadata.full_name
                  ? user.user_metadata.full_name[0]
                  : user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </nav>
    </div>
  );
}