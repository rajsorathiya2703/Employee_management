function resolveDatabaseUrl(rawUrl = process.env.DATABASE_URL) {
  if (!rawUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  return rawUrl;
}

module.exports = { resolveDatabaseUrl };
