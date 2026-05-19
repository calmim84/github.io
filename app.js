const categories = [
  "전체",
  "목표",
  "접근 경로",
  "조인 순서",
  "조인 방식",
  "병렬",
  "쿼리 변환",
  "DML/캐시",
  "진단/기타",
  "사용자 추가",
];

const hints = [
  {
    name: "ALL_ROWS",
    category: "목표",
    summary: "전체 결과 처리량을 우선하는 비용 기반 최적화 목표를 지정합니다.",
    syntax: "/*+ ALL_ROWS */",
    points: [
      "대량 조회, 리포트, 배치처럼 전체 집합 처리 시간이 중요한 SQL에 맞습니다.",
      "세션 또는 시스템 optimizer_mode보다 문장 단위 의도를 명확히 할 때 씁니다.",
    ],
    example: "SELECT /*+ ALL_ROWS */ c.customer_id, SUM(o.amount)\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id;",
    caution: "응답 첫 행 시간이 중요한 화면성 SQL에는 FIRST_ROWS(n)가 더 어울릴 수 있습니다.",
    related: ["FIRST_ROWS"],
    keywords: ["optimizer mode", "throughput", "처리량"],
  },
  {
    name: "FIRST_ROWS",
    category: "목표",
    summary: "처음 n개 행을 빠르게 반환하도록 최적화 목표를 지정합니다.",
    syntax: "/*+ FIRST_ROWS(10) */",
    points: [
      "페이징, 자동완성, 목록 첫 화면처럼 초반 응답 시간이 중요한 SQL에 사용합니다.",
      "n 값은 실제 화면이나 API가 먼저 소비하는 행 수에 맞춥니다.",
    ],
    example: "SELECT /*+ FIRST_ROWS(20) */ e.employee_id, e.last_name\nFROM employees e\nWHERE e.department_id = :dept_id\nORDER BY e.hire_date DESC\nFETCH FIRST 20 ROWS ONLY;",
    caution: "전체 행을 끝까지 읽는 배치 SQL에 과도하게 쓰면 전체 수행 시간이 나빠질 수 있습니다.",
    related: ["ALL_ROWS", "INDEX_DESC"],
    keywords: ["first rows", "응답", "페이징"],
  },
  {
    name: "FULL",
    category: "접근 경로",
    summary: "지정한 테이블을 전체 테이블 스캔으로 읽도록 유도합니다.",
    syntax: "/*+ FULL(table_alias) */",
    points: [
      "대부분의 행을 읽거나 인덱스 랜덤 액세스 비용이 큰 경우에 검토합니다.",
      "테이블 별칭을 사용한 SQL이면 힌트에도 실제 테이블명이 아니라 별칭을 씁니다.",
    ],
    example: "SELECT /*+ FULL(s) */ COUNT(*)\nFROM sales s\nWHERE s.sale_date >= DATE '2026-01-01';",
    caution: "선택도가 높은 조건에는 인덱스 접근보다 비쌀 수 있습니다. 버퍼 캐시와 병렬도도 함께 확인하세요.",
    related: ["INDEX", "PARALLEL"],
    keywords: ["full table scan", "fts", "전체 스캔"],
  },
  {
    name: "INDEX",
    category: "접근 경로",
    summary: "지정한 테이블에 인덱스 스캔을 사용하도록 유도합니다.",
    syntax: "/*+ INDEX(table_alias index_name) */",
    points: [
      "조건 선택도가 높고 적은 행을 찾을 때 유효합니다.",
      "인덱스명을 생략하면 옵티마이저가 사용 가능한 인덱스 중 비용을 비교합니다.",
    ],
    example: "SELECT /*+ INDEX(o orders_ix01) */ o.order_id, o.status\nFROM orders o\nWHERE o.customer_id = :customer_id;",
    caution: "힌트 대상 인덱스가 쿼리 조건과 맞지 않거나 함수/형 변환으로 컬럼이 변형되면 기대와 다른 계획이 나올 수 있습니다.",
    related: ["NO_INDEX", "INDEX_DESC", "INDEX_FFS"],
    keywords: ["index range scan", "인덱스"],
  },
  {
    name: "NO_INDEX",
    category: "접근 경로",
    summary: "지정한 인덱스를 사용하지 않도록 제외합니다.",
    syntax: "/*+ NO_INDEX(table_alias index_name) */",
    points: [
      "잘못 선택되는 인덱스 하나를 배제하고 싶을 때 씁니다.",
      "인덱스명을 생략하면 해당 테이블의 모든 인덱스 사용을 막는 의미가 될 수 있어 신중히 사용합니다.",
    ],
    example: "SELECT /*+ NO_INDEX(o orders_bad_ix) */ o.order_id\nFROM orders o\nWHERE o.created_at >= :from_dt;",
    caution: "INDEX와 NO_INDEX가 같은 인덱스를 동시에 지정하면 둘 다 무시될 수 있습니다.",
    related: ["INDEX", "FULL"],
    keywords: ["exclude index", "인덱스 제외"],
  },
  {
    name: "INDEX_ASC",
    category: "접근 경로",
    summary: "인덱스를 오름차순으로 스캔하도록 유도합니다.",
    syntax: "/*+ INDEX_ASC(table_alias index_name) */",
    points: [
      "정렬 방향이 인덱스 순서와 맞아 정렬 비용을 줄이고 싶을 때 검토합니다.",
      "기본 INDEX 힌트와 유사하지만 방향 의도를 더 분명히 표현합니다.",
    ],
    example: "SELECT /*+ INDEX_ASC(e emp_hiredate_ix) */ e.employee_id, e.hire_date\nFROM employees e\nWHERE e.hire_date >= :from_dt\nORDER BY e.hire_date ASC;",
    caution: "ORDER BY를 반드시 없애주는 것은 아닙니다. 실행계획에서 SORT ORDER BY가 사라졌는지 확인하세요.",
    related: ["INDEX", "INDEX_DESC"],
    keywords: ["ascending", "order by", "오름차순"],
  },
  {
    name: "INDEX_DESC",
    category: "접근 경로",
    summary: "인덱스를 내림차순으로 스캔하도록 유도합니다.",
    syntax: "/*+ INDEX_DESC(table_alias index_name) */",
    points: [
      "최신 데이터 n건 조회처럼 뒤쪽 범위를 먼저 읽고 싶을 때 자주 사용합니다.",
      "FIRST_ROWS(n), FETCH FIRST와 함께 검토되는 경우가 많습니다.",
    ],
    example: "SELECT /*+ FIRST_ROWS(10) INDEX_DESC(o orders_created_ix) */ o.order_id, o.created_at\nFROM orders o\nWHERE o.customer_id = :customer_id\nORDER BY o.created_at DESC\nFETCH FIRST 10 ROWS ONLY;",
    caution: "정렬 컬럼과 인덱스 컬럼 순서가 다르면 기대한 정렬 제거가 되지 않습니다.",
    related: ["FIRST_ROWS", "INDEX_ASC"],
    keywords: ["descending", "latest", "내림차순", "최신"],
  },
  {
    name: "INDEX_FFS",
    category: "접근 경로",
    summary: "인덱스 전체를 빠르게 스캔하는 fast full scan을 유도합니다.",
    syntax: "/*+ INDEX_FFS(table_alias index_name) */",
    points: [
      "필요 컬럼이 인덱스에 모두 있어 테이블 접근을 피할 수 있을 때 유효합니다.",
      "정렬 순서를 보장하는 인덱스 range scan과 목적이 다릅니다.",
    ],
    example: "SELECT /*+ INDEX_FFS(e emp_email_ix) */ COUNT(e.email)\nFROM employees e\nWHERE e.email IS NOT NULL;",
    caution: "Fast full scan은 인덱스 순서대로 결과를 반환하는 보장이 아니므로 ORDER BY 대체용으로 쓰면 안 됩니다.",
    related: ["NO_INDEX_FFS", "INDEX"],
    keywords: ["fast full scan", "covering", "index only"],
  },
  {
    name: "NO_INDEX_FFS",
    category: "접근 경로",
    summary: "인덱스 fast full scan을 사용하지 않도록 제한합니다.",
    syntax: "/*+ NO_INDEX_FFS(table_alias index_name) */",
    points: [
      "인덱스 전체 스캔이 반복적으로 선택되어 I/O가 커질 때 배제 후보입니다.",
      "특정 인덱스만 지정해 영향 범위를 좁히는 것이 좋습니다.",
    ],
    example: "SELECT /*+ NO_INDEX_FFS(e emp_email_ix) */ e.employee_id\nFROM employees e\nWHERE e.department_id = :dept_id;",
    caution: "다른 접근 경로가 더 좋은지 통계와 실제 실행 시간을 함께 비교하세요.",
    related: ["INDEX_FFS", "FULL"],
    keywords: ["fast full scan 제외"],
  },
  {
    name: "INDEX_COMBINE",
    category: "접근 경로",
    summary: "비트맵 인덱스들의 조합을 사용하도록 유도합니다.",
    syntax: "/*+ INDEX_COMBINE(table_alias index_a index_b) */",
    points: [
      "저카디널리티 조건 여러 개를 조합하는 DW성 조회에서 검토합니다.",
      "비트맵 인덱스 기반 접근이 유리한지 확인할 때 사용합니다.",
    ],
    example: "SELECT /*+ INDEX_COMBINE(s sales_region_bix sales_channel_bix) */ SUM(s.amount)\nFROM sales s\nWHERE s.region = :region\n  AND s.channel = :channel;",
    caution: "OLTP에서 비트맵 인덱스는 DML 동시성 부담이 클 수 있습니다.",
    related: ["BITMAP", "INDEX"],
    keywords: ["bitmap", "비트맵", "DW"],
  },
  {
    name: "INDEX_JOIN",
    category: "접근 경로",
    summary: "여러 인덱스를 조인해 테이블 접근 없이 결과를 만들도록 유도합니다.",
    syntax: "/*+ INDEX_JOIN(table_alias index_a index_b) */",
    points: [
      "조회 컬럼이 여러 인덱스에 나뉘어 있고 테이블 랜덤 액세스를 피하고 싶을 때 검토합니다.",
      "대상 인덱스들이 필요한 컬럼을 충분히 포함해야 효과가 있습니다.",
    ],
    example: "SELECT /*+ INDEX_JOIN(e emp_dept_ix emp_name_ix) */ e.employee_id, e.last_name\nFROM employees e\nWHERE e.department_id = :dept_id;",
    caution: "인덱스 조인 비용이 테이블 접근보다 낮은지 실제 실행계획과 블록 읽기량으로 확인하세요.",
    related: ["INDEX_FFS", "INDEX"],
    keywords: ["index join", "covering"],
  },
  {
    name: "INDEX_SS",
    category: "접근 경로",
    summary: "복합 인덱스의 선행 컬럼 조건이 약할 때 index skip scan을 유도합니다.",
    syntax: "/*+ INDEX_SS(table_alias index_name) */",
    points: [
      "복합 인덱스의 뒤쪽 컬럼 조건만으로도 접근 후보가 될 때 검토합니다.",
      "선행 컬럼의 distinct 값이 적을수록 유리할 가능성이 큽니다.",
    ],
    example: "SELECT /*+ INDEX_SS(e emp_job_dept_ix) */ e.employee_id\nFROM employees e\nWHERE e.department_id = :dept_id;",
    caution: "선행 컬럼 값 종류가 많으면 반복 탐색 비용이 커질 수 있습니다.",
    related: ["NO_INDEX_SS", "INDEX"],
    keywords: ["skip scan", "스킵 스캔"],
  },
  {
    name: "NO_INDEX_SS",
    category: "접근 경로",
    summary: "index skip scan을 사용하지 않도록 제한합니다.",
    syntax: "/*+ NO_INDEX_SS(table_alias index_name) */",
    points: [
      "skip scan이 과도한 반복 탐색을 만들 때 배제합니다.",
      "복합 인덱스 설계가 맞지 않는 신호일 수 있으므로 인덱스 컬럼 순서도 같이 봅니다.",
    ],
    example: "SELECT /*+ NO_INDEX_SS(e emp_job_dept_ix) */ e.employee_id\nFROM employees e\nWHERE e.department_id = :dept_id;",
    caution: "힌트로 막기 전에 실제 cardinality 추정이 왜 틀렸는지 확인하는 편이 좋습니다.",
    related: ["INDEX_SS", "INDEX"],
    keywords: ["skip scan 제외"],
  },
  {
    name: "CLUSTER",
    category: "접근 경로",
    summary: "클러스터 스캔을 사용하도록 유도합니다.",
    syntax: "/*+ CLUSTER(table_alias) */",
    points: [
      "클러스터에 저장된 테이블에서 클러스터 키 접근이 유리한 경우에 사용합니다.",
      "일반 힙 테이블에는 적용 대상이 아닙니다.",
    ],
    example: "SELECT /*+ CLUSTER(c) */ c.customer_id, c.customer_name\nFROM clustered_customers c\nWHERE c.customer_id = :customer_id;",
    caution: "클러스터 구조를 쓰는 시스템이 아니라면 이 힌트는 대부분 실무 빈도가 낮습니다.",
    related: ["FULL", "INDEX"],
    keywords: ["cluster scan", "클러스터"],
  },
  {
    name: "HASH",
    category: "접근 경로",
    summary: "해시 클러스터 스캔을 사용하도록 유도합니다.",
    syntax: "/*+ HASH(table_alias) */",
    points: [
      "해시 클러스터 테이블에서 해시 키 기반 접근을 유도합니다.",
      "해시 클러스터 설계가 되어 있어야 의미가 있습니다.",
    ],
    example: "SELECT /*+ HASH(c) */ c.customer_id, c.segment_code\nFROM hash_customers c\nWHERE c.customer_id = :customer_id;",
    caution: "일반 테이블의 hash join을 의미하지 않습니다. 조인 방식은 USE_HASH를 사용합니다.",
    related: ["USE_HASH", "CLUSTER"],
    keywords: ["hash cluster", "해시 클러스터"],
  },
  {
    name: "ORDERED",
    category: "조인 순서",
    summary: "FROM 절에 나열된 순서대로 조인하도록 유도합니다.",
    syntax: "/*+ ORDERED */",
    points: [
      "드라이빙 테이블 순서를 명확히 제어하고 싶을 때 사용합니다.",
      "LEADING보다 단순하지만 FROM 절 순서 변경에 민감합니다.",
    ],
    example: "SELECT /*+ ORDERED USE_NL(o) */ c.customer_id, o.order_id\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE c.customer_id = :customer_id;",
    caution: "ORDERED와 LEADING을 함께 쓰면 ORDERED가 우선합니다.",
    related: ["LEADING", "USE_NL"],
    keywords: ["join order", "driving", "조인 순서"],
  },
  {
    name: "LEADING",
    category: "조인 순서",
    summary: "조인 순서의 선두 또는 전체 순서를 지정합니다.",
    syntax: "/*+ LEADING(table_alias1 table_alias2 ...) */",
    points: [
      "FROM 절의 물리적 순서를 바꾸지 않고 조인 순서를 지정할 수 있습니다.",
      "복잡한 다중 조인에서 드라이빙 집합을 고정할 때 자주 씁니다.",
    ],
    example: "SELECT /*+ LEADING(c o l) USE_NL(o) USE_NL(l) */ c.customer_id, l.product_id\nFROM order_lines l\nJOIN orders o ON o.order_id = l.order_id\nJOIN customers c ON c.customer_id = o.customer_id\nWHERE c.customer_id = :customer_id;",
    caution: "상충되는 LEADING 힌트가 여러 개 있으면 모두 무시될 수 있습니다.",
    related: ["ORDERED", "USE_NL", "USE_HASH"],
    keywords: ["join order", "leading", "드라이빙"],
  },
  {
    name: "USE_NL",
    category: "조인 방식",
    summary: "지정한 테이블을 nested loops 방식으로 조인하도록 유도합니다.",
    syntax: "/*+ USE_NL(inner_table_alias) */",
    points: [
      "선행 집합이 작고 후행 테이블을 인덱스로 빠르게 찾을 수 있을 때 적합합니다.",
      "LEADING 또는 ORDERED와 함께 조인 순서를 같이 제어하는 경우가 많습니다.",
    ],
    example: "SELECT /*+ LEADING(c) USE_NL(o) INDEX(o orders_customer_ix) */ c.customer_id, o.order_id\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE c.customer_id = :customer_id;",
    caution: "선행 집합이 커지면 후행 테이블 반복 접근이 폭증할 수 있습니다.",
    related: ["NO_USE_NL", "USE_HASH", "LEADING"],
    keywords: ["nested loops", "nl join", "중첩 루프"],
  },
  {
    name: "NO_USE_NL",
    category: "조인 방식",
    summary: "지정한 테이블을 nested loops 방식으로 조인하지 않도록 제한합니다.",
    syntax: "/*+ NO_USE_NL(table_alias) */",
    points: [
      "반복 랜덤 액세스가 커지는 nested loops 계획을 피하고 싶을 때 사용합니다.",
      "대안으로 hash join 또는 sort merge join이 선택될 수 있습니다.",
    ],
    example: "SELECT /*+ NO_USE_NL(o) */ c.segment_code, SUM(o.amount)\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.segment_code;",
    caution: "조인 방식 제한만으로 최적 계획이 보장되지는 않습니다. 조인 순서와 통계도 같이 확인합니다.",
    related: ["USE_NL", "USE_HASH", "USE_MERGE"],
    keywords: ["no nested loops", "NL 제외"],
  },
  {
    name: "USE_NL_WITH_INDEX",
    category: "조인 방식",
    summary: "nested loops 조인과 함께 후행 테이블 인덱스 접근을 유도합니다.",
    syntax: "/*+ USE_NL_WITH_INDEX(table_alias index_name) */",
    points: [
      "후행 테이블의 조인 키 인덱스를 반드시 활용해야 효과가 있는 패턴에 씁니다.",
      "USE_NL과 INDEX를 함께 쓴 의도를 하나로 표현할 때 유용합니다.",
    ],
    example: "SELECT /*+ LEADING(c) USE_NL_WITH_INDEX(o orders_customer_ix) */ c.customer_id, o.order_id\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE c.status = 'ACTIVE';",
    caution: "인덱스가 조인 조건에 적합하지 않으면 힌트가 무시되거나 비효율적일 수 있습니다.",
    related: ["USE_NL", "INDEX", "LEADING"],
    keywords: ["nested loops index", "인덱스 조인"],
  },
  {
    name: "USE_HASH",
    category: "조인 방식",
    summary: "지정한 테이블을 hash join 방식으로 조인하도록 유도합니다.",
    syntax: "/*+ USE_HASH(table_alias) */",
    points: [
      "큰 집합끼리 동등 조인을 수행하고 랜덤 액세스를 줄이고 싶을 때 검토합니다.",
      "빌드 입력이 지나치게 크지 않도록 조인 순서와 메모리 사용량을 같이 봅니다.",
    ],
    example: "SELECT /*+ USE_HASH(o) */ c.segment_code, SUM(o.amount)\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_date >= DATE '2026-01-01'\nGROUP BY c.segment_code;",
    caution: "메모리가 부족하면 hash join이 TEMP를 많이 사용할 수 있습니다.",
    related: ["NO_USE_HASH", "LEADING", "PQ_DISTRIBUTE"],
    keywords: ["hash join", "해시 조인", "대량"],
  },
  {
    name: "NO_USE_HASH",
    category: "조인 방식",
    summary: "지정한 테이블을 hash join 방식으로 조인하지 않도록 제한합니다.",
    syntax: "/*+ NO_USE_HASH(table_alias) */",
    points: [
      "TEMP 사용량이 큰 hash join이나 잘못된 대량 조인 계획을 배제할 때 사용합니다.",
      "대안 조인 방식이 실제로 더 나은지 비교가 필요합니다.",
    ],
    example: "SELECT /*+ NO_USE_HASH(o) USE_NL(o) */ c.customer_id, o.order_id\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE c.customer_id = :customer_id;",
    caution: "동등 조인 대량 처리에서는 hash join이 가장 좋은 경우도 많으므로 제거 이유를 명확히 해야 합니다.",
    related: ["USE_HASH", "USE_NL", "USE_MERGE"],
    keywords: ["hash join 제외", "temp"],
  },
  {
    name: "USE_MERGE",
    category: "조인 방식",
    summary: "지정한 테이블을 sort merge join 방식으로 조인하도록 유도합니다.",
    syntax: "/*+ USE_MERGE(table_alias) */",
    points: [
      "양쪽 입력이 이미 정렬되어 있거나 범위 조인 성격이 있을 때 검토합니다.",
      "동등 조인뿐 아니라 일부 비동등 조인에서도 후보가 됩니다.",
    ],
    example: "SELECT /*+ USE_MERGE(b) */ a.account_id, b.balance\nFROM account_snapshot_a a\nJOIN account_snapshot_b b ON b.account_id = a.account_id;",
    caution: "정렬 비용이 커질 수 있으므로 TEMP 사용량을 확인하세요.",
    related: ["NO_USE_MERGE", "USE_HASH", "USE_NL"],
    keywords: ["sort merge join", "머지 조인", "정렬"],
  },
  {
    name: "NO_USE_MERGE",
    category: "조인 방식",
    summary: "지정한 테이블을 sort merge join 방식으로 조인하지 않도록 제한합니다.",
    syntax: "/*+ NO_USE_MERGE(table_alias) */",
    points: [
      "불필요한 정렬과 TEMP 사용이 큰 sort merge join을 피할 때 사용합니다.",
      "대체 방식으로 nested loops 또는 hash join이 선택됩니다.",
    ],
    example: "SELECT /*+ NO_USE_MERGE(o) USE_HASH(o) */ c.segment_code, SUM(o.amount)\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.segment_code;",
    caution: "범위 조인에서는 merge join이 유리할 수 있으므로 조인 조건 성격을 먼저 봅니다.",
    related: ["USE_MERGE", "USE_HASH", "USE_NL"],
    keywords: ["merge join 제외", "sort"],
  },
  {
    name: "PARALLEL",
    category: "병렬",
    summary: "테이블 또는 SQL 문장에 병렬 실행을 유도합니다.",
    syntax: "/*+ PARALLEL(table_alias 4) */",
    points: [
      "대량 스캔, 집계, 적재 작업에서 elapsed time을 줄일 때 검토합니다.",
      "병렬도는 시스템 자원과 동시 실행 SQL 수를 고려해 정합니다.",
    ],
    example: "SELECT /*+ PARALLEL(s 8) FULL(s) */ s.region, SUM(s.amount)\nFROM sales s\nWHERE s.sale_date >= DATE '2026-01-01'\nGROUP BY s.region;",
    caution: "병렬은 총 자원 사용량을 늘립니다. 운영 피크 시간에는 오히려 전체 시스템을 느리게 만들 수 있습니다.",
    related: ["NO_PARALLEL", "PQ_DISTRIBUTE", "FULL"],
    keywords: ["parallel query", "dop", "병렬도"],
  },
  {
    name: "NO_PARALLEL",
    category: "병렬",
    summary: "지정한 테이블 또는 SQL 문장을 병렬로 실행하지 않도록 제한합니다.",
    syntax: "/*+ NO_PARALLEL(table_alias) */",
    points: [
      "객체 기본 병렬도가 설정되어 있어도 특정 SQL은 직렬로 실행하고 싶을 때 사용합니다.",
      "작은 OLTP SQL에서 불필요한 PX 오버헤드를 제거할 때 유용합니다.",
    ],
    example: "SELECT /*+ NO_PARALLEL(o) INDEX(o orders_pk) */ o.order_id, o.status\nFROM orders o\nWHERE o.order_id = :order_id;",
    caution: "대량 처리 SQL에서 직렬 실행으로 바꾸면 elapsed time이 크게 늘 수 있습니다.",
    related: ["PARALLEL", "NO_PARALLEL_INDEX"],
    keywords: ["serial", "병렬 제외", "px"],
  },
  {
    name: "PARALLEL_INDEX",
    category: "병렬",
    summary: "인덱스 스캔에 병렬 실행을 유도합니다.",
    syntax: "/*+ PARALLEL_INDEX(table_alias index_name 4) */",
    points: [
      "파티션 인덱스나 큰 인덱스 범위를 병렬로 읽을 때 검토합니다.",
      "테이블 병렬 힌트와 구분해 인덱스 접근의 병렬도를 표현합니다.",
    ],
    example: "SELECT /*+ PARALLEL_INDEX(s sales_date_ix 4) INDEX_FFS(s sales_date_ix) */ COUNT(*)\nFROM sales s\nWHERE s.sale_date >= DATE '2026-01-01';",
    caution: "인덱스 병렬 스캔이 항상 테이블 병렬 스캔보다 좋은 것은 아닙니다.",
    related: ["NO_PARALLEL_INDEX", "INDEX_FFS", "PARALLEL"],
    keywords: ["parallel index", "인덱스 병렬"],
  },
  {
    name: "NO_PARALLEL_INDEX",
    category: "병렬",
    summary: "인덱스 스캔의 병렬 실행을 막습니다.",
    syntax: "/*+ NO_PARALLEL_INDEX(table_alias index_name) */",
    points: [
      "인덱스 객체의 병렬 속성 때문에 의도치 않은 PX가 붙는 경우에 사용합니다.",
      "특정 인덱스만 지정해 제한 범위를 좁히는 편이 안전합니다.",
    ],
    example: "SELECT /*+ NO_PARALLEL_INDEX(o orders_customer_ix) */ o.order_id\nFROM orders o\nWHERE o.customer_id = :customer_id;",
    caution: "힌트가 병렬 계획만 제한할 뿐 더 좋은 접근 경로를 보장하지는 않습니다.",
    related: ["PARALLEL_INDEX", "NO_PARALLEL"],
    keywords: ["parallel index 제외"],
  },
  {
    name: "ENABLE_PARALLEL_DML",
    category: "병렬",
    summary: "문장 단위로 병렬 DML을 활성화합니다.",
    syntax: "/*+ ENABLE_PARALLEL_DML */",
    points: [
      "INSERT, UPDATE, DELETE, MERGE에서 병렬 DML이 필요할 때 사용합니다.",
      "세션 설정 ALTER SESSION ENABLE PARALLEL DML의 문장 단위 대안입니다.",
    ],
    example: "INSERT /*+ ENABLE_PARALLEL_DML PARALLEL(t 8) */ INTO sales_summary t\nSELECT region, SUM(amount)\nFROM sales\nGROUP BY region;",
    caution: "병렬 DML은 잠금, undo/redo, 제약조건, 트리거 영향을 반드시 확인해야 합니다.",
    related: ["DISABLE_PARALLEL_DML", "PARALLEL", "APPEND"],
    keywords: ["parallel dml", "insert", "update", "merge"],
  },
  {
    name: "DISABLE_PARALLEL_DML",
    category: "병렬",
    summary: "문장 단위로 병렬 DML을 비활성화합니다.",
    syntax: "/*+ DISABLE_PARALLEL_DML */",
    points: [
      "세션에서 병렬 DML이 켜져 있어도 특정 문장은 직렬 DML로 실행하고 싶을 때 사용합니다.",
      "작은 트랜잭션이나 동시성이 중요한 OLTP 작업에 적합할 수 있습니다.",
    ],
    example: "UPDATE /*+ DISABLE_PARALLEL_DML */ orders o\nSET o.status = 'CHECKED'\nWHERE o.order_id = :order_id;",
    caution: "대량 DML의 수행 시간은 늘 수 있으므로 배치 시간 창을 고려하세요.",
    related: ["ENABLE_PARALLEL_DML", "NO_PARALLEL"],
    keywords: ["parallel dml 제외"],
  },
  {
    name: "PQ_DISTRIBUTE",
    category: "병렬",
    summary: "병렬 조인에서 행 분배 방식을 지정합니다.",
    syntax: "/*+ PQ_DISTRIBUTE(table_alias HASH HASH) */",
    points: [
      "병렬 hash join에서 데이터 재분배 비용과 skew를 제어할 때 검토합니다.",
      "HASH, BROADCAST, NONE 등 분배 방식은 조인 입력 크기와 분포에 맞춰야 합니다.",
    ],
    example: "SELECT /*+ USE_HASH(o) PQ_DISTRIBUTE(o HASH HASH) */ c.segment_code, SUM(o.amount)\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.segment_code;",
    caution: "잘못된 분배 방식은 PX 서버 간 데이터 이동량이나 skew를 키울 수 있습니다.",
    related: ["PARALLEL", "USE_HASH"],
    keywords: ["parallel join", "distribution", "px", "skew"],
  },
  {
    name: "USE_CONCAT",
    category: "쿼리 변환",
    summary: "OR 조건을 UNION ALL 형태로 확장하는 OR-expansion을 유도합니다.",
    syntax: "/*+ USE_CONCAT */",
    points: [
      "OR 조건 때문에 인덱스 활용이 어려운 SQL을 분기별 접근으로 바꾸고 싶을 때 검토합니다.",
      "각 분기 조건의 선택도가 다를 때 효과가 날 수 있습니다.",
    ],
    example: "SELECT /*+ USE_CONCAT */ o.order_id, o.status\nFROM orders o\nWHERE o.customer_id = :customer_id\n   OR o.order_status = :status;",
    caution: "분기가 많거나 중복 제거가 필요한 형태에서는 SQL이 커지고 비용이 늘 수 있습니다.",
    related: ["NO_EXPAND", "INDEX"],
    keywords: ["or expansion", "union all", "OR"],
  },
  {
    name: "NO_EXPAND",
    category: "쿼리 변환",
    summary: "OR-expansion 변환을 하지 않도록 제한합니다.",
    syntax: "/*+ NO_EXPAND */",
    points: [
      "OR 조건이 UNION ALL 분기로 확장되어 오히려 비효율적일 때 사용합니다.",
      "쿼리 변환을 국소적으로 막고 싶을 때 유용합니다.",
    ],
    example: "SELECT /*+ NO_EXPAND */ o.order_id\nFROM orders o\nWHERE o.customer_id = :customer_id\n   OR o.created_at >= :from_dt;",
    caution: "OR 조건의 각 분기 인덱스 접근 기회를 막을 수 있습니다.",
    related: ["USE_CONCAT", "NO_QUERY_TRANSFORMATION"],
    keywords: ["or expansion 제외", "no expand"],
  },
  {
    name: "MERGE",
    category: "쿼리 변환",
    summary: "뷰 또는 서브쿼리 블록을 상위 쿼리 블록으로 병합하도록 유도합니다.",
    syntax: "/*+ MERGE(view_alias) */",
    points: [
      "뷰 경계 때문에 predicate pushdown이나 조인 재배치가 제한될 때 검토합니다.",
      "인라인 뷰 이름 또는 query block 이름과 함께 쓰면 의도가 분명해집니다.",
    ],
    example: "SELECT /*+ MERGE(v) */ v.customer_id, v.total_amount\nFROM (\n  SELECT customer_id, SUM(amount) total_amount\n  FROM orders\n  GROUP BY customer_id\n) v\nWHERE v.total_amount > :min_amount;",
    caution: "집계, DISTINCT, 분석 함수가 있는 뷰는 병합 가능성이 제한될 수 있습니다.",
    related: ["NO_MERGE", "QB_NAME"],
    keywords: ["view merge", "뷰 병합"],
  },
  {
    name: "NO_MERGE",
    category: "쿼리 변환",
    summary: "뷰 또는 서브쿼리 블록이 상위 쿼리로 병합되지 않도록 유지합니다.",
    syntax: "/*+ NO_MERGE(view_alias) */",
    points: [
      "인라인 뷰에서 먼저 집계나 필터링을 수행한 뒤 조인하게 만들고 싶을 때 씁니다.",
      "복잡한 SQL에서 쿼리 블록 경계를 유지하는 용도로 자주 사용됩니다.",
    ],
    example: "SELECT /*+ NO_MERGE(v) USE_HASH(v) */ c.segment_code, v.total_amount\nFROM customers c\nJOIN (\n  SELECT customer_id, SUM(amount) total_amount\n  FROM orders\n  GROUP BY customer_id\n) v ON v.customer_id = c.customer_id;",
    caution: "뷰 병합을 막으면 predicate pushdown이나 조인 순서 최적화 기회를 잃을 수 있습니다.",
    related: ["MERGE", "MATERIALIZE", "QB_NAME"],
    keywords: ["no merge", "materialize", "인라인뷰"],
  },
  {
    name: "UNNEST",
    category: "쿼리 변환",
    summary: "서브쿼리를 조인 형태로 풀어내는 unnesting을 유도합니다.",
    syntax: "/*+ UNNEST */",
    points: [
      "IN, EXISTS 서브쿼리를 조인으로 바꿔 더 나은 조인 계획을 만들고 싶을 때 검토합니다.",
      "서브쿼리 블록 안에 배치해 해당 블록 변환을 유도할 수 있습니다.",
    ],
    example: "SELECT e.employee_id, e.last_name\nFROM employees e\nWHERE EXISTS (\n  SELECT /*+ UNNEST */ 1\n  FROM bonuses b\n  WHERE b.employee_id = e.employee_id\n);",
    caution: "상관 서브쿼리 의미가 복잡하거나 집계가 섞이면 변환이 제한될 수 있습니다.",
    related: ["NO_UNNEST", "SEMIJOIN"],
    keywords: ["subquery unnesting", "exists", "in"],
  },
  {
    name: "NO_UNNEST",
    category: "쿼리 변환",
    summary: "서브쿼리 unnesting 변환을 하지 않도록 제한합니다.",
    syntax: "/*+ NO_UNNEST */",
    points: [
      "서브쿼리를 조인으로 변환한 계획이 비효율적일 때 사용합니다.",
      "서브쿼리의 필터 실행 순서를 유지하고 싶을 때 검토합니다.",
    ],
    example: "SELECT e.employee_id, e.last_name\nFROM employees e\nWHERE EXISTS (\n  SELECT /*+ NO_UNNEST */ 1\n  FROM bonuses b\n  WHERE b.employee_id = e.employee_id\n);",
    caution: "조인 변환으로 얻을 수 있는 대량 처리 이점을 막을 수 있습니다.",
    related: ["UNNEST", "NO_QUERY_TRANSFORMATION"],
    keywords: ["subquery unnesting 제외"],
  },
  {
    name: "PUSH_PRED",
    category: "쿼리 변환",
    summary: "조인 predicate를 뷰 안쪽으로 밀어 넣도록 유도합니다.",
    syntax: "/*+ PUSH_PRED(view_alias) */",
    points: [
      "뷰 내부에서 먼저 필터링되어 읽는 행 수가 줄어들 때 유용합니다.",
      "복잡한 뷰 조인에서 predicate pushdown 여부를 확인할 때 씁니다.",
    ],
    example: "SELECT /*+ PUSH_PRED(v) */ c.customer_id, v.last_order_date\nFROM customers c\nJOIN customer_order_view v ON v.customer_id = c.customer_id\nWHERE c.customer_id = :customer_id;",
    caution: "뷰 정의와 조인 형태에 따라 pushdown이 불가능하거나 효과가 작을 수 있습니다.",
    related: ["NO_PUSH_PRED", "MERGE"],
    keywords: ["predicate pushdown", "조건 밀어넣기"],
  },
  {
    name: "NO_PUSH_PRED",
    category: "쿼리 변환",
    summary: "조인 predicate를 뷰 안쪽으로 밀어 넣지 않도록 제한합니다.",
    syntax: "/*+ NO_PUSH_PRED(view_alias) */",
    points: [
      "predicate pushdown이 잘못된 반복 실행이나 비효율 계획을 만들 때 사용합니다.",
      "뷰 경계를 유지해야 더 좋은 계획이 나오는 경우에 검토합니다.",
    ],
    example: "SELECT /*+ NO_PUSH_PRED(v) */ c.segment_code, v.total_amount\nFROM customers c\nJOIN customer_order_summary_v v ON v.customer_id = c.customer_id;",
    caution: "뷰 내부 필터링 기회를 잃을 수 있으므로 읽은 행 수 변화를 확인하세요.",
    related: ["PUSH_PRED", "NO_MERGE"],
    keywords: ["predicate pushdown 제외"],
  },
  {
    name: "PUSH_SUBQ",
    category: "쿼리 변환",
    summary: "non-merged 서브쿼리를 가능한 이른 시점에 평가하도록 유도합니다.",
    syntax: "/*+ PUSH_SUBQ */",
    points: [
      "서브쿼리 필터를 먼저 적용하면 후속 조인 입력이 크게 줄어드는 경우에 사용합니다.",
      "서브쿼리 블록에 넣어 해당 서브쿼리 평가 시점을 유도할 수 있습니다.",
    ],
    example: "SELECT e.employee_id, e.last_name\nFROM employees e\nWHERE e.salary > (\n  SELECT /*+ PUSH_SUBQ */ AVG(salary)\n  FROM employees\n  WHERE department_id = e.department_id\n);",
    caution: "서브쿼리 실행 횟수가 늘어날 수 있으므로 실제 rows와 starts를 확인하세요.",
    related: ["NO_PUSH_SUBQ", "NO_UNNEST"],
    keywords: ["subquery push", "서브쿼리"],
  },
  {
    name: "NO_PUSH_SUBQ",
    category: "쿼리 변환",
    summary: "서브쿼리를 이른 시점에 평가하지 않도록 제한합니다.",
    syntax: "/*+ NO_PUSH_SUBQ */",
    points: [
      "서브쿼리를 먼저 평가하는 계획이 반복 비용을 키울 때 사용합니다.",
      "조인 이후 줄어든 결과에 서브쿼리를 적용하는 편이 유리한 경우가 있습니다.",
    ],
    example: "SELECT e.employee_id, e.last_name\nFROM employees e\nWHERE e.salary > (\n  SELECT /*+ NO_PUSH_SUBQ */ AVG(salary)\n  FROM employees\n  WHERE department_id = e.department_id\n);",
    caution: "필터링이 늦어져 중간 결과가 커질 수 있습니다.",
    related: ["PUSH_SUBQ", "NO_UNNEST"],
    keywords: ["subquery push 제외"],
  },
  {
    name: "STAR_TRANSFORMATION",
    category: "쿼리 변환",
    summary: "스타 스키마 쿼리에 star transformation을 사용하도록 유도합니다.",
    syntax: "/*+ STAR_TRANSFORMATION */",
    points: [
      "팩트 테이블과 여러 차원 테이블을 조인하는 DW 쿼리에서 검토합니다.",
      "비트맵 인덱스와 차원 필터 조건이 잘 갖춰졌을 때 효과가 큽니다.",
    ],
    example: "SELECT /*+ STAR_TRANSFORMATION */ SUM(s.amount)\nFROM sales s\nJOIN customers c ON c.customer_id = s.customer_id\nJOIN products p ON p.product_id = s.product_id\nWHERE c.region = :region\n  AND p.category = :category;",
    caution: "OLTP성 조인에는 대개 맞지 않습니다. 스타 스키마 구조와 인덱스 설계가 전제입니다.",
    related: ["NO_STAR_TRANSFORMATION", "FACT", "INDEX_COMBINE"],
    keywords: ["star schema", "data warehouse", "팩트", "차원"],
  },
  {
    name: "NO_STAR_TRANSFORMATION",
    category: "쿼리 변환",
    summary: "star transformation을 사용하지 않도록 제한합니다.",
    syntax: "/*+ NO_STAR_TRANSFORMATION */",
    points: [
      "스타 변환으로 쿼리 블록이 복잡해지거나 임시 결과가 커질 때 사용합니다.",
      "DW 쿼리에서 변환 전후 계획을 비교할 때 유용합니다.",
    ],
    example: "SELECT /*+ NO_STAR_TRANSFORMATION */ SUM(s.amount)\nFROM sales s\nJOIN customers c ON c.customer_id = s.customer_id\nJOIN products p ON p.product_id = s.product_id\nWHERE c.region = :region\n  AND p.category = :category;",
    caution: "조건 선택도가 높고 비트맵 인덱스가 좋은 경우에는 변환을 막아 성능이 나빠질 수 있습니다.",
    related: ["STAR_TRANSFORMATION", "NO_QUERY_TRANSFORMATION"],
    keywords: ["star transformation 제외"],
  },
  {
    name: "FACT",
    category: "쿼리 변환",
    summary: "star transformation에서 해당 테이블을 fact table로 표시합니다.",
    syntax: "/*+ FACT(table_alias) */",
    points: [
      "옵티마이저가 스타 쿼리의 팩트 테이블을 잘못 판단할 때 보조 힌트로 사용합니다.",
      "STAR_TRANSFORMATION과 함께 검토되는 경우가 많습니다.",
    ],
    example: "SELECT /*+ STAR_TRANSFORMATION FACT(s) */ SUM(s.amount)\nFROM sales s\nJOIN customers c ON c.customer_id = s.customer_id\nJOIN products p ON p.product_id = s.product_id\nWHERE c.region = :region\n  AND p.category = :category;",
    caution: "스키마 모델이 스타 구조가 아니면 의미가 약합니다.",
    related: ["NO_FACT", "STAR_TRANSFORMATION"],
    keywords: ["fact table", "팩트"],
  },
  {
    name: "NO_FACT",
    category: "쿼리 변환",
    summary: "star transformation에서 해당 테이블을 fact table로 보지 않도록 표시합니다.",
    syntax: "/*+ NO_FACT(table_alias) */",
    points: [
      "차원 테이블이 팩트 후보로 오인되는 것을 막고 싶을 때 사용합니다.",
      "스타 변환 계획을 세밀하게 조정할 때 활용합니다.",
    ],
    example: "SELECT /*+ STAR_TRANSFORMATION NO_FACT(c) FACT(s) */ SUM(s.amount)\nFROM sales s\nJOIN customers c ON c.customer_id = s.customer_id\nWHERE c.region = :region;",
    caution: "테이블 역할을 잘못 지정하면 스타 변환 선택 자체가 나빠질 수 있습니다.",
    related: ["FACT", "STAR_TRANSFORMATION"],
    keywords: ["fact 제외", "dimension"],
  },
  {
    name: "NO_QUERY_TRANSFORMATION",
    category: "쿼리 변환",
    summary: "대부분의 쿼리 변환을 비활성화합니다.",
    syntax: "/*+ NO_QUERY_TRANSFORMATION */",
    points: [
      "쿼리 변환이 성능 문제의 원인인지 분리해서 확인할 때 진단용으로 유용합니다.",
      "운영 고정 힌트로 쓰기 전에는 국소 힌트로 대체할 수 있는지 검토합니다.",
    ],
    example: "SELECT /*+ NO_QUERY_TRANSFORMATION */ c.customer_id\nFROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id\n);",
    caution: "뷰 병합, 서브쿼리 unnesting, OR-expansion 등 유용한 변환까지 한꺼번에 막을 수 있습니다.",
    related: ["NO_MERGE", "NO_UNNEST", "NO_EXPAND"],
    keywords: ["transformation off", "변환 차단"],
  },
  {
    name: "REWRITE",
    category: "쿼리 변환",
    summary: "가능한 경우 materialized view 기반 query rewrite를 유도합니다.",
    syntax: "/*+ REWRITE(materialized_view_name) */",
    points: [
      "집계 또는 조인 결과가 materialized view에 미리 준비된 DW/리포트 쿼리에서 검토합니다.",
      "객체명 없이 쓰면 적합한 materialized view 후보를 옵티마이저가 고릅니다.",
    ],
    example: "SELECT /*+ REWRITE(sales_mv) */ region, SUM(amount)\nFROM sales\nGROUP BY region;",
    caution: "query rewrite 관련 초기화 파라미터, 무결성 수준, MV freshness가 조건에 맞아야 합니다.",
    related: ["NO_REWRITE"],
    keywords: ["materialized view", "query rewrite", "MV"],
  },
  {
    name: "NO_REWRITE",
    category: "쿼리 변환",
    summary: "materialized view 기반 query rewrite를 사용하지 않도록 제한합니다.",
    syntax: "/*+ NO_REWRITE */",
    points: [
      "MV rewrite가 의도와 다른 결과 경로나 비용을 만들 때 배제합니다.",
      "원본 테이블 기준 실행계획과 비교할 때 유용합니다.",
    ],
    example: "SELECT /*+ NO_REWRITE */ region, SUM(amount)\nFROM sales\nGROUP BY region;",
    caution: "대형 집계 쿼리에서는 MV rewrite를 막아 수행 시간이 크게 늘 수 있습니다.",
    related: ["REWRITE"],
    keywords: ["query rewrite 제외", "materialized view"],
  },
  {
    name: "APPEND",
    category: "DML/캐시",
    summary: "INSERT에서 direct-path insert를 유도합니다.",
    syntax: "/*+ APPEND */",
    points: [
      "대량 적재에서 버퍼 캐시 경유를 줄이고 적재 속도를 높이고 싶을 때 검토합니다.",
      "INSERT INTO ... SELECT 형태의 배치 적재에서 자주 사용합니다.",
    ],
    example: "INSERT /*+ APPEND PARALLEL(t 4) */ INTO sales_stage t\nSELECT *\nFROM external_sales_feed;",
    caution: "direct-path insert는 잠금, HWM 증가, redo/undo, 인덱스 유지 비용, 트랜잭션 가시성 영향을 확인해야 합니다.",
    related: ["NOAPPEND", "ENABLE_PARALLEL_DML", "PARALLEL"],
    keywords: ["direct path insert", "insert append", "대량 적재"],
  },
  {
    name: "APPEND_VALUES",
    category: "DML/캐시",
    summary: "VALUES 절 기반 INSERT에 direct-path insert를 유도합니다.",
    syntax: "/*+ APPEND_VALUES */",
    points: [
      "단일 또는 배열 바인드 VALUES 적재에서 direct-path를 의도할 때 사용합니다.",
      "대량 VALUES 로드 패턴에서 제한적으로 검토합니다.",
    ],
    example: "INSERT /*+ APPEND_VALUES */ INTO sales_stage\n  (sale_id, amount, created_at)\nVALUES\n  (:sale_id, :amount, SYSTIMESTAMP);",
    caution: "일반 OLTP 단건 입력에 습관적으로 쓰면 잠금과 공간 사용 측면에서 부적절할 수 있습니다.",
    related: ["APPEND", "NOAPPEND"],
    keywords: ["append values", "direct path values"],
  },
  {
    name: "NOAPPEND",
    category: "DML/캐시",
    summary: "direct-path insert를 사용하지 않고 conventional insert를 유도합니다.",
    syntax: "/*+ NOAPPEND */",
    points: [
      "객체나 세션 설정으로 direct-path가 선택될 가능성을 막고 싶을 때 사용합니다.",
      "동시성, 공간 재사용, 일반 OLTP 트랜잭션 특성이 중요할 때 검토합니다.",
    ],
    example: "INSERT /*+ NOAPPEND */ INTO orders_audit\nSELECT *\nFROM orders\nWHERE order_id = :order_id;",
    caution: "대량 적재에서는 conventional insert가 더 느릴 수 있습니다.",
    related: ["APPEND", "APPEND_VALUES"],
    keywords: ["conventional insert", "direct path 제외"],
  },
  {
    name: "CACHE",
    category: "DML/캐시",
    summary: "전체 테이블 스캔으로 읽은 블록을 LRU의 최근 사용 쪽에 둘 것을 유도합니다.",
    syntax: "/*+ CACHE(table_alias) */",
    points: [
      "작은 참조 테이블을 반복적으로 전체 스캔하는 경우에 검토합니다.",
      "FULL 힌트와 함께 의도를 명확히 하는 경우가 있습니다.",
    ],
    example: "SELECT /*+ FULL(d) CACHE(d) */ d.code, d.name\nFROM common_codes d;",
    caution: "큰 테이블에 쓰면 유용한 캐시 블록을 밀어낼 수 있습니다.",
    related: ["NOCACHE", "FULL"],
    keywords: ["buffer cache", "lru", "캐시"],
  },
  {
    name: "NOCACHE",
    category: "DML/캐시",
    summary: "전체 테이블 스캔 블록을 버퍼 캐시의 오래된 쪽에 두도록 유도합니다.",
    syntax: "/*+ NOCACHE(table_alias) */",
    points: [
      "큰 일회성 스캔이 캐시를 오염시키는 것을 줄이고 싶을 때 검토합니다.",
      "배치성 전체 스캔에서 캐시 영향을 줄이는 의도를 표현합니다.",
    ],
    example: "SELECT /*+ FULL(s) NOCACHE(s) */ COUNT(*)\nFROM sales_archive s\nWHERE s.sale_year = 2020;",
    caution: "같은 데이터를 곧 다시 읽는다면 캐시 이점을 잃을 수 있습니다.",
    related: ["CACHE", "FULL"],
    keywords: ["buffer cache", "cache pollution", "캐시 제외"],
  },
  {
    name: "RESULT_CACHE",
    category: "DML/캐시",
    summary: "SQL query result cache 사용을 유도합니다.",
    syntax: "/*+ RESULT_CACHE */",
    points: [
      "자주 반복되고 결과가 작으며 기초 테이블 변경이 적은 조회에 적합합니다.",
      "마스터성 코드 조회나 비용 큰 집계 결과 캐싱 후보를 검토할 때 씁니다.",
    ],
    example: "SELECT /*+ RESULT_CACHE */ code, code_name\nFROM common_codes\nWHERE group_code = :group_code;",
    caution: "변경이 잦은 테이블이나 결과가 큰 SQL에는 캐시 무효화와 메모리 압박이 생길 수 있습니다.",
    related: ["NO_RESULT_CACHE", "CACHE"],
    keywords: ["result cache", "결과 캐시"],
  },
  {
    name: "NO_RESULT_CACHE",
    category: "DML/캐시",
    summary: "SQL query result cache를 사용하지 않도록 제한합니다.",
    syntax: "/*+ NO_RESULT_CACHE */",
    points: [
      "세션 또는 시스템 설정으로 result cache 후보가 되더라도 특정 SQL은 제외하고 싶을 때 사용합니다.",
      "실시간성이 중요하거나 변경이 잦은 데이터 조회에서 검토합니다.",
    ],
    example: "SELECT /*+ NO_RESULT_CACHE */ account_id, current_balance\nFROM account_balance\nWHERE account_id = :account_id;",
    caution: "반복 조회가 매우 많은 정적 데이터에서는 캐시 이점을 잃을 수 있습니다.",
    related: ["RESULT_CACHE"],
    keywords: ["result cache 제외"],
  },
  {
    name: "DRIVING_SITE",
    category: "진단/기타",
    summary: "분산 쿼리에서 실행 위치를 특정 사이트로 유도합니다.",
    syntax: "/*+ DRIVING_SITE(table_alias) */",
    points: [
      "DB link 쿼리에서 어느 쪽 데이터베이스로 데이터를 이동할지 제어할 때 사용합니다.",
      "큰 테이블을 원격에서 로컬로 끌고 오지 않게 하거나 반대로 원격 실행을 유도할 수 있습니다.",
    ],
    example: "SELECT /*+ DRIVING_SITE(r) */ l.customer_id, r.remote_score\nFROM local_customers l\nJOIN remote_scores@crm_link r ON r.customer_id = l.customer_id\nWHERE l.region = :region;",
    caution: "네트워크 비용, 원격 통계, 권한, 함수 실행 위치에 따라 효과가 크게 달라집니다.",
    related: ["LEADING", "USE_HASH"],
    keywords: ["dblink", "remote", "distributed", "분산"],
  },
  {
    name: "DYNAMIC_SAMPLING",
    category: "진단/기타",
    summary: "동적 샘플링 수준을 지정해 최적화 시점에 추가 통계를 수집하도록 유도합니다.",
    syntax: "/*+ DYNAMIC_SAMPLING(table_alias 4) */",
    points: [
      "통계가 없거나 데이터 분포 추정이 어려운 임시/스테이징 테이블에 유용합니다.",
      "복잡한 조건의 cardinality 추정을 개선하는 진단용으로도 사용합니다.",
    ],
    example: "SELECT /*+ DYNAMIC_SAMPLING(t 6) */ COUNT(*)\nFROM temp_sales_filter t\nWHERE t.segment_code = :segment_code;",
    caution: "파싱 시점 샘플링 비용이 늘 수 있습니다. 반복 실행 SQL에는 영구 통계 수집을 우선 검토하세요.",
    related: ["OPT_PARAM", "GATHER_OPTIMIZER_STATISTICS"],
    keywords: ["dynamic sampling", "statistics", "통계"],
  },
  {
    name: "OPT_PARAM",
    category: "진단/기타",
    summary: "특정 옵티마이저 파라미터 값을 SQL 문장 단위로 지정합니다.",
    syntax: "/*+ OPT_PARAM('optimizer_index_cost_adj' 50) */",
    points: [
      "시스템 설정을 바꾸지 않고 특정 SQL에서 옵티마이저 동작을 실험할 때 사용합니다.",
      "문제 원인을 좁히는 진단용으로 특히 유용합니다.",
    ],
    example: "SELECT /*+ OPT_PARAM('optimizer_dynamic_sampling' 6) */ COUNT(*)\nFROM temp_sales_filter\nWHERE segment_code = :segment_code;",
    caution: "숨겨진 파라미터나 광범위한 설정을 SQL에 고정하면 업그레이드와 유지보수 리스크가 큽니다.",
    related: ["DYNAMIC_SAMPLING", "QB_NAME"],
    keywords: ["optimizer parameter", "parameter", "파라미터"],
  },
  {
    name: "QB_NAME",
    category: "진단/기타",
    summary: "쿼리 블록에 이름을 붙여 다른 힌트가 정확한 블록을 겨냥하게 합니다.",
    syntax: "/*+ QB_NAME(block_name) */",
    points: [
      "복잡한 서브쿼리, 인라인 뷰, UNION SQL에서 힌트 대상이 어긋나지 않도록 씁니다.",
      "@block_name 표기와 함께 다른 힌트의 적용 위치를 명확히 할 수 있습니다.",
    ],
    example: "SELECT /*+ QB_NAME(main) LEADING(@main c o) */ c.customer_id, o.order_id\nFROM customers c\nJOIN (\n  SELECT /*+ QB_NAME(recent_orders) */ *\n  FROM orders\n  WHERE order_date >= :from_dt\n) o ON o.customer_id = c.customer_id;",
    caution: "블록 이름 오타나 변환으로 인한 블록 변화가 있으면 힌트가 기대대로 적용되지 않을 수 있습니다.",
    related: ["NO_MERGE", "LEADING", "INDEX"],
    keywords: ["query block", "hint target", "쿼리 블록"],
  },
  {
    name: "MONITOR",
    category: "진단/기타",
    summary: "SQL Monitor 대상으로 삼도록 유도합니다.",
    syntax: "/*+ MONITOR */",
    points: [
      "긴 실행 SQL의 실시간 실행 단계, row source, 병렬 상태를 관찰하고 싶을 때 사용합니다.",
      "성능 분석용 힌트이며 접근 경로나 조인 방식을 직접 바꾸는 힌트가 아닙니다.",
    ],
    example: "SELECT /*+ MONITOR */ c.segment_code, SUM(o.amount)\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.segment_code;",
    caution: "진단 목적으로 사용하고, 운영 SQL에 상시 남길지는 모니터링 오버헤드와 정책을 고려하세요.",
    related: ["NO_MONITOR", "GATHER_PLAN_STATISTICS"],
    keywords: ["sql monitor", "diagnostic", "모니터링"],
  },
  {
    name: "NO_MONITOR",
    category: "진단/기타",
    summary: "SQL Monitor 대상이 되지 않도록 유도합니다.",
    syntax: "/*+ NO_MONITOR */",
    points: [
      "불필요한 SQL Monitor 생성을 줄이고 싶을 때 사용합니다.",
      "진단 정책상 특정 문장을 모니터링에서 제외할 때 검토합니다.",
    ],
    example: "SELECT /*+ NO_MONITOR */ COUNT(*)\nFROM small_lookup_table;",
    caution: "문제 분석 시 필요한 실시간 정보를 놓칠 수 있습니다.",
    related: ["MONITOR"],
    keywords: ["sql monitor 제외"],
  },
  {
    name: "GATHER_PLAN_STATISTICS",
    category: "진단/기타",
    summary: "실행 시 row source 통계를 수집해 DBMS_XPLAN에서 실제 행 수를 보게 합니다.",
    syntax: "/*+ GATHER_PLAN_STATISTICS */",
    points: [
      "예상 행 수와 실제 행 수 차이를 확인할 때 가장 자주 쓰는 진단 힌트입니다.",
      "DBMS_XPLAN.DISPLAY_CURSOR format에 ALLSTATS LAST를 함께 사용합니다.",
    ],
    example: "SELECT /*+ GATHER_PLAN_STATISTICS */ c.customer_id, COUNT(o.order_id)\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id;\n\nSELECT *\nFROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL, NULL, 'ALLSTATS LAST +HINT_REPORT'));",
    caution: "진단 통계 수집 오버헤드가 있으므로 상시 운영 SQL에 남기기보다 분석 시점에 사용하는 편이 좋습니다.",
    related: ["MONITOR", "QB_NAME"],
    keywords: ["dbms_xplan", "allstats", "actual rows", "실행 통계"],
  },
  {
    name: "GATHER_OPTIMIZER_STATISTICS",
    category: "진단/기타",
    summary: "bulk load 작업에서 로드 대상 객체의 optimizer statistics 수집을 유도합니다.",
    syntax: "/*+ GATHER_OPTIMIZER_STATISTICS */",
    points: [
      "대량 적재 후 별도 통계 수집 단계를 줄이고 싶을 때 검토합니다.",
      "CREATE TABLE AS SELECT 또는 INSERT SELECT 패턴과 함께 쓰입니다.",
    ],
    example: "CREATE TABLE sales_2026 NOLOGGING AS\nSELECT /*+ GATHER_OPTIMIZER_STATISTICS */ *\nFROM sales\nWHERE sale_date >= DATE '2026-01-01';",
    caution: "통계 수집 시간이 로드 경로에 포함될 수 있습니다. 파티션, 증분 통계 정책과 함께 검토하세요.",
    related: ["NO_GATHER_OPTIMIZER_STATISTICS", "APPEND"],
    keywords: ["optimizer statistics", "bulk load", "통계 수집"],
  },
  {
    name: "NO_GATHER_OPTIMIZER_STATISTICS",
    category: "진단/기타",
    summary: "bulk load 시 optimizer statistics 자동 수집을 하지 않도록 제한합니다.",
    syntax: "/*+ NO_GATHER_OPTIMIZER_STATISTICS */",
    points: [
      "로드 후 별도 표준 절차로 통계를 수집하려는 경우에 사용합니다.",
      "대량 적재 시간을 우선 줄이고 통계를 나중에 관리하고 싶을 때 검토합니다.",
    ],
    example: "INSERT /*+ APPEND NO_GATHER_OPTIMIZER_STATISTICS */ INTO sales_stage\nSELECT *\nFROM external_sales_feed;",
    caution: "로드 후 통계가 없거나 오래된 상태로 쿼리가 실행되면 잘못된 계획이 나올 수 있습니다.",
    related: ["GATHER_OPTIMIZER_STATISTICS", "APPEND"],
    keywords: ["statistics 제외", "bulk load"],
  },
];

