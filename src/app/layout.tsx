import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/store/AudioContext";
import { UIProvider } from "@/store/UIContext";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "void.audio",
  description: "Terminal-based audiovisual listening environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="h-full overflow-hidden selection:bg-primary/30">
        <UIProvider>
          <AudioProvider>
            {children}
          </AudioProvider>
        </UIProvider>
      </body>
    </html>
  );
}
