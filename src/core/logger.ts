type LogMeta = Record<string, unknown> | undefined;

function log(
  level: 'info' | 'warn' | 'error',
  message: string,
  meta?: LogMeta
) {
  const payload = JSON.stringify({
    level,
    message,
    ...(meta ?? {}),
  });

  if (level === 'info') {
    console.log(payload);
    return;
  }

  if (level === 'warn') {
    console.warn(payload);
    return;
  }

  console.error(payload);
}

export function logInfo(message: string, meta?: LogMeta) {
  log('info', message, meta);
}

export function logWarn(message: string, meta?: LogMeta) {
  log('warn', message, meta);
}

export function logError(message: string, meta?: LogMeta) {
  log('error', message, meta);
}
