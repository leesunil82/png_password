# PNG 비밀번호 삽입 웹 - 구현 계획서

## 프로젝트 개요

PNG 파일을 업로드하면 파일 내부에 비밀번호를 삽입하여 다운로드할 수 있는 웹 애플리케이션.  
다른 프로젝트에서 해당 PNG를 받았을 때, 내부 비밀번호를 확인하여 작업 허용 여부를 결정하는 용도.  
로그인 후에만 기능을 사용할 수 있도록 접근 제한.

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| 번들러 | Vite |
| 프레임워크 | React 18 |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 라우팅 | React Router v6 |
| 테마 | CSS 변수 + localStorage (next-themes 불필요) |
| PNG 조작 | 순수 ArrayBuffer 직접 조작 (외부 라이브러리 없음) |
| 인증 상태 | sessionStorage (서버/DB 없음) |

> Next.js 불필요 — 모든 처리가 브라우저에서 완결되므로 Vite + React로 충분

---

## 확정된 요구사항

| 항목 | 결정 |
|------|------|
| 파일 처리 수 | 1장씩 |
| 기본 테마 | 다크 모드 |
| 테마 전환 | 다크 / 라이트 모드 토글 버튼 제공 |

---

## 인증 정보 (하드코딩)

```
아이디 : fam4
비밀번호 : 6915
```

로그인 검증은 클라이언트에서 단순 문자열 비교.  
성공 시 `sessionStorage`에 `auth=true` 저장 → 업로드 페이지 접근 허용.  
탭/브라우저 닫으면 자동 로그아웃.

---

## PNG에 삽입할 비밀번호

```
s6915113!
```

---

## 핵심 기술: PNG tEXt 청크 삽입 방식

### PNG 파일 구조

```
[PNG 시그니처 8바이트]
[IHDR 청크]         ← 이미지 헤더
[tEXt 청크]         ← 여기에 비밀번호 삽입
[IDAT 청크]         ← 실제 이미지 픽셀 데이터
[IEND 청크]         ← 파일 끝
```

### tEXt 청크 구조

```
[Length 4바이트] + [Type "tEXt" 4바이트] + [keyword\0value] + [CRC 4바이트]

예: "password\0s6915113!"
```

### 결과

- 이미지 외형/화질 **전혀 변경 없음**
- 표준 PNG 규격 준수 → 모든 뷰어에서 정상 표시
- 다른 프로젝트에서 tEXt 청크 파싱으로 비밀번호 추출 및 검증 가능

---

## 다른 프로젝트에서 검증하는 방법 (참고용)

```typescript
function extractPasswordFromPng(buffer: ArrayBuffer): string | null {
  const view = new DataView(buffer);
  let offset = 8;

  while (offset < buffer.byteLength) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      view.getUint8(offset + 4), view.getUint8(offset + 5),
      view.getUint8(offset + 6), view.getUint8(offset + 7)
    );
    if (type === 'tEXt') {
      const data = new TextDecoder().decode(new Uint8Array(buffer, offset + 8, length));
      const [keyword, value] = data.split('\0');
      if (keyword === 'password') return value;
    }
    offset += 12 + length;
  }
  return null;
}

const password = extractPasswordFromPng(pngBuffer);
if (password === 's6915113!') { /* 작업 허용 */ }
else { /* 작업 거부 */ }
```

---

## 페이지 구성

### 1. 로그인 페이지 (`/`)
- 다크/라이트 토글 버튼 (우측 상단)
- 아이디 / 비밀번호 입력 폼
- 로그인 버튼 + 오류 메시지
- 로그인 성공 시 `/upload` 로 이동

### 2. 업로드 페이지 (`/upload`)
- 미인증 접근 시 `/` 로 리다이렉트
- 다크/라이트 토글 버튼 (우측 상단)
- 로그아웃 버튼

**상태 A — 대기 (초기 / 초기화 후)**
- PNG 파일 클릭 업로드 영역

**상태 B — 파일 선택됨**
- 업로드된 이미지 미리보기
- "비밀번호 삽입 후 다운로드" 버튼
- "다른 파일 선택" 버튼 (→ 상태 A로 복귀)

**상태 C — 다운로드 완료**
- 완료 메시지 + 체크 아이콘
- "새 파일 처리하기" 버튼 → 클릭 시 상태 A로 초기화
  - 미리보기 제거
  - 선택된 파일 초기화
  - 업로드 영역 다시 표시

---

## UI 디자인 방향

### 다크 모드 (기본)
```
배경     : #0f172a (slate-900)
카드     : #1e293b (slate-800)
텍스트   : #f1f5f9 (slate-100)
강조색   : #6366f1 (indigo-500)
```

### 라이트 모드
```
배경     : #f8fafc (slate-50)
카드     : #ffffff
텍스트   : #0f172a (slate-900)
강조색   : #6366f1 (indigo-500)
```

### 테마 전환
- `localStorage`에 선택 저장 → 새로고침 후에도 유지
- Tailwind `darkMode: 'class'` + `<html>` 태그 클래스 토글 방식

---

## 파일 구조 (예상)

```
png_password/
├── src/
│   ├── main.tsx                # 앱 진입점
│   ├── App.tsx                 # 라우터 설정
│   ├── pages/
│   │   ├── LoginPage.tsx       # 로그인 페이지
│   │   └── UploadPage.tsx      # 업로드 페이지
│   ├── components/
│   │   ├── ThemeToggle.tsx     # 다크/라이트 토글 버튼
│   │   └── ProtectedRoute.tsx  # 인증 보호 라우트
│   └── lib/
│       ├── auth.ts             # 인증 유틸 (sessionStorage)
│       └── png.ts              # PNG tEXt 청크 삽입 유틸
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── PLAN.md
```

---

## 구현 순서

1. **프로젝트 초기화** — Vite + React + TypeScript + Tailwind CSS 설치
2. **테마 설정** — Tailwind darkMode, ThemeToggle 컴포넌트, localStorage 연동
3. **PNG 유틸 구현** — tEXt 청크 삽입 함수 (`lib/png.ts`)
4. **인증 유틸 구현** — sessionStorage 기반 로그인/로그아웃 (`lib/auth.ts`)
5. **라우팅 설정** — React Router, ProtectedRoute
6. **로그인 페이지 UI**
7. **업로드 페이지 UI** — 파일 선택, 미리보기, 다운로드
8. **전체 흐름 테스트**
