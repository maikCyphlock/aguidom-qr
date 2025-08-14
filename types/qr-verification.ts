export interface QRVerificationRequest {
	token: string;
}

export interface QRVerificationResponse {
	saved: boolean;
	message?: string;
	error?: string;
	name: string | null;
	club: string | null;
}
