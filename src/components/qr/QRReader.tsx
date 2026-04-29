import { useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface QRReaderProps {
  onResult: (result: string) => void
  onError?: (error: string) => void
}

export function QRReader({ onResult, onError }: QRReaderProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const hasScannedRef = useRef(false)

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      if (hasScannedRef.current) return
      hasScannedRef.current = true
      onResult(decodedText)
      setTimeout(() => {
        hasScannedRef.current = false
      }, 2000)
    },
    [onResult]
  )

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 300, height: 300 } },
        handleScanSuccess,
        () => {}
      )
      .catch((err) => {
        onError?.('Erro ao acessar câmera')
        console.error(err)
      })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [handleScanSuccess, onError])

  return (
    <div id="qr-reader" className="w-full aspect-square rounded-xl overflow-hidden bg-black" />
  )
}