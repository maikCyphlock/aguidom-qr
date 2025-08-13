"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQRStore } from "@/lib/stores";
import { QrCode, RefreshCw } from "lucide-react";

export function QRGenerator() {
  const { currentToken, isGenerating, generateToken, clearToken } = useQRStore();

  const handleGenerateToken = () => {
    generateToken("club-123"); // ID del club hardcodeado por ahora
  };

  const handleClearToken = () => {
    clearToken();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Generador de QR
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentToken ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-mono bg-muted p-3 rounded-lg">
                {currentToken.token}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Token válido hasta: {new Date(currentToken.expiresAt).toLocaleString()}
              </p>
            </div>
            <Button 
              onClick={handleClearToken} 
              variant="outline" 
              className="w-full"
            >
              Limpiar Token
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Genera un nuevo token QR para verificar asistencia
            </p>
            <Button 
              onClick={handleGenerateToken} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generar Token
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
