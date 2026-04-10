### 문제 1. 테이블 생성하기 (`CREATE TABLE`)
`attendance` 테이블에는 같은 크루의 `nickname`이 여러 행에 반복 저장된다.  
즉, 크루 정보와 출석 정보가 한 테이블에 섞여 있어 중복이 발생한다.

#### 답
중복을 제거하려면 크루 정보를 별도 테이블로 분리한다.

```sql
CREATE TABLE crew (
    crew_id INT NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    PRIMARY KEY (crew_id)
);
```

`attendance`에서 크루 정보만 뽑을 때는 `DISTINCT`를 사용한다.

```sql
SELECT DISTINCT
    crew_id,
    nickname
FROM attendance;
```

추출한 값을 `crew` 테이블에 넣는다.

```sql
INSERT INTO crew (crew_id, nickname)
SELECT DISTINCT
    crew_id,
    nickname
FROM attendance;
```

---

### 문제 2. 테이블 컬럼 삭제하기 (`ALTER TABLE`)
`crew` 테이블로 닉네임을 분리했다면, `attendance`의 `nickname` 컬럼은 더 이상 필요하지 않다.

#### 답
```sql
ALTER TABLE attendance
DROP COLUMN nickname;
```

---

### 문제 3. 외래키 설정하기
이제 `attendance.crew_id`는 반드시 `crew.crew_id`를 참조해야 한다.  
그래야 존재하지 않는 크루의 출석 데이터가 들어가는 문제를 막을 수 있다.

#### 답
```sql
ALTER TABLE attendance
ADD CONSTRAINT fk_attendance_crew
FOREIGN KEY (crew_id) REFERENCES crew(crew_id);
```

---

### 문제 4. 유니크 키 설정
우아한테크코스에서는 닉네임 중복이 허용되지 않는다.  
따라서 `crew.nickname`에는 유니크 제약이 필요하다.

#### 답
```sql
ALTER TABLE crew
ADD CONSTRAINT uq_crew_nickname UNIQUE (nickname);
```

---

## 4. DML(CRUD) 실습

> 아래 예시 답안은 `crew` 테이블이 이미 생성되어 있고, `attendance.nickname`은 제거된 상태를 기준으로 작성했다.
> 또한 `어셔`, `주니`, `아론`은 초기 데이터에 없으므로, 외래키가 있는 구조라면 먼저 `crew` 테이블에 등록되어 있어야 한다.

### 문제 5. 크루 닉네임 검색하기 (`LIKE`)
닉네임 첫 글자가 `디`인 크루를 찾는다.

#### 답
```sql
SELECT
    crew_id,
    nickname
FROM crew
WHERE nickname LIKE '디%';
```

---

### 문제 6. 출석 기록 확인하기 (`SELECT + WHERE`)
3월 6일에 어셔의 출석 기록이 정말 없는지 확인한다.

#### 답
```sql
SELECT
    a.attendance_id,
    a.crew_id,
    c.nickname,
    a.attendance_date,
    a.start_time,
    a.end_time
FROM attendance a
JOIN crew c ON c.crew_id = a.crew_id
WHERE c.nickname = '어셔'
  AND a.attendance_date = '2025-03-06';
```

기록이 조회되지 않으면 누락된 것으로 볼 수 있다.

---

### 문제 7. 누락된 출석 기록 추가 (`INSERT`)
어셔의 3월 6일 출석을 추가한다.

#### 답
먼저 `crew`에 어셔가 없다면 등록한다.

```sql
INSERT INTO crew (crew_id, nickname)
VALUES (13, '어셔');
```

그 다음 출석 기록을 추가한다.

```sql
INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (13, '2025-03-06', '09:31:00', '18:01:00');
```

---

### 문제 8. 잘못된 출석 기록 수정 (`UPDATE`)
주니의 3월 12일 등교 시각을 `10:05`에서 `10:00`으로 수정한다.

#### 답
```sql
UPDATE attendance
SET start_time = '10:00:00'
WHERE crew_id = (
    SELECT crew_id
    FROM crew
    WHERE nickname = '주니'
)
AND attendance_date = '2025-03-12';
```

MySQL 환경에서 서브쿼리 대신 `JOIN`을 선호한다면 다음처럼도 가능하다.

