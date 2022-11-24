# banking

1 run database

```docker-compose -f docker-compose.yml up --force-recreate -d```

2 migrate database

```npx prisma migrate dev --name init```

3 run api 

```npm run dev```