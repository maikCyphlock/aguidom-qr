// src/app/generator/page.tsx
"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, QrCode } from "lucide-react"
import QRCode from "react-qr-code"

const CLUBS = [
  "Club Deportivo Norte",
  "Club Atlético Sur",
  "Club Universitario",
  "Club Juvenil",
  "Club Estrella",
  "Club Campeón",
  "Club Tradición",
  "Club Victoria"
]

interface FormData {
  club: string
  name: string
  idNumber: string
  phone: string
}

export default function QRGeneratorPage() {
  const [formData, setFormData] = useState<FormData>({
    club: "",
    name: "",
    idNumber: "",
    phone: ""
  })
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateQRCode = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setQrCode(null)
    setExpiresAt(null)

    try {
      const response = await fetch('/api/generate-qr-token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const contentType = response.headers.get('content-type');
      
      // Verificar si la respuesta es JSON
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Respuesta inesperada: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error en el servidor");
      }

      setQrCode(data.token);
      setExpiresAt(data.expiresAt);
      setSuccess("Código QR generado exitosamente!");
    } catch (err: any) {
      console.error("Error completo:", err);
      setError(err.message || "Error al generar el código QR");
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card className="w-full max-w-2xl mx-auto dark:bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Generador de Código QR
        </CardTitle>
        <CardDescription>
          Cree códigos QR para miembros con validez de 5 minutos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="club">Club</Label>
            <Select 
              value={formData.club} 
              onValueChange={(value) => handleChange('club', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un club" />
              </SelectTrigger>
              <SelectContent>
                {CLUBS.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">Cédula</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => handleChange('idNumber', e.target.value)}
              placeholder="12345678"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (234) 567-8901"
              type="tel"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 text-green-700">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={generateQRCode} 
          disabled={loading}
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            "Generar Código QR"
          )}
        </Button>

        {qrCode && (
          <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200 flex flex-col items-center">
            <div className="p-4 bg-white rounded-lg relative">
              <QRCode 
                value={qrCode} 
                size={200}
                className="w-full h-auto max-w-[200px]"
              />
 
            </div>
            
            <div className="mt-4 text-sm text-gray-700 text-center">
              <p><strong>Club:</strong> {formData.club}</p>
              <p><strong>Nombre:</strong> {formData.name}</p>
              <p><strong>Cédula:</strong> {formData.idNumber}</p>
              <p><strong>Teléfono:</strong> {formData.phone}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}