import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DONATELLA | دوناتيلا - أزياء نسائية فاخرة",
  description: "متجر دوناتيلا للأزياء النسائية الفاخرة - فساتين، ملابس يومية، سهرات، وإكسسوارات",
  keywords: ["دوناتيلا", "أزياء", "نسائية", "فساتين", "موضة", "فاخرة"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="donatella-theme"
        >
          {children}
          <Toaster
            position="top-center"
            dir="rtl"
            richColors
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
