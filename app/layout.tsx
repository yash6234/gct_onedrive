import "./globals.css";
import ToasterProvider from "./ToasterProvider";

export const metadata = {
  title: "Global Cad Technology",
  description: "GCT Sign in UI",
  icons: {
    icon: "/exp_logo.png",
    shortcut: "/exp_logo.png",
    apple: "/exp_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased text-neutral-900">
        {children}
        {/* Global toast portal */}
        <ToasterProvider />
      </body>
    </html>
  );
}
