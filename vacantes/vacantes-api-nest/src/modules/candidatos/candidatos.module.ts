import { Module } from '@nestjs/common';
import { CandidatosController } from './candidatos.controller';
import { CandidatosService } from './candidatos.service';
import { CandidateSessionService } from './candidate-session.service';
import { CandidateCookiesService } from '../../shared/security/candidate-cookies.service';
import { SessionTokenService } from '../../shared/security/session-token.service';
import { CsrfService } from '../../shared/security/csrf.service';
import { RateLimitService } from '../../shared/security/rate-limit.service';

@Module({
  controllers: [CandidatosController],
  providers: [
    CandidatosService, 
    CandidateSessionService, 
    CandidateCookiesService, 
    SessionTokenService, 
    CsrfService, 
    RateLimitService
  ],
  exports: [CandidatosService, CandidateSessionService],
})
export class CandidatosModule {}
