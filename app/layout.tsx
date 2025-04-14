import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import SessionProvider from "./SessionProvider";
import { validateRequest } from "@/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, session } = await validateRequest();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider value={{ user, session }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
