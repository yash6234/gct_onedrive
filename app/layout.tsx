import "./globals.css";

export const metadata = {
  title: "GCT One Drive",
  description: "GCT Sign in UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased text-neutral-900">{children}</body>
    </html>
  );
}
