# Oracle SQL Hint Tuning Reference

Oracle SQL 튜닝 중 자주 확인하는 힌트의 의미, 문법, 사용 예시, 주의점을 검색할 수 있는 1차 버전 로컬 웹 앱입니다.

## 실행

`index.html` 파일을 브라우저에서 열면 바로 사용할 수 있습니다. 별도 서버나 설치는 필요하지 않습니다.

## 포함 기능

- 힌트명, 카테고리, 키워드, 예시 SQL 기준 검색
- 카테고리 및 활용 시나리오 필터
- 힌트 문법과 예시 SQL 복사
- UI에서 새 힌트 추가
- 기본 힌트 또는 사용자 추가 힌트의 의미, 문법, 사용 포인트, 예시, 주의점 수정
- 사용자 추가/수정 내용 브라우저 `localStorage` 저장
- 사용자 추가/수정 내용 JSON 내보내기 및 가져오기
- 힌트 적용 여부 확인용 `DBMS_XPLAN.DISPLAY_CURSOR` 예시
- 힌트 사용 전후 체크리스트

## 사용자 힌트 관리

상단의 `새 힌트 추가` 버튼으로 Oracle 문서에 없거나 사내에서 따로 관리하는 힌트/메모를 추가할 수 있습니다. 상세 패널의 `현재 힌트 수정` 버튼을 누르면 선택한 힌트의 문법, 사용 포인트, 예시 SQL을 직접 바꿀 수 있습니다.

수정 내용은 현재 브라우저의 `localStorage`에 저장됩니다. 같은 파일을 같은 브라우저에서 다시 열면 유지되지만, 다른 PC나 다른 브라우저로 자동 동기화되지는 않습니다.

다른 기기나 브라우저로 옮길 때는 상단의 `JSON 내보내기`로 파일을 받은 뒤, 새 환경에서 `JSON 가져오기`로 불러오면 됩니다. 같은 힌트명이 이미 있으면 가져온 JSON의 내용으로 덮어씁니다.

## 기준 문서

- Oracle Database SQL Language Reference 19c: Comments and optimizer hints
- Oracle Database SQL Tuning Guide 19c: Influencing the Optimizer

Oracle 힌트는 버전, 통계, 파라미터, 객체 구조, SQL 변환 결과에 따라 적용 여부가 달라질 수 있습니다. 운영 적용 전에는 `DBMS_XPLAN.DISPLAY_CURSOR`의 `+HINT_REPORT`, 실제 실행 통계, 데이터 분포를 함께 확인하세요.
