import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { UserRole } from "@prisma/client";
import SessionProvider from "./SessionProvider";
import Navbar from "./_components/Navbar";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user || session.user.role !== UserRole.SUPERADMIN) {
    redirect("/");
  }

  return (
    <SessionProvider value={session}>
      <Toaster />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        {/* Add the Navbar here */}
        <div className="bg-slate-400"></div>
        <div className="flex w-full grow">
          <main className="flex-grow">{children}</main>
        </div>
        FOOTER
      </div>
    </SessionProvider>
  );
}
