export const bufferToBase64 = (buffer) => {
    if (!buffer || !buffer.data) return null;
    const binary = Array.from(new Uint8Array(buffer.data))
      .map(byte => String.fromCharCode(byte))
      .join('');
    return `data:image/jpeg;base64,${btoa(binary)}`;
  };