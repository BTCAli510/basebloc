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
      </head>
      <body>
        <AppPrivyProvider>
          <Providers>{children}</Providers>
        </AppPrivyProvider>
      </body>
    </html>
  );
}
