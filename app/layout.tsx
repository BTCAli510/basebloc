import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import AppPrivyProvider from "@/components/PrivyProvider";

export const metadata: Metadata = {
  title: "BASEbloc.app",
  icons: {
    icon: "/BASEfavicon.png",
    shortcut: "/BASEfavicon.png",
  },
  other: {
    "base:app_id": "69a79ca414fc33c964120f9c",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/BASEfavicon.png" />
        <link rel="shortcut icon" type="image/png" href="/BASEfavicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppPrivyProvider>
          <Providers>{children}</Providers>
        </AppPrivyProvider>
      </body>
    </html>
  );
}
