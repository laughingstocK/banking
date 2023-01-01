# Banking

## Prerequisite
* Docker
* NodeJS

## How-to-run

1. run database

```docker-compose -f docker-compose.yml up -d```

2. Install node modules 

```npm install```

3. migrate database

```npx prisma migrate dev --name init```

4. Seed databate

```npx prisma db seed --preview-feature```

5. Run api 

```npm run dev```