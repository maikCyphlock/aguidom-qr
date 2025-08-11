"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { 
  Card, CardHeader, CardTitle, CardContent, CardDescription 
} from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CameraOff, Camera, RotateCw } from 'lucide-react';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize cameras
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices.length > 0) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
        }
      } catch (err) {
        setError('No se pudo acceder a las cámaras');
        console.error('Camera error:', err);
      }
    };
    
    fetchCameras();
  }, []);

  // Start/stop scanner based on state
  useEffect(() => {
    if (scanning && selectedCamera && containerRef.current) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => stopScanner();
  }, [scanning, selectedCamera]);

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      scannerRef.current = new Html5Qrcode('scanner-container');
      
      await scannerRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => handleScanSuccess(decodedText),
        () => {} // Ignore verbose logging
      );
    } catch (err) {
      setError(`Error al iniciar cámara: ${err.message || err}`);
      setScanning(false);
    }
  }, [selectedCamera]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(err => {
        console.error('Error al detener escáner:', err);
      });
    }
    scannerRef.current = null;
  }, []);

  const handleScanSuccess = async (decodedText: string) => {
    setScanning(false);
    try {
      const res = await fetch('/api/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decodedText }),
      });
      
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      
      const json = await res.json();
      setResult(json);
    } catch (e) {
      setError('Error al verificar el código: ' + e.message);
    }
  };

  const switchCamera = () => {
    if (cameras.length < 2) return;
    
    const currentIndex = cameras.findIndex(cam => cam.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCamera(cameras[nextIndex].id);
  };

  return (
    <Card className="max-w-xl mx-auto bg-white text-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6" />
          Escáner de Código QR
        </CardTitle>
        <CardDescription className="text-gray-600">
          Apunta al QR para verificar tu acceso
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {!scanning ? (
            <Button 
              onClick={() => {
                setResult(null);
                setError(null);
                setScanning(true);
              }}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Camera className="mr-2 h-4 w-4" />
              Iniciar Escaneo
            </Button>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={() => setScanning(false)}
                className="border-black text-black hover:bg-gray-100"
              >
                <CameraOff className="mr-2 h-4 w-4" />
                Detener Escaneo
              </Button>
              
              {cameras.length > 1 && (
                <Button
                  variant="outline"
                  onClick={switchCamera}
                  className="border-black text-black hover:bg-gray-100"
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Cambiar Cámara
                </Button>
              )}
            </>
          )}
        </div>

        {scanning ? (
          <div 
            id="scanner-container" 
            ref={containerRef}
            className="w-full aspect-square border-2 border-gray-300 rounded-lg bg-black"
          />
        ) : (
          <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            <CameraOff className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && result.valid && (
          <Alert variant="success" className="border-green-500">
            <AlertTitle>Acceso Autorizado</AlertTitle>
            <AlertDescription>
              <strong>{result.data.name}</strong>
            </AlertDescription>
          </Alert>
        )}

        {result && !result.valid && (
          <Alert variant="destructive" className="border-red-500">
            <AlertTitle>Acceso Denegado</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}