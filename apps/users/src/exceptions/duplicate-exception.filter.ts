import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import mongoose from 'mongoose';

@Catch(mongoose.mongo.MongoServerError)
export class DuplicateExceptionFilter implements ExceptionFilter {
  catch(exception: mongoose.mongo.MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = 422;
    let message = 'Unknown error happened';
    const cause = Object.keys(exception.keyPattern)[0];

    switch (exception.code) {
      case 11000:
        message = `This ${cause ?? 'field'} is already taken`;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
      path: `${request.method} ${request.path}`,
    });
  }
}
