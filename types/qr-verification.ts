export interface QRVerificationRequest {
  token: string;
}

export interface QRVerificationResponse {
  saved: boolean;
  message?: string;
  error?: string;
}
