"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useVerifyTokenQuery } from "@/lib/redux/features/auth/authApiSlice";
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice";
import { Spinner } from "@/components/ui/spinner";
import BigsterLoader from "./BigsterLoader";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const { isLoading, isError } = useVerifyTokenQuery(undefined, {
    skip: !isClient || !token || !!user,
  });

  useEffect(() => {
    if (isClient && !isLoading && (isError || !token)) {
      router.push("/login");
    }
  }, [isClient, isLoading, isError, token, router]);

  if (!isClient || isLoading || !user) {
    return <BigsterLoader text="Caricamento" />;
  }

  return <>{children}</>;
}
