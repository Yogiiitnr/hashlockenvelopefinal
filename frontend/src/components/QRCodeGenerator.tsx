import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

interface QRCodeGeneratorProps {
  envelopeId?: string;
  hashPreimage?: string;
  recipient?: string;
  amount?: string;
}

export function QRCodeGenerator({ 
  envelopeId, 
  hashPreimage, 
  recipient, 
  amount 
}: QRCodeGeneratorProps) {
  const [showQR, setShowQR] = useState(false);

  const generateEnvelopeData = () => {
    return JSON.stringify({
      envelopeId,
      hashPreimage,
      recipient,
      amount,
      timestamp: Date.now(),
      network: 'testnet'
    });
  };

  const downloadQR = () => {
    const svg = document.getElementById('envelope-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `envelope_${envelopeId || 'share'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success('QR code downloaded!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyToClipboard = () => {
    const data = generateEnvelopeData();
    navigator.clipboard.writeText(data);
    toast.success('Envelope data copied to clipboard!');
  };

  if (!envelopeId && !hashPreimage) {
    return null;
  }

  return (
    <div className="glass-card p-6 space-y-4 holographic border-glow">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold gradient-text aurora-text">📱 Share Envelope</h3>
        <button
          onClick={() => setShowQR(!showQR)}
          className="px-4 py-2 rounded-lg glass-card hover:scale-105 transition-transform text-sm liquid-button ripple-effect"
        >
          {showQR ? '👁️ Hide' : '🔍 Show'} QR Code
        </button>
      </div>

      {showQR && (
        <div className="space-y-4 animate-scale-in">
          {/* QR Code Display */}
          <div className="flex justify-center p-6 bg-white rounded-lg pulse-ring glass-reflection">
            <QRCodeSVG
              id="envelope-qr-code"
              value={generateEnvelopeData()}
              size={256}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          {/* Envelope Info */}
          <div className="space-y-2 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 holographic">
            {envelopeId && (
              <div>
                <p className="text-xs text-white/60">Envelope ID</p>
                <p className="font-mono text-sm break-all neon-text">{envelopeId}</p>
              </div>
            )}
            {amount && (
              <div>
                <p className="text-xs text-white/60">Amount</p>
                <p className="font-bold aurora-text">{amount} XLM</p>
              </div>
            )}
            {recipient && (
              <div>
                <p className="text-xs text-white/60">Recipient</p>
                <p className="font-mono text-sm break-all text-white/80">{recipient}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadQR}
              className="gradient-button flex items-center justify-center gap-2 magnetic-button ripple-effect"
            >
              💾 Download
            </button>
            <button
              onClick={copyToClipboard}
              className="gradient-button-secondary flex items-center justify-center gap-2 magnetic-button ripple-effect"
            >
              📋 Copy Data
            </button>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 glass-reflection">
            <p className="text-sm text-white/80">
              📱 <strong className="neon-text">How to use:</strong> Share this QR code with the recipient. 
              They can scan it to automatically fill in the claim form with the correct preimage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified version for envelope details page
export function EnvelopeQRCode({ data }: { data: string }) {
  return (
    <div className="flex justify-center p-4 bg-white rounded-lg holographic pulse-ring">
      <QRCodeSVG
        value={data}
        size={200}
        level="H"
        includeMargin={true}
      />
    </div>
  );
}
