import qrcode from 'qrcode-generator';

export function buildQrCodeDataUrl(value, size = 90) {
  const text = (value ?? '').trim() || ' ';
  const maxTypeNumber = 40;

  for (let typeNumber = 1; typeNumber <= maxTypeNumber; typeNumber++) {
    try {
      const qr = qrcode(typeNumber, 'M');
      qr.addData(text);
      qr.make();
      const moduleCount = qr.getModuleCount();
      const cellSize = Math.max(2, Math.floor(size / (moduleCount + 8)));
      return qr.createDataURL(cellSize, cellSize * 4);
    } catch {
      // Try the next QR version until the value fits.
    }
  }

  throw new Error('QR value is too long to encode.');
}