const scenarios = [
  { label: "인덱스 유도", hints: ["INDEX", "INDEX_DESC", "INDEX_FFS", "NO_INDEX"] },
  { label: "드라이빙 고정", hints: ["LEADING", "ORDERED", "USE_NL", "USE_HASH"] },
  { label: "대량 집계", hints: ["FULL", "PARALLEL", "USE_HASH", "NO_MERGE"] },
  { label: "병렬 튜닝", hints: ["PARALLEL", "PQ_DISTRIBUTE", "NO_PARALLEL", "ENABLE_PARALLEL_DML"] },
  { label: "쿼리 변환", hints: ["USE_CONCAT", "NO_MERGE", "UNNEST", "NO_QUERY_TRANSFORMATION"] },
  { label: "실행계획 진단", hints: ["GATHER_PLAN_STATISTICS", "MONITOR", "QB_NAME", "DYNAMIC_SAMPLING"] },
  { label: "대량 적재", hints: ["APPEND", "APPEND_VALUES", "NOAPPEND", "GATHER_OPTIMIZER_STATISTICS"] },
];

const sourceLinks = [
  {
    label: "Oracle Database SQL Language Reference 19c - Comments and optimizer hints",
    url: "https://docs.oracle.com/pls/topic/lookup?ctx=en/database/oracle/oracle-database/19/tgsql&id=SQLRF51107",
  },
  {
    label: "Oracle Database SQL Tuning Guide 19c - Influencing the Optimizer",
    url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/influencing-the-optimizer.html",
  },
];

