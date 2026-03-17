import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CandidateCookiesService } from './candidate-cookies.service';
import { SessionTokenService } from './session-token.service';
import { CsrfService } from './csrf.service';
import { RateLimitService } from './rate-limit.service';
import { PortalIntrospectService } from './portal-introspect.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    CandidateCookiesService,
    SessionTokenService,
    CsrfService,
    RateLimitService,
    PortalIntrospectService,
  ],
  exports: [
    CandidateCookiesService,
    SessionTokenService,
    CsrfService,
    RateLimitService,
    PortalIntrospectService,
  ],
})
export class SecurityModule {}
