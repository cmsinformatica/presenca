import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'

interface QRCodeScannerProps {
  onScan: (decodedText: string) => void
  onError?: (error: string) => void
  fps?: number
  qrbox?: number
  aspectRatio?: number
}

export function QRCodeScanner({
  onScan,
  onError,
  fps = 10,
  qrbox = 250,
  aspectRatio = 1.0,
}: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const containerId = 'qr-reader'
    if (!containerRef.current) {
      containerRef.current = document.createElement('div')
      containerRef.current.id = containerId
    }

    scannerRef.current = new Html5Qrcode(containerId)

    return () => {
      if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
        scannerRef.current.stop()
      }
    }
  }, [])

  const startScanning = async () => {
    if (!scannerRef.current) return

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps,
          qrbox: { width: qrbox, height: qrbox },
          aspectRatio,
        },
        (decodedText) => {
          onScan(decodedText)
        },
        () => {}
      )
      setIsScanning(true)
    } catch (err) {
      onError?.('Erro ao iniciar câmera')
      console.error(err)
    }
  }

  const stopScanning = async () => {
    if (!scannerRef.current) return

    try {
      await scannerRef.current.stop()
      setIsScanning(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="relative">
      <div id="qr-reader" ref={containerRef} className="w-full" />
      {!isScanning ? (
        <button onClick={startScanning} className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg">
          Iniciar Câmera
        </button>
      ) : (
        <button onClick={stopScanning} className="mt-4 w-full py-3 bg-red-600 text-white rounded-lg">
          Parar Câmera
        </button>
      )}
    </div>
  )
}