const STORAGE_KEY = "oracle-sql-hint-reference.customHints.v1";
const BASE_HINTS = hints.map((hint) => ({
  ...hint,
  points: [...hint.points],
  related: [...hint.related],
  keywords: [...hint.keywords],
  custom: false,
  isUserEdited: false,
}));

let userHints = loadUserHints();
let editorMode = "edit";
let editingName = null;

const state = {
  query: "",
  category: "전체",
  scenario: null,
  selected: hints[0].name,
  sort: "name",
};

const els = {
  addHint: document.querySelector("#add-hint"),
  exportJson: document.querySelector("#export-json"),
  importJson: document.querySelector("#import-json"),
  importFile: document.querySelector("#import-file"),
  searchInput: document.querySelector("#search-input"),
  categoryFilters: document.querySelector("#category-filters"),
  scenarioList: document.querySelector("#scenario-list"),
  hintList: document.querySelector("#hint-list"),
  visibleCount: document.querySelector("#visible-count"),
  totalCount: document.querySelector("#total-count"),
  resultsTitle: document.querySelector("#results-title"),
  sortSelect: document.querySelector("#sort-select"),
  detailCategory: document.querySelector("#detail-category"),
  detailName: document.querySelector("#detail-name"),
  detailBadge: document.querySelector("#detail-badge"),
  detailSummary: document.querySelector("#detail-summary"),
  detailSyntax: document.querySelector("#detail-syntax"),
  detailPoints: document.querySelector("#detail-points"),
  detailExample: document.querySelector("#detail-example"),
  detailCaution: document.querySelector("#detail-caution"),
  relatedHints: document.querySelector("#related-hints"),
  editCurrent: document.querySelector("#edit-current"),
  resetCurrent: document.querySelector("#reset-current"),
  editorCard: document.querySelector("#editor-card"),
  editorTitle: document.querySelector("#editor-title"),
  hintForm: document.querySelector("#hint-form"),
  editName: document.querySelector("#edit-name"),
  editCategory: document.querySelector("#edit-category"),
  editSummary: document.querySelector("#edit-summary"),
  editSyntax: document.querySelector("#edit-syntax"),
  editPoints: document.querySelector("#edit-points"),
  editExample: document.querySelector("#edit-example"),
  editCaution: document.querySelector("#edit-caution"),
  editRelated: document.querySelector("#edit-related"),
  cancelEdit: document.querySelector("#cancel-edit"),
  editorStatus: document.querySelector("#editor-status"),
  copyCurrent: document.querySelector("#copy-current"),
  copyExample: document.querySelector("#copy-example"),
  hintCardTemplate: document.querySelector("#hint-card-template"),
};

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("ko-KR").replace(/\s+/g, " ").trim();
}

