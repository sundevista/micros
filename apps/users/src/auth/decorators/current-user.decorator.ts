import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '../../schemas/user.schema';

/**
 * Used to retreive a user object from context
 * @param context execution context (http or rpc)
 * @returns user object
 */
export const getCurrentUserByContext = (context: ExecutionContext): User => {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest().user;
  }
  if (context.getType() === 'rpc') {
    return context.switchToRpc().getData().user;
  }
};

/**
 * Used to retrieve user object if user's authenticated
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
