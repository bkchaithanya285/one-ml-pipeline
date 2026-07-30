import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "ONE COMPLETE MACHINE LEARNING PIPELINE | CSI KARE",
  description:
    "Official registration portal for ONE COMPLETE MACHINE LEARNING PIPELINE webinar organized by Computer Society of India (CSI) KARE Student Chapter - CLAIM GROUP 3.",
  keywords: [
    "CSI KARE",
    "Machine Learning Pipeline",
    "KARE Student Chapter",
    "CLAIM GROUP 3",
    "Machine Learning Webinar",
    "Event Registration",
  ],
  openGraph: {
    title: "ONE COMPLETE MACHINE LEARNING PIPELINE | CSI KARE",
    description:
      "Join us for our Machine Learning Webinar on Sunday, 9 August at 8th Block Seminar Hall.",
    url: "https://one-ml-pipe.web.app",
    siteName: "CSI KARE Student Chapter",
    images: [
      {
        url: "/csi-logo.jpg",
        width: 800,
        height: 600,
        alt: "CSI KARE Machine Learning Webinar",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ONE COMPLETE MACHINE LEARNING PIPELINE | CSI KARE",
    description:
      "Join us for our Machine Learning Webinar organized by CSI KARE Student Chapter.",
    images: ["/csi-logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/csi-logo.jpg" />
      </head>
      <body className="bg-[#030712] text-gray-100 antialiased selection:bg-cyan-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
