import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { ErrorCatcher } from "@/components/ErrorCatcher";
import AppBar from "@/components/appBar";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Podium",
	description: "Aguidom QR Scanner",
};

const InterSans = Inter({
	variable: "--font-inter-sans",
	display: "swap",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${InterSans.className} antialiased min-h-screen`}>
				<AppBar />
				{children}
				<ErrorCatcher />
				<Toaster />
			</body>
		</html>
	);
}