```sql
UPDATE attendance a
JOIN crew c ON c.crew_id = a.crew_id
SET a.start_time = '10:00:00'
WHERE c.nickname = '주니'
  AND a.attendance_date = '2025-03-12';
```

---

### 문제 9. 허위 출석 기록 삭제 (`DELETE`)
아론의 3월 12일 허위 출석 기록을 삭제한다.

#### 답
```sql
DELETE FROM attendance
WHERE crew_id = (
    SELECT crew_id
    FROM crew
    WHERE nickname = '아론'
)
AND attendance_date = '2025-03-12';
```

---

### 문제 10. 출석 정보 조회하기 (`JOIN`)
출석 기록과 함께 닉네임도 한 번에 보고 싶다면 `JOIN`을 사용한다.

#### 답
예를 들어 검프의 전체 출석 기록을 조회하려면:

```sql
SELECT
    a.attendance_id,
    a.attendance_date,
    a.start_time,
    a.end_time,
    c.nickname
FROM attendance a
JOIN crew c ON c.crew_id = a.crew_id
WHERE c.nickname = '검프'
ORDER BY a.attendance_date;
```

---

### 문제 11. `nickname`으로 쿼리 처리하기 (서브쿼리)
닉네임으로 `crew_id`를 먼저 찾은 뒤 출석을 조회할 수 있다.

#### 답
```sql
SELECT
    attendance_id,
    crew_id,
    attendance_date,
    start_time,
    end_time
FROM attendance
WHERE crew_id = (
    SELECT crew_id
    FROM crew
    WHERE nickname = '검프'
)
ORDER BY attendance_date;
```

---

### 문제 12. 가장 늦게 하교한 크루 찾기
2025년 3월 5일에 가장 늦게 하교한 크루의 닉네임과 하교 시각을 찾는다.

#### 답
```sql
SELECT
    c.nickname,
    a.end_time
FROM attendance a
JOIN crew c ON c.crew_id = a.crew_id
WHERE a.attendance_date = '2025-03-05'
  AND a.end_time = (
      SELECT MAX(end_time)
      FROM attendance
      WHERE attendance_date = '2025-03-05'
  );
```

초기 데이터 기준으로는 `네오`, `18:15:00`이 조회된다.

---

## 5. 집계 함수 실습

### 문제 13. 크루별로 기록된 날짜 수 조회
각 크루가 출석 테이블에 몇 개의 날짜 기록을 가지고 있는지 확인한다.

#### 답
```sql
SELECT
    c.nickname,
    COUNT(*) AS recorded_days
FROM attendance a
JOIN crew c ON c.crew_id = a.crew_id
GROUP BY c.crew_id, c.nickname
ORDER BY c.crew_id;
```

---

### 문제 14. 크루별로 등교 기록이 있는 날짜 수 조회
`start_time IS NOT NULL`인 날짜만 센다.

#### 답
```sql
SELECT
    c.nickname,
    COUNT(*) AS started_days
FROM attendance a
JOIN crew c ON c.crew_id = a.crew_id
WHERE a.start_time IS NOT NULL
GROUP BY c.crew_id, c.nickname
ORDER BY c.crew_id;
```

---

### 문제 15. 날짜별로 등교한 크루 수 조회
하루마다 실제 등교 기록이 있는 크루 수를 집계한다.

#### 답
```sql
SELECT
    attendance_date,
    COUNT(*) AS crew_count
FROM attendance
WHERE start_time IS NOT NULL
GROUP BY attendance_date
ORDER BY attendance_date;
```

`crew_id` 중복 가능성을 더 엄격하게 막고 싶다면 `COUNT(DISTINCT crew_id)`를 사용해도 된다.

---

### 문제 16. 크루별 가장 빠른 등교 시각과 가장 늦은 등교 시각
각 크루의 최소 등교 시각과 최대 등교 시각을 구한다.

#### 답
```sql
SELECT
    c.nickname,
    MIN(a.start_time) AS earliest_start_time,
    MAX(a.start_time) AS latest_start_time
FROM attendance a
JOIN crew c ON c.crew_id = a.crew_id
WHERE a.start_time IS NOT NULL
GROUP BY c.crew_id, c.nickname
ORDER BY c.crew_id;
```

