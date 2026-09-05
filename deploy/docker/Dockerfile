# Africa Local runtime image. Node 22 + Express, no build step (plain ESM JavaScript - see
# adr/0002-runtime-language-and-no-build-step.md) so this stays a thin, fast-starting image.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
# --ignore-scripts skips the "prepare": "husky" lifecycle script, which npm always runs on
# install regardless of --omit=dev. husky is a devDependency (not present in this --omit=dev
# install) and this image has no .git directory for it to install hooks into anyway - see
# adr/0003. None of our production dependencies rely on install-time scripts, so this is safe.
RUN npm ci --omit=dev --ignore-scripts

COPY core ./core
COPY runtime ./runtime
COPY cli ./cli
COPY providers ./providers
COPY specs ./specs

ENV NODE_ENV=production
ENV PORT=9000
EXPOSE 9000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||9000)+'/_control/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "runtime/index.js"]
