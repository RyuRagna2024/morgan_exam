import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { UserRole } from "@prisma/client";
import SessionProvider from "./SessionProvider";
import Navbar from "./_components/Navbar";
import Sidebar from "./_components/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (
    !session.user ||
    (session.user.role !== UserRole.ADMIN &&
      session.user.role !== UserRole.SUPERADMIN)
  ) {
    redirect("/");
  }

  return (
    <SessionProvider value={session}>
      <div className="flex h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
        <Toaster />
      </div>
    </SessionProvider>
  );
}
