# micros

Project's built using microservices architecture (with RabbitMQ communication). Currently, the application has 2 microservices: users and mailer.

Users takes care of full-fledged user CRUD and authentication process. Auth based on passport and JWT tokens, those are stored in secured http-only cookie. User can login, logout, register, update its data, and deletes itself.

Users module uses hand-made encryption service to encrypt and decrypt data. Special @Encrypt decorator is used to mark sensitive fields for encryptSensitiveData() and decryptSensitiveData() functions.

Mailer takes care of sending reset password mails to users. It receives requests from users service and then does its work.

> WARNING: Be careful using gmail as mailing service, bacause it marks its mails as spam.

## Running

Each approach needs `.env` to be configured. Application has main `.env` file in root source directory. Also, each microservice has its own `.env` specific for its needs.

Each `.env` file has its sample named as `.env.sample`. These files contain all necessary environment variables. But if you forget to add some of them, the application will tell you, because of the Joi validation.

### All self-hosted

If you have all self-hosted (RabbitMQ, MongoDB replica set) you can use:

- `npm run start:all:dev` for development
- `npm run start:all:prod` for production

### Docker

Both production and development environments can be used with docker:

- `npm run start:docker:dev` for development (will use ports defined in `.env`s)
- `npm run start:docker:prod` for production (will use 3002 for users and 3003 for mailer by default)

Ports in production docker-compose file are hard-coded to make possible to run both docker environments in the same time.

## Guidelines

This project's built using microservices, so there is some special rules you need to follow to keep code clear and consistent.

### Structure

- `/apps` - contains all microservices (dedicated modules)
- `/libs` - contains general-use modules those may be reconfigured and/or used more than one time, and toolings (e.g. encryption module)

### Microservice

Each microservice may consist of following items:

- _microservice_name_.module.ts - gathers all together, may import other modules
- _microservice_name_.controller.ts - contains concrete endpoints and uses service to process information
- _microservice_name_.service.ts - processes information, contains business logic, may import other services
- _microservice_name_.constants.ts - contains constants specific to this _microservice_
- .env - contains environment variables specific to this _microservice_

But microservice may also contain [decorators](https://docs.nestjs.com/custom-decorators), [exception filters](https://docs.nestjs.com/exception-filters) and DTO.

### Requirements

The main requirement is to use RabbitMQ when it possible, you need to add queue name to the root .env file and either connect to it or send messages. By default you cannot get reply to your message, so we apply these response objects to RPC request. Project is pretty clear so you can read how it implemented with user validation.
