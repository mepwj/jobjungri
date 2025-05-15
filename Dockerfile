# Node.js LTS 버전 사용 (안정적인 버전)
FROM node:20-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치를 위한 빌드 단계
FROM base AS deps
# Git이나 기타 필요한 패키지가 있다면 설치
RUN apk add --no-cache libc6-compat

# 패키지 파일 복사
COPY package.json pnpm-lock.yaml* ./
# pnpm 설치 및 의존성 설치
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 애플리케이션 빌드 단계
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# .env 파일 생성 (GitHub Actions에서 제공될 환경 변수 사용)
RUN touch .env.local
RUN echo "MONGODB_URI=$MONGODB_URI" >> .env.local
RUN echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env.local

# Next.js 빌드
RUN npm run build

# 프로덕션 이미지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# 필요한 사용자 추가
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 프로덕션에 필요한 파일만 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.env.local ./.env.local

USER nextjs

EXPOSE 8080

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"]
