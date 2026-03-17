import { FastifyRequest } from 'fastify';

export function extractClientIp(request: FastifyRequest): string | undefined {
  const headers = request.headers;
  const clientIp = extractSingleIp(headers['x-client-ip'] as string);
  if (clientIp) return clientIp;

  const xff = headers['x-forwarded-for'] as string;
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return normalizeIp(first);
  }

  const realIp = extractSingleIp(headers['x-real-ip'] as string);
  if (realIp) return realIp;

  return request.ip;
}

export function extractUserAgent(request: FastifyRequest): string | undefined {
  const ua = request.headers['user-agent'];
  if (!ua) return undefined;
  return ua.slice(0, 512).trim() || undefined;
}

export function extractCorrelationId(request: FastifyRequest): string | undefined {
  const raw =
    (request.headers['x-correlation-id'] as string) ??
    (request.headers['x-request-id'] as string);
  if (!raw) return undefined;

  const sanitized = raw
    .slice(0, 128)
    .replace(/[^a-zA-Z0-9._:\-]/g, '')
    .trim();
  return sanitized || undefined;
}

function extractSingleIp(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return normalizeIp(value.trim());
}

function normalizeIp(value: string): string | undefined {
  const trimmed = value.trim().replace(/"/g, '');
  if (!trimmed || trimmed === '_' || trimmed.toLowerCase() === 'unknown') return undefined;
  if (trimmed.startsWith('[')) {
    const inner = trimmed.slice(1).split(']')[0];
    return inner || undefined;
  }
  const colonCount = (trimmed.match(/:/g) || []).length;
  if (colonCount === 1) {
    return trimmed.split(':')[0] || undefined;
  }
  return trimmed || undefined;
}
