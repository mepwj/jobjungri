# GitHub Secrets 설정 안내

프로젝트를 배포하기 위해 GitHub 리포지토리에 다음 Secrets를 설정해야 합니다.

## 필요한 Secrets

1. **`MONGODB_URI`**: MongoDB 연결 문자열
   - 값 형식: `mongodb://username:password@localhost:27017/jobjungri?authSource=admin`
   - EC2 배포 시에는 자동으로 컨테이너 내부 연결로 대체됩니다.

2. **`OPENAI_API_KEY`**: OpenAI API 키
   - 값 형식: `sk-...`

3. **`MONGO_USERNAME`**: MongoDB 사용자 이름
   - MongoDB 컨테이너와 Next.js 애플리케이션 둘 다 사용합니다.

4. **`MONGO_PASSWORD`**: MongoDB 비밀번호
   - MongoDB 컨테이너와 Next.js 애플리케이션 둘 다 사용합니다.

5. **`EC2_HOST`**: EC2 인스턴스 IP 주소 또는 도메인 이름
   - 예: `123.45.67.89` 또는 `example.com`

6. **`EC2_USERNAME`**: EC2 인스턴스 로그인 사용자 이름
   - 일반적으로 Ubuntu 인스턴스의 경우 `ubuntu`

7. **`EC2_SSH_KEY`**: EC2 인스턴스에 연결하기 위한 SSH 개인 키
   - 전체 개인 키 내용 (-----BEGIN RSA PRIVATE KEY----- 부터 -----END RSA PRIVATE KEY----- 까지)

## GitHub Secrets 설정 방법

1. GitHub 리포지토리 페이지로 이동합니다.
2. `Settings` 탭을 클릭합니다.
3. 왼쪽 메뉴에서 `Secrets and variables` > `Actions`를 선택합니다.
4. `New repository secret` 버튼을 클릭합니다.
5. 위에 나열된 각 Secret을 추가합니다.

## 주의사항

- SSH 키는 개인 키(private key)여야 하며, 전체 내용을 복사해야 합니다.
- MongoDB 사용자 이름과 비밀번호는 특수 문자를 포함하지 않는 것이 좋습니다.
- OPENAI_API_KEY는 OpenAI 계정에서 발급받은 유효한 API 키여야 합니다.
