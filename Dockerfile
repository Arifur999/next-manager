# Production image for the Naxified web app.
#
# Three stages. What ships is Next's standalone output - server.js plus only
# the node_modules the built pages actually import, traced file by file - so
# there is no production install here at all and nothing in the image that
# nothing imports.
#
# Pinned to a MINOR, not a major, for the same reason the API is: `24-alpine`
# floats across every 24.x, and a Node change arriving during a routine rebuild
# is the surprise a pin exists to prevent.
ARG NODE_VERSION=24.20-alpine

# ---------------------------------------------------------------- deps
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# --------------------------------------------------------------- build
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_ variables are inlined into the bundle by `next build`, not read
# at runtime - so this has to be a build argument, and changing it means
# rebuilding rather than restarting.
#
# It points at the API over the compose network because every call is made from
# the Next SERVER: httpClient.ts reads cookies() and headers() from
# next/headers, so it only ever runs server-side and the browser never sees
# this host. It is not a secret, and nothing else is passed in here.
ARG NEXT_PUBLIC_API_BASE_URL=http://api:5000/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Telemetry off during the build: it is a network call in a step that should be
# reproducible, and it fails noisily on a machine with no route out.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# -------------------------------------------------------------- runner
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Three copies, because standalone deliberately leaves two things out.
#
# server.js and its traced dependencies:
COPY --from=build --chown=node:node /app/.next/standalone ./
# The compiled CSS and JS chunks, which standalone expects to find beside it
# and does not copy itself - without this every page renders unstyled:
COPY --from=build --chown=node:node /app/.next/static ./.next/static
# And anything served straight off disk:
COPY --from=build --chown=node:node /app/public ./public

# The node user ships with the image and owns nothing outside /app.
USER node

# Documentation only - nothing is published to the host. nginx reaches this
# over the compose network, which is the only way in.
EXPOSE 3000

# /login is a real rendered page and needs no session, so it exercises the
# router rather than just proving a socket is open.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Exec form, so node is PID 1 and `docker stop` reaches it directly rather than
# through a shell that would not forward the signal.
CMD ["node", "server.js"]
