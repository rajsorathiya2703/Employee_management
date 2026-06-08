function resolveDatabaseUrl(rawUrl = process.env.DATABASE_URL) {
  if (!rawUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const requiresTls =
    /tidbcloud\.com/i.test(rawUrl) || process.env.DATABASE_SSL_REQUIRED === "true";

  if (!requiresTls) {
    return rawUrl;
  }

  let url = rawUrl
    .replace(/([?&])ssl=true(&|$)/gi, "$1")
    .replace(/([?&])sslMode=[^&]*(&|$)/gi, "$1")
    .replace(/[?&]$/, "");

  if (!/sslaccept=/i.test(url)) {
    url += `${url.includes("?") ? "&" : "?"}sslaccept=strict`;
  }

  return url;
}

module.exports = { resolveDatabaseUrl };
