import { NextResponse } from "next/server";

import { ZodError } from "zod";
import { ErrorApi } from "@/app/api/Error";

import { z } from "zod";
import type { QRVerificationResponse } from "../../types/qr-verification";
import { QRError } from "../errors/qr-errors";


interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Handles errors in API routes and returns a standardized response.
 * @param error The error object.
 * @returns A NextResponse object with a standardized error format.
 */
export function apiErrorHandler(error: unknown): NextResponse<ErrorResponse> {
  // Log the error for debugging purposes
  console.error("[API_ERROR_HANDLER] ❌", error);

  if (error instanceof ErrorApi) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.context,
        },
      },
      { status: error.status }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Fallback for unexpected errors
  const message = error instanceof Error ? error.message : "An unexpected error occurred.";
  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Internal Server Error",
        code: "INTERNAL_SERVER_ERROR",
        details: message,
      },
    },
    { status: 500 }
  );
}
