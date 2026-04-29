import { QRCodeSVG } from 'qrcode.react'

interface QRCodeDisplayProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
}

export function QRCodeGenerator({ value, size = 200, level = 'M' }: QRCodeDisplayProps) {
  return (
    <div className="bg-white p-4 rounded-xl">
      <QRCodeSVG
        value={value}
        size={size}
        level={level}
        includeMargin={false}
        imageSettings={{
          src: '',
          height: 0,
          width: 0,
          excavate: false,
        }}
      />
    </div>
  )
}