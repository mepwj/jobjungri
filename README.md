# 잡정리

## DB 실행 (Docker)

```bash
USERNAME=${USERNAME} 
PASSWORD=${PASSWORD}
DBNAME=${PASSWORD} 
docker run -d --name ${DBNAME}-mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=${USERNAME} -e MONGO_INITDB_ROOT_PASSWORD=${PASSWORD} -e MONGO_INITDB_DATABASE=${DBNAME} mongo:latest
```

`.env.local` 파일은 프로젝트 루트(root) 경로에 생성하고, 다음 내용을 추가하세요 (위에서 설정한 Docker 환경 기준):

```
MONGODB_URI=mongodb://${USERNAME}:${PASSWORD}@localhost:27017/${PASSWORD}?authSource=admin
```

## 실행

```bash
pnpm install
pnpm dev
```
