import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout/Header";
import { BootScreen } from "@/components/layout/BootScreen";
import { ToastHost } from "@/components/layout/ToastHost";
import { WalletProvider } from "@/hooks/useWallet";
import { GodStoreProvider } from "@/hooks/useGodStore";
import { store } from "@/lib/database/store";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "AI GOD — Create Your Own Artificial God",
    template: "%s · AI GOD",
  },
  description:
    "Create an AI God. Choose its attributes, beliefs and personality. Follow Gods, send prayers and explore an evolving artificial mythology.",
  keywords: ["AI god", "artificial deity", "AI mythology", "web3", "create a god"],
  openGraph: {
    title: "AI GOD — Create Your Own Artificial God",
    description:
      "What if humans could create gods? Choose attributes, birth a unique AI God, gain followers and build a belief system.",
    type: "website",
    siteName: "AI GOD",
    images: [{ url: "/backgrounds/hero-deity.png", width: 1024, height: 1536, alt: "AI GOD" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI GOD — Create Your Own Artificial God",
    description: "Many Gods. Many Beliefs. One Multiverse.",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gods = store.list({ limit: 200 });
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Inter:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-void text-ivory antialiased">
        <WalletProvider>
          <GodStoreProvider initialGods={gods}>
            <BootScreen />
            <Header />
            <main className="relative pt-[72px]">{children}</main>
            <Footer />
            <ToastHost />
          </GodStoreProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
