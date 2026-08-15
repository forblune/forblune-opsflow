# Forblune OpsFlow

운영팀의 CSV·Excel 데이터를 취합하고, 검증 규칙을 거쳐 KPI 대시보드와 보고서로 정리하는 한국어 B2B 포트폴리오 데모입니다.

## 포함 기능

- 샘플 데이터와 사용자 CSV 불러오기
- 담당자 누락, 중복 ID, 환불률 임계치 검증
- 검증 통과 데이터만 반영하는 KPI 대시보드
- 정제 CSV 다운로드와 인쇄용 주간 리포트
- 모바일·태블릿·데스크톱 반응형 레이아웃
- 포트폴리오용 가상 데이터와 명확한 면책 표시

## 실행

```bash
npm ci
npm run dev
```

## 검증

```bash
npm run lint
npm test
```

## 데이터 안내

화면의 회사, 캠페인, 매출 수치는 모두 가상 데이터입니다. 업로드한 CSV는 브라우저에서만 처리하며 별도 서버에 저장하지 않습니다.

첫 화면의 시각 자료도 생성형 3D 이미지가 아니라 실제 데모와 같은 검증표 구조와 샘플 행을 사용합니다. 보이는 수치와 오류 상태는 아래 인터랙티브 데모에서 그대로 확인할 수 있습니다.

## English

Forblune OpsFlow is a bilingual B2B operations portfolio demo that turns CSV and spreadsheet inputs into validated data, KPI dashboards, and export-ready reports. Use the `EN` switch in the header for an English experience suitable for Upwork, Contra, and international client proposals.
