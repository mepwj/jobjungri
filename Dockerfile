# Node.js LTS 버전 사용 (안정적인 버전)
FROM node:20-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치를 위한 빌드 단계
FROM base AS deps
# Git이나 기타 필요한 패키지가 있다면 설치
RUN apk add --no-cache libc6-compat git

# PNPM 설치
RUN npm install -g pnpm

# 패키지 파일 복사
COPY package.json pnpm-lock.yaml* ./

# 의존성 설치
RUN pnpm install --force

# 애플리케이션 빌드 단계
FROM base AS builder
WORKDIR /app

# PNPM 설치
RUN npm install -g pnpm

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드 전에 환경 변수 파일 생성
RUN touch .env.local && \
    echo "MONGODB_URI=$MONGODB_URI" >> .env.local && \
    echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> .env.local

# Next.js 빌드
RUN pnpm build --force

# 프로덕션 이미지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# 필요한 사용자 추가
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p .next && \
    chown nextjs:nodejs .next

# 프로덕션에 필요한 파일만 복사
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/.env.local ./.env.local

# standalone 디렉토리가 있는지 확인하고 복사
RUN if [ -d "/app/.next/standalone" ]; then \
      cp -r /app/.next/standalone/* /app/; \
    fi

USER nextjs

EXPOSE 8080

# 애플리케이션 실행 (standalone 모드 또는 일반 모드)
CMD ["sh", "-c", "if [ -f 'server.js' ]; then node server.js; else next start; fi"]
