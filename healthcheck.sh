#!/bin/bash

# 애플리케이션 상태 확인 스크립트
# 배포 후 서비스가 정상적으로 실행 중인지 확인합니다

echo "=== 컨테이너 상태 확인 중... ==="
docker ps

echo ""
echo "=== MongoDB 컨테이너 상태 확인 중... ==="
docker logs jobjungri-mongodb --tail 20

echo ""
echo "=== Next.js 컨테이너 상태 확인 중... ==="
docker logs jobjungri-nextjs --tail 20

echo ""
echo "=== 애플리케이션 접속 확인 중... ==="
curl -sSf http://localhost:8080 > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ 애플리케이션이 정상적으로 응답합니다."
else
  echo "❌ 애플리케이션 접속에 실패했습니다."
fi

echo ""
echo "=== 디스크 사용량 확인 ==="
df -h

echo ""
echo "=== Docker 이미지 목록 ==="
docker images

echo ""
echo "=== 메모리 사용량 ==="
free -h
