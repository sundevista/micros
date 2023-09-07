import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, catchError, tap } from 'rxjs';
import { authenticationCookieKey } from '../shared-auth.constants';
import { authClientKey, validate_user } from '../../rmq/rmq.constants';

/**
 * Used to validate authentication based on a specified cookie
 */
@Injectable()
export class SharedJwtAuthGuard implements CanActivate {
  constructor(
    @Inject(authClientKey) private readonly authClient: ClientProxy,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authentication = this.getAuthentication(context);
    return this.authClient
      .send(validate_user, { [authenticationCookieKey]: authentication })
      .pipe(
        tap((res) => {
          this.addUser(res, context);
        }),
        catchError(() => {
          throw new UnauthorizedException();
        }),
      );
  }

  /**
   * Gain authentication access token from the given context
   *
   * @param context execution context (rpc or http)
   * @returns authentication access token
   */
  private getAuthentication(context: ExecutionContext): string {
    let authentication: string;
    if (context.getType() === 'rpc') {
      authentication = context.switchToRpc().getData()[authenticationCookieKey];
    } else if (context.getType() === 'http') {
      authentication = context.switchToHttp().getRequest().cookies[
        authenticationCookieKey
      ];
    }

    if (!authentication) {
      throw new UnauthorizedException(
        'No value was provided for Authentication',
      );
    }

    return authentication;
  }

  /**
   * Binds an user object to request for the {@link CurrentUser} decorator
   *
   * @param user object to bind
   * @param context execution context (rpc or http)
   */
  private addUser(user: any, context: ExecutionContext) {
    if (context.getType() === 'rpc') {
      context.switchToRpc().getData().user = user;
    } else if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
    }
  }
}