function normalizeName(value) {
  return String(value ?? "").trim().replace(/\s+/g, "_").toLocaleUpperCase("ko-KR");
}

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitNames(value) {
  return String(value ?? "")
    .split(/[\n,]+/)
    .map((item) => normalizeName(item))
    .filter(Boolean);
}

function normalizeHint(hint) {
  const name = normalizeName(hint.name);
  const category = categories.includes(hint.category) && hint.category !== "전체" ? hint.category : "사용자 추가";

  return {
    name,
    category,
    summary: String(hint.summary ?? "").trim(),
    syntax: String(hint.syntax ?? `/*+ ${name || "HINT"} */`).trim(),
    points: Array.isArray(hint.points) ? hint.points.map(String).map((point) => point.trim()).filter(Boolean) : [],
    example: String(hint.example ?? "").trim(),
    caution: String(hint.caution ?? "").trim(),
    related: Array.isArray(hint.related) ? hint.related.map(normalizeName).filter(Boolean) : [],
    keywords: Array.isArray(hint.keywords) ? hint.keywords.map(String).filter(Boolean) : [],
    custom: Boolean(hint.custom),
    isUserEdited: Boolean(hint.isUserEdited),
  };
}

function normalizeImportedHint(hint) {
  const normalized = normalizeHint(hint);
  const baseHint = findBaseHint(normalized.name);

  return {
    ...normalized,
    custom: !baseHint,
    isUserEdited: Boolean(baseHint),
  };
}

