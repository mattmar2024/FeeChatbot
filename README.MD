# Setup

## Server

- Register with <https://account.mongodb.com/account/register> and create a database
- Install dependencies `cd backend && npm i`
- open `backend/.env` and add the following

```bash
DB_USERNAME=<MONGODB_USERNAME>
DB_PASSWORD=<MONGODB_PASSWORD>
DB_NAME=<DATABASE_NAME>
PORT=4000
SECRET_KEY=^51H610zx13

```

- run `npm run dev` to start the backend in dev mode and `npm start` for production mode.

## frontend

- Install dependencies `cd frontend && npm i`
- Update `service.js` BASE_URL to point to the backend or leave it blank on production `BASE_URL=''`
- Run `npm build`

## Open your browser

<http://localhost:4000/>
