/**
 * TiDB Cloud (and similar MySQL hosts) require TLS. Prisma's MySQL connector
 * uses `sslaccept=strict`, not PostgreSQL-style `ssl=true` / `sslMode=REQUIRED`.
 */
export declare function resolveDatabaseUrl(rawUrl?: string | undefined): string;