function loadUserHints() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeHint).filter((hint) => hint.name);
  } catch {
    return [];
  }
}

function saveUserHints() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userHints));
    return true;
  } catch {
    return false;
  }
}

function getExportPayload() {
  return {
    app: "oracle-sql-hint-reference",
    version: 1,
    exportedAt: new Date().toISOString(),
    hints: userHints.map((hint) => normalizeImportedHint(hint)),
  };
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportUserHints() {
  const payload = getExportPayload();
  const dateKey = new Date().toISOString().slice(0, 10);
  downloadTextFile(`oracle-sql-hints-${dateKey}.json`, JSON.stringify(payload, null, 2));
  flashButton(els.exportJson, `내보냄 ${payload.hints.length}`);
}

function parseImportedHints(jsonText) {
  const parsed = JSON.parse(jsonText);
  const items = Array.isArray(parsed) ? parsed : parsed?.hints;
  if (!Array.isArray(items)) {
    throw new Error("힌트 배열을 찾을 수 없습니다.");
  }

  return items
    .map(normalizeImportedHint)
    .filter((hint) => hint.name)
    .filter((hint, index, list) => list.findIndex((item) => item.name === hint.name) === index);
}

function mergeImportedHints(importedHints) {
  const merged = new Map(userHints.map((hint) => [hint.name, hint]));
  importedHints.forEach((hint) => {
    merged.set(hint.name, hint);
  });
  userHints = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
  return saveUserHints();
}

async function importUserHints(file) {
  if (!file) return;

  try {
    const importedHints = parseImportedHints(await file.text());
    const saved = mergeImportedHints(importedHints);
    if (!saved) {
      flashButton(els.importJson, "저장 실패");
      return;
    }

    state.selected = importedHints[0]?.name || state.selected;
    state.category = "전체";
    state.scenario = null;
    state.query = "";
    els.searchInput.value = "";
    closeEditor();
    render();
    flashButton(els.importJson, `가져옴 ${importedHints.length}`);
  } catch {
    flashButton(els.importJson, "가져오기 실패");
  } finally {
    els.importFile.value = "";
  }
}

function findBaseHint(name) {
  return BASE_HINTS.find((hint) => hint.name === name);
}

function findUserHint(name) {
  return userHints.find((hint) => hint.name === name);
}

function findHint(name) {
  const baseHint = findBaseHint(name);
  const userHint = findUserHint(name);
  if (baseHint && userHint) {
    return {
      ...baseHint,
      ...userHint,
      points: [...userHint.points],
      related: [...userHint.related],
      keywords: [...new Set([...baseHint.keywords, ...userHint.keywords, userHint.name])],
      custom: false,
      isUserEdited: true,
    };
  }

  if (userHint) {
    return {
      ...userHint,
      points: [...userHint.points],
      related: [...userHint.related],
      keywords: [...new Set([...userHint.keywords, userHint.name, userHint.category])],
      custom: true,
      isUserEdited: false,
    };
  }

  return baseHint;
}

function getAllHints() {
  const userNames = new Set(userHints.map((hint) => hint.name));
  const mergedBaseHints = BASE_HINTS.map((hint) => findHint(hint.name));
  const customHints = userHints
    .filter((hint) => !BASE_HINTS.some((baseHint) => baseHint.name === hint.name))
    .map((hint) => findHint(hint.name));

  return [...mergedBaseHints, ...customHints].filter((hint) => hint && (hint.custom || userNames.has(hint.name) || !hint.isUserEdited));
}

function getHint(name) {
  return findHint(name) || BASE_HINTS[0];
}

function isInScenario(hint) {
  if (!state.scenario) return true;
  return state.scenario.hints.includes(hint.name);
}

function matchesQuery(hint) {
  const query = normalize(state.query);
  if (!query) return true;

  const haystack = normalize([
    hint.name,
    hint.category,
    hint.summary,
    hint.syntax,
    hint.points.join(" "),
    hint.example,
    hint.caution,
    hint.related.join(" "),
    hint.keywords.join(" "),
  ].join(" "));

  return haystack.includes(query);
}

function scoreHint(hint) {
  const query = normalize(state.query);
  if (!query) return 0;

  const name = normalize(hint.name);
  const category = normalize(hint.category);
  const summary = normalize(hint.summary);
  const keywords = normalize(hint.keywords.join(" "));

  if (name === query) return 100;
  if (name.startsWith(query)) return 80;
  if (name.includes(query)) return 60;
  if (category.includes(query)) return 40;
  if (keywords.includes(query)) return 30;
  if (summary.includes(query)) return 20;
  return 10;
}

function getFilteredHints() {
  const filtered = getAllHints().filter((hint) => {
    const categoryMatch = state.category === "전체" || hint.category === state.category;
    return categoryMatch && isInScenario(hint) && matchesQuery(hint);
  });

  return filtered.sort((a, b) => {
    const scoreDelta = scoreHint(b) - scoreHint(a);
    if (scoreDelta !== 0) return scoreDelta;

    if (state.sort === "category") {
      return `${a.category}-${a.name}`.localeCompare(`${b.category}-${b.name}`, "ko-KR");
    }
    return a.name.localeCompare(b.name, "ko-KR");
  });
}

function renderCategories() {
  els.categoryFilters.replaceChildren();
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "chip";
    button.type = "button";
    button.textContent = category;
    button.setAttribute("aria-pressed", String(state.category === category));
    button.addEventListener("click", () => {
      state.category = category;
      state.scenario = null;
      render();
    });
    els.categoryFilters.append(button);
  });
}

