document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const clearBtn = document.getElementById('clear-btn');
    const generateBtn = document.getElementById('generate-btn');
    const qrcodeContainer = document.getElementById('qrcode');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    const fgColorInput = document.getElementById('fg-color');
    const bgColorInput = document.getElementById('bg-color');
    const fgColorHex = document.getElementById('fg-color-hex');
    const bgColorHex = document.getElementById('bg-color-hex');
    const qrSizeSelect = document.getElementById('qr-size');
    const qrEccSelect = document.getElementById('qr-ecc');
    const downloadPngBtn = document.getElementById('download-png-btn');
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast');

    let qrcodeObj = null;

    // Helper to Map ECC Level String to QRCode.js Constants
    function getCorrectLevel(levelStr) {
        if (typeof QRCode === 'undefined') return 2; // Default M
        switch (levelStr) {
            case 'L': return QRCode.CorrectLevel.L;
            case 'M': return QRCode.CorrectLevel.M;
            case 'Q': return QRCode.CorrectLevel.Q;
            case 'H': return QRCode.CorrectLevel.H;
            default: return QRCode.CorrectLevel.M;
        }
    }

    // Function to Generate QR Code
    function makeQRCode() {
        const text = urlInput.value.trim();

        qrcodeContainer.innerHTML = '';

        if (!text) {
            qrPlaceholder.classList.remove('hidden');
            qrcodeContainer.style.display = 'none';
            return;
        }

        qrPlaceholder.classList.add('hidden');
        qrcodeContainer.style.display = 'block';

        const size = parseInt(qrSizeSelect.value, 10) || 250;
        const fgColor = fgColorInput.value;
        const bgColor = bgColorInput.value;
        const correctLevel = getCorrectLevel(qrEccSelect.value);

        try {
            qrcodeObj = new QRCode(qrcodeContainer, {
                text: text,
                width: size,
                height: size,
                colorDark: fgColor,
                colorLight: bgColor,
                correctLevel: correctLevel
            });
        } catch (e) {
            console.error('Error generating QR Code:', e);
        }
    }

    // Color Pickers Input Handler
    fgColorInput.addEventListener('input', (e) => {
        fgColorHex.textContent = e.target.value;
        makeQRCode();
    });

    bgColorInput.addEventListener('input', (e) => {
        bgColorHex.textContent = e.target.value;
        makeQRCode();
    });

    // Real-time updates on Input & Select Changes
    urlInput.addEventListener('input', () => {
        makeQRCode();
    });

    qrSizeSelect.addEventListener('change', makeQRCode);
    qrEccSelect.addEventListener('change', makeQRCode);

    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        urlInput.focus();
        makeQRCode();
    });

    generateBtn.addEventListener('click', makeQRCode);

    // Download PNG Action
    downloadPngBtn.addEventListener('click', () => {
        const img = qrcodeContainer.querySelector('img');
        const canvas = qrcodeContainer.querySelector('canvas');

        let dataUrl = '';
        if (canvas) {
            dataUrl = canvas.toDataURL('image/png');
        } else if (img && img.src) {
            dataUrl = img.src;
        }

        if (!dataUrl) {
            alert('다운로드할 QR 코드가 없습니다. URL을 먼저 입력해 주세요.');
            return;
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `qrcode_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('PNG 파일이 다운로드되었습니다!');
    });

    // Copy to Clipboard Action
    copyBtn.addEventListener('click', async () => {
        const canvas = qrcodeContainer.querySelector('canvas');
        const img = qrcodeContainer.querySelector('img');

        if (!canvas && (!img || !img.src)) {
            alert('복사할 QR 코드가 없습니다.');
            return;
        }

        try {
            // Helper function to handle blob copy
            const copyBlobToClipboard = async (blob) => {
                const data = [new ClipboardItem({ [blob.type]: blob })];
                await navigator.clipboard.write(data);
                showToast('클립보드에 QR 이미지 복사 완료!');
            };

            if (canvas) {
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        await copyBlobToClipboard(blob);
                    } else {
                        throw new Error('Blob creation failed');
                    }
                });
            } else if (img && img.src) {
                // Convert img src to blob via temporary canvas
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.naturalWidth || 250;
                tempCanvas.height = img.naturalHeight || 250;
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                tempCanvas.toBlob(async (blob) => {
                    if (blob) {
                        await copyBlobToClipboard(blob);
                    } else {
                        throw new Error('Blob creation failed');
                    }
                });
            }
        } catch (err) {
            console.error('Clipboard copy failed: ', err);
            // Fallback for file:// context if ClipboardItem image copy is restricted in local browser security model
            showToast('QR 이미지 다운로드 버튼을 이용해 주세요!');
        }
    });

    // Toast Alert Helper
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 2500);
    }

    // Initial QR Code Generation
    makeQRCode();
});
