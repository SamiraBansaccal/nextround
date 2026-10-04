import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist_Mono, Lora, Nunito_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getUiLang } from "@/lib/i18n/server";
import "./globals.css";

// Fonts of the design (Lovable prototype): Lora for titles, Nunito Sans for text.
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["500", "600", "700"] });
const nunito = Nunito_Sans({ variable: "--font-nunito", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NextRound — Reach the next interview round, without inventing anything",
  description: "Interview practice on the company's stack. Every claim traced to your profile. Bring your own AI.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getUiLang(); // the site's interface language (cookie, English by default)
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${lora.variable} ${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