function renderScenarios() {
  els.scenarioList.replaceChildren();
  scenarios.forEach((scenario) => {
    const button = document.createElement("button");
    button.className = "scenario-button";
    button.type = "button";
    button.textContent = scenario.label;
    button.setAttribute("aria-pressed", String(state.scenario?.label === scenario.label));
    button.addEventListener("click", () => {
      state.scenario = state.scenario?.label === scenario.label ? null : scenario;
      state.category = "전체";
      render();
    });
    els.scenarioList.append(button);
  });
}

function renderList() {
  const visible = getFilteredHints();
  const allHints = getAllHints();
  els.hintList.replaceChildren();
  els.visibleCount.textContent = String(visible.length);
  els.totalCount.textContent = String(allHints.length);
  els.resultsTitle.textContent = state.scenario
    ? state.scenario.label
    : state.category === "전체"
      ? "전체 힌트"
      : state.category;

  if (!visible.some((hint) => hint.name === state.selected) && visible.length) {
    state.selected = visible[0].name;
  }

  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "검색 조건에 맞는 힌트가 없습니다.";
    els.hintList.append(empty);
    return;
  }

  visible.forEach((hint) => {
    const card = els.hintCardTemplate.content.firstElementChild.cloneNode(true);
    card.classList.toggle("is-active", hint.name === state.selected);
    card.classList.toggle("is-custom", hint.custom || hint.isUserEdited);
    card.querySelector(".hint-card-name").textContent = hint.name;
    card.querySelector(".hint-card-category").textContent = hint.custom ? "사용자 추가" : hint.category;
    card.querySelector(".hint-card-summary").textContent = hint.summary;
    card.addEventListener("click", () => {
      state.selected = hint.name;
      renderDetail();
      renderList();
    });
    els.hintList.append(card);
  });
}

