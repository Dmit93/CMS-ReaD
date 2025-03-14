# Database Configuration Guide

## Overview

This CMS platform uses Prisma ORM to interact with the database. Prisma supports multiple database providers, including:

- SQLite (default for development)
- PostgreSQL
- MySQL
- Microsoft SQL Server
- MongoDB
- CockroachDB

This guide explains how to configure different database providers and manage your database schema.

## Database Schema

The database schema is defined in `prisma/schema.prisma`. It includes the following models:

- `User`: User accounts and authentication
- `Content`: Content items (pages, posts, etc.)
- `Media`: Media files (images, videos, documents, etc.)
- `Plugin`: Available plugins in the marketplace
- `UserPlugin`: Installed plugins for users
- `UserSetting`: User-specific settings
- `SystemSetting`: Global system settings

## Changing Database Providers

### Step 1: Update the Prisma Schema

Edit the `prisma/schema.prisma` file and change the `provider` in the `datasource` block:

```prisma
datasource db {
  provider = "postgresql" // Change from "sqlite" to your preferred provider
  url      = env("DATABASE_URL")
}
```

Available provider options:
- `sqlite`
- `postgresql`
- `mysql`
- `sqlserver`
- `mongodb`
- `cockroachdb`

### Step 2: Update the Connection URL

Update the `DATABASE_URL` in your `.env` file with the appropriate connection string for your database:

#### PostgreSQL
```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

#### MySQL
```
DATABASE_URL="mysql://username:password@localhost:3306/mydb"
```

#### SQL Server
```
DATABASE_URL="sqlserver://localhost:1433;database=mydb;user=username;password=password;trustServerCertificate=true"
```

#### MongoDB
```
DATABASE_URL="mongodb+srv://username:password@cluster0.example.mongodb.net/mydb?retryWrites=true&w=majority"
```

#### CockroachDB
```
DATABASE_URL="postgresql://username:password@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/mydb?sslmode=verify-full&options=--cluster%3Dcluster-name"
```

### Step 3: Generate Prisma Client

After changing the database provider, you need to generate the Prisma client:

```bash
npx prisma generate
```

### Step 4: Create and Apply Migrations

Create a migration to update your database schema:

```bash
npx prisma migrate dev --name init
```

This command will:
1. Create a new migration file
2. Apply the migration to your database
3. Generate the Prisma client

## Database Management Commands

### Initialize Database

```bash
npx prisma migrate dev --name init
```

### Apply Migrations in Production

```bash
npx prisma migrate deploy
```

### Reset Database (Warning: Deletes All Data)

```bash
npx prisma migrate reset
```

### View Database in Prisma Studio

```bash
npx prisma studio
```

## Connection Pooling

For production environments, especially with PostgreSQL or MySQL, it's recommended to use connection pooling to improve performance.

### Using PgBouncer with PostgreSQL

Update your connection string to use PgBouncer:

```
DATABASE_URL="postgresql://username:password@pgbouncer:6432/mydb?schema=public&pgbouncer=true"
```

### Using ProxySQL with MySQL

Configure ProxySQL and update your connection string accordingly.

## Environment-Specific Configuration

It's recommended to use different databases for development, testing, and production environments. You can use environment variables to manage this:

```bash
# .env.development
DATABASE_URL="file:./dev.db"

# .env.test
DATABASE_URL="file:./test.db"

# .env.production
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

## Database Backup and Restore

### PostgreSQL

```bash
# Backup
pg_dump -U username -d mydb -f backup.sql

# Restore
psql -U username -d mydb -f backup.sql
```

### MySQL

```bash
# Backup
mysqldump -u username -p mydb > backup.sql

# Restore
mysql -u username -p mydb < backup.sql
```

### SQLite

```bash
# Backup (just copy the file)
cp dev.db backup.db

# Restore
cp backup.db dev.db
```

## Troubleshooting

### Common Issues

1. **Connection Errors**: Ensure your database server is running and the connection URL is correct.

2. **Migration Errors**: If migrations fail, you can reset the database with `npx prisma migrate reset` (warning: this deletes all data).

3. **Schema Drift**: If your database schema doesn't match your Prisma schema, run `npx prisma db pull` to update your Prisma schema or `npx prisma migrate dev` to update your database.

4. **Performance Issues**: For production environments, consider using connection pooling and optimizing your database queries.

## Advanced Configuration

### Custom Database Schema

You can customize the database schema by editing the `prisma/schema.prisma` file. After making changes, run `npx prisma migrate dev --name your_change_name` to apply the changes to your database.

### Database Indexes

To improve query performance, you can add indexes to your database schema:

```prisma
model Content {
  id        String   @id @default(uuid())
  title     String
  slug      String   @unique
  // ... other fields

  @@index([title]) // Add an index on the title field
}
```

### Database Constraints

You can add constraints to your database schema to ensure data integrity:

```prisma
model User {
  id       String @id @default(uuid())
  email    String @unique
  // ... other fields

  @@unique([email, role]) // Add a unique constraint on email and role
}
```

## Next Steps

- Explore the Prisma documentation for more advanced features: https://www.prisma.io/docs/
- Learn about database optimization techniques for your specific database provider
- Consider implementing database monitoring and logging for production environments
