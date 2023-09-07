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