function renderDetail() {
  const hint = getHint(state.selected);
  els.detailCategory.textContent = hint.category;
  els.detailName.textContent = hint.name;
  els.detailBadge.textContent = hint.custom ? "사용자 추가" : hint.isUserEdited ? "사용자 수정" : "Oracle Hint";
  els.detailSummary.textContent = hint.summary;
  els.detailSyntax.textContent = hint.syntax;
  els.detailExample.textContent = hint.example;
  els.detailCaution.textContent = hint.caution;
  els.resetCurrent.hidden = !(hint.custom || hint.isUserEdited);
  els.resetCurrent.textContent = hint.custom ? "사용자 힌트 삭제" : "사용자 수정 삭제";

  els.detailPoints.replaceChildren();
  hint.points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    els.detailPoints.append(item);
  });

  els.relatedHints.replaceChildren();
  hint.related.forEach((name) => {
    const related = findHint(name);
    if (!related) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "related-button";
    button.textContent = related.name;
    button.addEventListener("click", () => {
      state.selected = related.name;
      state.category = "전체";
      state.scenario = null;
      render();
    });
    els.relatedHints.append(button);
  });

  if (!hint.custom) {
    const source = document.createElement("a");
    source.href = sourceLinks[0].url;
    source.target = "_blank";
    source.rel = "noreferrer";
    source.className = "related-button";
    source.textContent = "Oracle 공식 문서";
    els.relatedHints.append(source);
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.append(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

function flashButton(button, label) {
  const original = button.textContent;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = original;
  }, 1100);
}

