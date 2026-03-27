import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qanoun Express | قانون إكسبريس",
  description:
    "Génération et analyse de documents juridiques marocains — bilingue Français/Arabe. Grounded in verified Moroccan law.",
  keywords: ["droit marocain", "contrat", "juridique", "قانون", "عقد", "المغرب"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: { fontFamily: "inherit" },
          }}
        />
      </body>
    </html>
  );
}
