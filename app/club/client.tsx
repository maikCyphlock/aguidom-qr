"use client";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Users,
	QrCode,
	Calendar,
	CheckCircle,
	UserCheck,
	Search,
} from "lucide-react";

type Club = { id: string; name: string };
export type AttendanceItem = {
	attendanceId: string;
	userName: string | null;
	scanTime: number | string;
};
export type Member = {
	userId: string;
	name: string | null;
	email: string;
};

function formatTime(value: number | string): string {
	const secs = typeof value === "string" ? parseInt(value, 10) : value;
	if (!Number.isFinite(secs)) return "";
	const d = new Date(secs * 1000);
	return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ClubClient({
	club,
	attendances,
	members,
}: {
	club: Club;
	attendances: AttendanceItem[];
	members: Member[];
}) {
	const [activeTab, setActiveTab] = useState("attendance");
	const [scanResult, setScanResult] = useState("");
	const [showScanDialog, setShowScanDialog] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	// Totales basados en datos reales
	const totalMembers = members.length;
	const uniquePresent = new Set(
		attendances
			.map((a) => a.userName ?? "")
			.filter((n) => n && n.trim().length > 0),
	).size;
	const totalPresent = uniquePresent;

	const handleQRScan = () => {
		// Aquí podrías integrar el flujo real de escaneo
		setScanResult(`Escaneo simulado en ${club.name}`);
		setShowScanDialog(true);
	};

	// filteredMembers se calcula solo donde se usa para evitar lints

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="border-b border-gray-200 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-wrap justify-between items-center py-4 gap-4">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
								<span className="text-white font-bold text-lg">A</span>
							</div>
							<div>
								<h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
									{club.name}
								</h1>
								<p className="text-xs sm:text-sm text-gray-500">
									Sistema de Asistencias
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-1">
							<span className="text-sm text-gray-500">Hoy</span>
							<Calendar className="w-4 h-4 text-gray-400" />
						</div>
					</div>
				</div>
			</header>

			{/* Navigation */}
			<nav className="border-b border-gray-200 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-wrap gap-x-4 gap-y-2 sm:space-x-8">
						{[
							{ id: "dashboard", label: "Dashboard", icon: Calendar },
							{ id: "scan", label: "Escanear QR", icon: QrCode },
							{ id: "members", label: "Miembros", icon: Users },
							{ id: "attendance", label: "Asistencias", icon: UserCheck },
						].map(({ id, label, icon: Icon }) => (
							<button
								key={id}
								onClick={() => setActiveTab(id)}
								className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
									activeTab === id
										? "border-black text-black"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
								type="button"
							>
								<Icon className="w-4 h-4" />
								<span>{label}</span>
							</button>
						))}
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Dashboard */}
				{activeTab === "dashboard" && (
					<div className="space-y-6">
						{/* Stats */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium text-gray-600">
										Total Miembros
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-black">
										{totalMembers}
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium text-gray-600">
										Presentes Hoy
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-green-600">
										{totalPresent}
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium text-gray-600">
										Ausentes
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-red-600">
										{Math.max(totalMembers - totalPresent, 0)}
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium text-gray-600">
										% Asistencia
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-3xl font-bold text-black">
										{totalMembers > 0
											? Math.round((totalPresent / totalMembers) * 100)
											: 0}
										%
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				)}

				{/* QR Scanner */}
				{activeTab === "scan" && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Escáner de Código QR</CardTitle>
								<CardDescription>
									Escanea el código QR del miembro para registrar asistencia
								</CardDescription>
							</CardHeader>
							<CardContent className="text-center py-12">
								<div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-6">
									<QrCode className="w-24 h-24 text-gray-400" />
								</div>
								<button
									onClick={handleQRScan}
									className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
									type="button"
								>
									Iniciar Escaneo
								</button>
								<p className="text-sm text-gray-500 mt-4">
									Posiciona el código QR frente a la cámara
								</p>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Attendance */}
				{activeTab === "attendance" && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Registro de Asistencias</CardTitle>
								<CardDescription>Histórico de asistencias</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{attendances.map((record) => (
										<div
											key={record.attendanceId}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div className="flex items-center space-x-3">
												<CheckCircle className="w-6 h-6 text-green-500" />
												<div>
													<p className="font-medium text-gray-900">
														{record.userName ?? "Desconocido"}
													</p>
													<p className="text-sm text-gray-500">{club.name}</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-medium text-gray-900">
													{formatTime(record.scanTime)}
												</p>
												<p className="text-sm text-green-600">
													Acceso autorizado
												</p>
											</div>
										</div>
									))}
									{attendances.length === 0 && (
										<p className="text-sm text-gray-500">
											No hay asistencias registradas aún.
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Members */}
				{activeTab === "members" && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Miembros</CardTitle>
								<CardDescription>Miembros del club</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col sm:flex-row gap-4">
									<div className="flex-1 relative">
										<Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
										<input
											type="text"
											placeholder="Buscar miembro..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
										/>
									</div>
									{/* Filtro por club removido, estamos dentro de un solo club */}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Lista de Miembros</CardTitle>
								<CardDescription>
									{
										members.filter((m) =>
											(m.name ?? "")
												.toLowerCase()
												.includes(searchTerm.toLowerCase()),
										).length
									}{" "}
									de {members.length} miembros
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{members
										.filter((m) =>
											(m.name ?? "")
												.toLowerCase()
												.includes(searchTerm.toLowerCase()),
										)
										.map((member) => (
											<div
												key={member.userId}
												className="flex items-center justify-between p-4 border rounded-lg"
											>
												<div className="flex items-center space-x-3">
													<div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
														<Users className="w-5 h-5 text-gray-400" />
													</div>
													<div>
														<p className="font-medium text-gray-900">
															{member.name ?? "Sin nombre"}
														</p>
														<p className="text-sm text-gray-500">{club.name}</p>
													</div>
												</div>
												<div className="flex items-center space-x-4">
													<div className="text-right">
														<p className="text-sm font-medium text-gray-900">
															{member.email}
														</p>
													</div>
													<QrCode className="w-5 h-5 text-gray-400" />
												</div>
											</div>
										))}
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</main>

			{/* Scan Result Dialog */}
			<AlertDialog open={showScanDialog} onOpenChange={setShowScanDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center space-x-2">
							<CheckCircle className="w-5 h-5 text-green-500" />
							<span>Asistencia Registrada</span>
						</AlertDialogTitle>
						<AlertDialogDescription>{scanResult}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => setShowScanDialog(false)}>
							Continuar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
