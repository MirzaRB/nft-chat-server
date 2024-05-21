## PUBLIC NFTs AND CHAT

# Run Postgres docker container

```bash
docker run -d --name <CONTAINER_NAME> -p 5434:5432 -e POSTGRES_PASSWORD=postgres -e PGDATA=/var/lib/postgresql/data/pgdata -v <YOUR_LOCAL_PATH>:/var/lib/postgresql/data postgres:latest
```

# Installation
  
```bash
  npm install  
```

## Creating Migration
1. First create you entity.
2. Put new entity in list of entities in src/config/ormconfig.ts
3. Than run this command.
  
```bash
  npm run migration:generate src/migrations/NAME_OF_MIGRATION  
```
<NAME_OF_MIGRATION> ==> please replace this with your migration name


4. After running above command you will get migrations in src/migrations folder if any.
5. Put new generated migrations in src/config/ormconfig.ts file as migrations property than run this command to sync your table with database.


```bash
  npm run migration:up 
```

## Reverting Migration
```bash
  npm run migration:down  
```

## To See List Of Migrations Which Havn't Run
```bash
  npm run migration:show  
```
  
## Running the app

```bash
# run in watch mode
$ npm run start:dev
```