function populateCategoryOptions() {
  els.editCategory.replaceChildren();
  categories
    .filter((category) => category !== "전체")
    .forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      els.editCategory.append(option);
    });
}

function setEditorStatus(message, isError = false) {
  els.editorStatus.textContent = message;
  els.editorStatus.style.color = isError ? "#8d2f21" : "";
}

function openEditor(mode) {
  editorMode = mode;
  editingName = mode === "edit" ? state.selected : null;
  const hint =
    mode === "edit"
      ? getHint(state.selected)
      : {
          name: "",
          category: "사용자 추가",
          summary: "",
          syntax: "/*+ HINT */",
          points: [],
          example: "SELECT /*+ HINT */ *\nFROM your_table;",
          caution: "",
          related: [],
        };

  els.editorTitle.textContent = mode === "edit" ? `${hint.name} 수정` : "새 힌트 추가";
  els.editName.value = hint.name;
  els.editName.readOnly = mode === "edit";
  els.editCategory.value = hint.category;
  els.editSummary.value = hint.summary;
  els.editSyntax.value = hint.syntax;
  els.editPoints.value = hint.points.join("\n");
  els.editExample.value = hint.example;
  els.editCaution.value = hint.caution;
  els.editRelated.value = hint.related.join(", ");
  setEditorStatus("");
  els.editorCard.hidden = false;
  els.editorCard.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    if (mode === "add") {
      els.editName.focus();
    } else {
      els.editSyntax.focus();
    }
  }, 120);
}

function closeEditor() {
  els.editorCard.hidden = true;
  editingName = null;
  setEditorStatus("");
}

function collectHintFromForm() {
  const name = normalizeName(els.editName.value);
  const baseHint = findBaseHint(name);
  const category = els.editCategory.value || "사용자 추가";
  const summary = els.editSummary.value.trim() || `${name} 사용자 정의 힌트입니다.`;
  const points = splitLines(els.editPoints.value);
  const related = splitNames(els.editRelated.value).filter((relatedName) => relatedName !== name);
  const syntax = els.editSyntax.value.trim();
  const example = els.editExample.value.trim();
  const caution = els.editCaution.value.trim();

  return normalizeHint({
    name,
    category,
    summary,
    syntax,
    points,
    example,
    caution,
    related,
    keywords: [name, category, summary, ...points],
    custom: !baseHint,
    isUserEdited: Boolean(baseHint),
  });
}

function saveEditorHint() {
  const hint = collectHintFromForm();
  if (!hint.name) {
    setEditorStatus("힌트명을 입력하세요.", true);
    return;
  }

  if (!hint.syntax) {
    setEditorStatus("문법을 입력하세요.", true);
    return;
  }

  if (!hint.example) {
    setEditorStatus("예시 SQL을 입력하세요.", true);
    return;
  }

  const existingHint = findHint(hint.name);
  if (editorMode === "add" && existingHint) {
    setEditorStatus("이미 있는 힌트입니다. 목록에서 선택한 뒤 수정하세요.", true);
    return;
  }

  if (editorMode === "edit" && editingName && hint.name !== editingName) {
    setEditorStatus("기존 힌트의 이름은 변경하지 않습니다. 새 이름은 새 힌트로 추가하세요.", true);
    return;
  }

  const index = userHints.findIndex((item) => item.name === hint.name);
  if (index >= 0) {
    userHints[index] = hint;
  } else {
    userHints.push(hint);
  }

  const saved = saveUserHints();
  state.selected = hint.name;
  state.category = "전체";
  state.scenario = null;
  state.query = "";
  els.searchInput.value = "";
  closeEditor();
  render();

  if (!saved) {
    openEditor("edit");
    setEditorStatus("현재 세션에는 반영됐지만 브라우저 저장소에 저장하지 못했습니다.", true);
  }
}

function resetCurrentCustomization() {
  const hint = getHint(state.selected);
  const index = userHints.findIndex((item) => item.name === hint.name);
  if (index < 0) return;

  userHints.splice(index, 1);
  saveUserHints();
  state.selected = hint.custom ? BASE_HINTS[0].name : hint.name;
  state.category = "전체";
  state.scenario = null;
  state.query = "";
  els.searchInput.value = "";
  closeEditor();
  render();
}

function render() {
  renderCategories();
  renderScenarios();
  renderList();
  renderDetail();
}

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

els.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderList();
});

els.addHint.addEventListener("click", () => {
  openEditor("add");
});

els.exportJson.addEventListener("click", () => {
  exportUserHints();
});

els.importJson.addEventListener("click", () => {
  els.importFile.click();
});

els.importFile.addEventListener("change", (event) => {
  importUserHints(event.target.files?.[0]);
});

els.editCurrent.addEventListener("click", () => {
  openEditor("edit");
});

els.cancelEdit.addEventListener("click", () => {
  closeEditor();
});

els.resetCurrent.addEventListener("click", () => {
  resetCurrentCustomization();
});

els.hintForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveEditorHint();
});

els.copyCurrent.addEventListener("click", async () => {
  await copyText(getHint(state.selected).syntax);
  flashButton(els.copyCurrent, "복사됨");
});

els.copyExample.addEventListener("click", async () => {
  await copyText(getHint(state.selected).example);
  flashButton(els.copyExample, "복사됨");
});

populateCategoryOptions();
render();
