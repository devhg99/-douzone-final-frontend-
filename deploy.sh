#!/usr/bin/env bash
# bash에선 안전옵션 유지, dash(SSM)에서도 죽지 않게 pipefail은 선택 적용
set -Eeuo
(set -o pipefail) 2>/dev/null || true

# ====== 필요 변수 (환경 맞게 수정) ======
REGION="ap-northeast-2"
ACCOUNT_ID="373317459179"
REPO="web/frontend"

# Git Actions에서 sha tag 넘겨오면 1번 인자가 태그가 됨 (없으면 latest)
TAG="${TAG:-${1:-latest}}"

IMG="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${TAG}"
echo "[INFO] will deploy: ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${TAG}"

# ====== 사전 점검 ======
command -v docker >/dev/null 2>&1 || { echo "docker 없음"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "aws cli 없음"; exit 1; }

# ====== ECR 로그인 & 이미지 Pull ======
aws ecr get-login-password --region "$REGION" \
| docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "[INFO] pulling image: ${IMG}"
# 공간 부족/네트워크 이슈 등으로 pull 실패 시 캐시 정리 후 한 번 더 시도
if ! docker pull "${IMG}"; then
  echo "[WARN] pull failed → prune & retry"
  docker image prune -f || true
  docker container prune -f || true
  docker volume prune -f || true
  docker builder prune -f || true
  # dangling 외에도 미사용 이미지가 과하게 쌓였을 가능성
  docker image prune -a -f || true
  docker pull "${IMG}"
fi

# ====== docker compose로 재기동 ======
cd /opt/frontend

# docker compose가 FRONT_IMAGE env를 읽도록 export
export FRONT_IMAGE="${IMG}"

# compose 기준으로 전체 서비스 내려놓기(컨테이너/네트워크 정리)
docker compose -f docker-compose.yml down || true

# --pull always: compose가 참조하는 base images도 갱신
# --force-recreate: 컨테이너 강제 재생성
docker compose -f docker-compose.yml up -d --pull always --force-recreate

echo "[INFO] 컨테이너 상태"
docker ps --format 'table {{.Image}}\t{{.Names}}\t{{.Status}}' | grep -E 'frontend|IMAGE'

# ====== 간단 헬스체크 (127.0.0.1:3000) ======
echo "[INFO] 헬스체크 시작 (최대 90초 대기)"
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3000/ >/dev/null; then
    echo "[OK] 프론트엔드 응답 확인"
    break
  fi
  sleep 3
  echo "[WAIT] 앱 기동 대기중... ($i/30)"
done
# 마지막에 한 번 더 확인
curl -fsS http://127.0.0.1:3000/ >/dev/null || { echo "[ERROR] 프론트엔드 응답 없음"; exit 1; }