import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';

export interface CookiePolicy {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'Lax' | 'Strict' | 'None';
  domain?: string;
  path: string;
  maxAgeSeconds: number;
}

@Injectable()
export class CandidateCookiesService {
  constructor(private readonly config: ConfigService) {}

  accessCookiePolicy(): CookiePolicy {
    return {
      name: 'cand_sid',
      secure: this.cookieSecure(),
      httpOnly: true,
      sameSite: 'Lax',
      domain: this.cookieDomain('CANDIDATE_COOKIE_DOMAIN'),
      path: '/',
      maxAgeSeconds: 15 * 60,
    };
  }

  refreshCookiePolicy(): CookiePolicy {
    return {
      name: 'cand_refresh',
      secure: this.cookieSecure(),
      httpOnly: true,
      sameSite: 'Lax',
      domain: this.cookieDomain('CANDIDATE_COOKIE_DOMAIN'),
      path: '/',
      maxAgeSeconds: 7 * 24 * 60 * 60,
    };
  }

  csrfCookiePolicy(): CookiePolicy {
    return {
      name: 'cand_csrf',
      secure: this.cookieSecure(),
      httpOnly: false,
      sameSite: 'Lax',
      domain: this.cookieDomain('CANDIDATE_COOKIE_DOMAIN'),
      path: '/',
      maxAgeSeconds: 2 * 60 * 60,
    };
  }

  setCookie(reply: FastifyReply, policy: CookiePolicy, value: string) {
    reply.setCookie(policy.name, value, {
      path: policy.path,
      maxAge: policy.maxAgeSeconds,
      sameSite: policy.sameSite.toLowerCase() as 'lax' | 'strict' | 'none',
      httpOnly: policy.httpOnly,
      secure: policy.secure,
      domain: policy.domain,
    });
  }

  clearCookie(reply: FastifyReply, policy: CookiePolicy) {
    reply.clearCookie(policy.name, {
      path: policy.path,
      sameSite: policy.sameSite.toLowerCase() as 'lax' | 'strict' | 'none',
      httpOnly: policy.httpOnly,
      secure: policy.secure,
      domain: policy.domain,
    });
  }

  readCookie(request: FastifyRequest, name: string): string | undefined {
    return (request.cookies as Record<string, string>)?.[name];
  }

  appendSessionCookies(reply: FastifyReply, sid: string, csrfToken: string) {
    this.setCookie(reply, this.accessCookiePolicy(), sid);
    this.setCookie(reply, this.refreshCookiePolicy(), sid);
    this.setCookie(reply, this.csrfCookiePolicy(), csrfToken);
  }

  clearSessionCookies(reply: FastifyReply) {
    this.clearCookie(reply, this.accessCookiePolicy());
    this.clearCookie(reply, this.refreshCookiePolicy());
    this.clearCookie(reply, this.csrfCookiePolicy());
  }

  clearSiteData(reply: FastifyReply) {
    reply.header('clear-site-data', '"cache", "cookies", "storage"');
  }

  private cookieSecure(): boolean {
    const val = this.config.get<string>('COOKIE_SECURE', 'false');
    return ['1', 'true', 'yes', 'on'].includes(val.toLowerCase());
  }

  private cookieDomain(envKey: string): string | undefined {
    const raw = this.config.get<string>(envKey, '');
    if (!raw) return undefined;
    const cleaned = raw.replace(/^\./, '');
    return cleaned ? `.${cleaned}` : undefined;
  }
}
