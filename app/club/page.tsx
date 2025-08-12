"use client";
import { useEffect, useState } from "react";
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
	Filter,
} from "lucide-react";

export default function AguidomAttendanceSystem() {
	const [activeTab, setActiveTab] = useState("dashboard");
	const [selectedClub, setSelectedClub] = useState("todos");
	const [scanResult, setScanResult] = useState("");
	const [showScanDialog, setShowScanDialog] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	type AttendanceItem = {
		attendanceId: string;
		userName: string | null;
		scanTime: number | string;
		clubName?: string;
	};
	const [attendances, setAttendances] = useState<AttendanceItem[]>([]);
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/attendance", { cache: "no-store" });
				if (!res.ok) return;
				const data = (await res.json()) as AttendanceItem[];
				if (!cancelled) setAttendances(data);
			} catch (e) {
				console.error("Failed to load attendances", e);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	// Datos de ejemplo
	const clubs = [
		{ id: "1", name: "Club Central", members: 145, present: 89 },
		{ id: "2", name: "Club Norte", members: 203, present: 156 },
		{ id: "3", name: "Club Sur", members: 178, present: 134 },
		{ id: "4", name: "Club Este", members: 167, present: 98 },
	];

	const members = [
		{
			id: "1",
			name: "Juan Pérez",
			club: "Club Central",
			status: "Presente",
			qr: "QR001",
		},
		{
			id: "2",
			name: "María García",
			club: "Club Norte",
			status: "Presente",
			qr: "QR002",
		},
		{
			id: "3",
			name: "Carlos López",
			club: "Club Sur",
			status: "Presente",
			qr: "QR003",
		},
		{
			id: "4",
			name: "Ana Martín",
			club: "Club Este",
			status: "Presente",
			qr: "QR004",
		},
		{
			id: "5",
			name: "Luis Rodríguez",
			club: "Club Central",
			status: "Ausente",
			qr: "QR005",
		},
		{
			id: "6",
			name: "Sofia Hernández",
			club: "Club Norte",
			status: "Ausente",
			qr: "QR006",
		},
	];

	const totalMembers = clubs.reduce((sum, club) => sum + club.members, 0);
	const totalPresent = clubs.reduce((sum, club) => sum + club.present, 0);

	const handleQRScan = () => {
		// Simular escaneo de QR
		const randomMember = members[Math.floor(Math.random() * members.length)];
		setScanResult(
			`Asistencia registrada: ${randomMember.name} - ${randomMember.club}`,
		);
		setShowScanDialog(true);
	};

	const filteredMembers = members.filter(
		(member) =>
			member.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
			(selectedClub === "todos" || member.club === selectedClub),
	);

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="border-b border-gray-200 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-lg">A</span>
							</div>
							<div>
								<h1 className="text-xl font-semibold text-gray-900">
									CLUB AGUIDOM
								</h1>
								<p className="text-sm text-gray-500">Sistema de Asistencias</p>
							</div>
						</div>
						<div className="flex items-center space-x-1">
							<span className="text-sm text-gray-500">Estadio • Hoy</span>
							<Calendar className="w-4 h-4 text-gray-400" />
						</div>
					</div>
				</div>
			</header>

			{/* Navigation */}
			<nav className="border-b border-gray-200 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex space-x-8">
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
										{totalMembers - totalPresent}
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
										{Math.round((totalPresent / totalMembers) * 100)}%
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Clubs Overview */}
						<Card>
							<CardHeader>
								<CardTitle>Resumen por Clubes</CardTitle>
								<CardDescription>
									Estado actual de asistencias por club
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{clubs.map((club) => (
										<div
											key={club.id}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div className="flex items-center space-x-3">
												<Users className="w-5 h-5 text-gray-400" />
												<div>
													<p className="font-medium text-gray-900">
														{club.name}
													</p>
													<p className="text-sm text-gray-500">
														{club.members} miembros totales
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-lg font-semibold text-green-600">
													{club.present}
												</p>
												<p className="text-sm text-gray-500">presentes</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
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

						{/* Recent Scans */}
						<Card>
							<CardHeader>
								<CardTitle>Últimos Registros</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{attendances.slice(0, 5).map((record) => (
										<div
											key={record.attendanceId}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
										>
											<div className="flex items-center space-x-3">
												<CheckCircle className="w-5 h-5 text-green-500" />
												<div>
													<p className="font-medium text-gray-900">
														{record.userName ?? "Desconocido"}
													</p>
													<p className="text-sm text-gray-500">{record.clubName ?? ""}</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-sm font-medium text-gray-900">
													{new Date(Number(record.scanTime) * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
												</p>
												<p className="text-xs text-green-600">Presente</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Members */}
				{activeTab === "members" && (
					<div className="space-y-6">
						{/* Filters */}
						<Card>
							<CardContent className="pt-6">
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
									<div className="relative">
										<Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
										<select
											value={selectedClub}
											onChange={(e) => setSelectedClub(e.target.value)}
											className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black appearance-none bg-white"
										>
											<option value="todos">Todos los clubes</option>
											{clubs.map((club) => (
												<option key={club.id} value={club.name}>
													{club.name}
												</option>
											))}
										</select>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Members List */}
						<Card>
							<CardHeader>
								<CardTitle>Lista de Miembros</CardTitle>
								<CardDescription>
									{filteredMembers.length} de {members.length} miembros
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{filteredMembers.map((member) => (
										<div
											key={member.id}
											className="flex items-center justify-between p-4 border rounded-lg"
										>
											<div className="flex items-center space-x-3">
												<div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
													<Users className="w-5 h-5 text-gray-400" />
												</div>
												<div>
													<p className="font-medium text-gray-900">
														{member.name}
													</p>
													<p className="text-sm text-gray-500">{member.club}</p>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<div className="text-right">
													<p className="text-sm font-medium text-gray-900">
														QR: {member.qr}
													</p>
													<p
														className={`text-sm ${
															member.status === "Presente"
																? "text-green-600"
																: "text-red-600"
														}`}
													>
														{member.status}
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

				{/* Attendance */}
				{activeTab === "attendance" && (
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Registro de Asistencias</CardTitle>
								<CardDescription>
									Histórico de asistencias de hoy
								</CardDescription>
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
													<p className="text-sm text-gray-500">{record.clubName ?? ""}</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-medium text-gray-900">
													{new Date(Number(record.scanTime) * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
												</p>
												<p className="text-sm text-green-600">
													Acceso autorizado
												</p>
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
