export const decodeJwt = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];

    if (typeof atob === 'function') {
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = payload.replace(/-/g, '+').replace(/_/g, '/');
    let output = '';
    str = str.replace(/=+$/, '');
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = str.charAt(i++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    const jsonPayload = decodeURIComponent(
      output
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isExpiring = (token: string, proactiveRefreshSeconds: number = 60): boolean => {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  const nowSecs = Math.floor(Date.now() / 1000);
  return decoded.exp - nowSecs < proactiveRefreshSeconds;
};
