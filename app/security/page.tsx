import { Suspense } from "react";
import SecurityClient from "./client";

export default function SecurityPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<h1 className="text-4xl font-bold">Acceso al Estadio</h1>
			<Suspense fallback={<div>Loading...</div>}>
				<SecurityClient />
			</Suspense>
		</div>
	);
}
