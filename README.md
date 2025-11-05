# 아크그리드 젬 조합기

이 프로젝트는 아크그리드 젬 조합 최적화 도구입니다. 사용자가 보유한 젬과 우선순위를 입력하면, 역할(딜러/서포터)에 따른 효율 점수를 고려하여 코어별 최적 조합과 추가 가공이 필요한 젬을 계산해 제공합니다.

## 폴더 구조와 역할

```
arkgrid/
├── public/
├── src/
│   ├── components/
│   │   ├── CoreSelection/  # 코어 선택 및 우선순위 UI
│   │   ├── GemInput/       # 젬 데이터 입력 폼
│   │   ├── GemPreset/      # 미리 정의된 젬 세트 관리 UI
│   │   └── ResultDisplay/  # 최적화 결과 카드 뷰
│   ├── constants/          # 상수, 데이터 매핑
│   ├── contexts/           # 전역 컨텍스트 (테마 등)
│   ├── hooks/              # 커스텀 훅
│   ├── styles/             # 전역 및 공용 CSS
│   ├── utils/              # 비즈니스 로직과 도우미 함수
│   ├── App.jsx             # 루트 컴포넌트
│   └── main.jsx            # 앱 진입점
├── index.html              # Vite 진입 HTML
├── package.json            # 의존성 및 스크립트
└── vite.config.js          # Vite 설정
```

### 주요 컴포넌트

-   `CoreSelection`: 코어 등급, 우선순위, 공급 의지력 등을 선택하고 관리합니다. 한 코어당 하나의 우선순위만 활성화되도록 제약을 적용합니다.
-   `GemInput`: 보유 젬 목록을 입력하거나 편집할 수 있는 폼입니다.
-   `GemPreset`: 미리 저장된 젬 조합을 불러오거나 저장합니다.
-   `ResultDisplay`: 최적화 결과를 카드 형태로 노출합니다. 코어별 성공/실패 상태, 사용 젬 목록, 추가 가공이 필요한 젬을 표시합니다.

### 공통 자원

-   `constants/gameData.js`: 코어 종류, 등급별 공급 의지력, 젬 옵션명, 역할별 효율 계산 함수 등을 정의합니다.
-   `hooks/useTheme.js`, `contexts/ThemeContext.jsx`: 다크/라이트 테마 토글을 지원합니다.
-   `styles/variables.css`, `styles/common.css`: 색상, 타이포그래피 등 공용 스타일 토큰을 관리합니다.

## `src/utils/optimizer.js` 상세 설명

이 파일은 젬 최적화 알고리즘 전체를 담당합니다. 주요 단계는 다음과 같습니다.

1. **상수 및 유틸리티 정의**

    - `MIN_WILLPOWER`, `MAX_WILLPOWER_ALLOWED`, `MAX_GEMS_PER_CORE` 등 제약 조건을 선언합니다.
    - `computeDealerScore`, `computeSupporterScore`: 게임 데이터에 정의된 효율 함수를 호출해 젬의 역할별 점수를 계산합니다.
    - `decorateGems`: 모든 젬에 `dealerScore`, `supporterScore` 속성을 붙여 이후 계산을 단순화합니다.

2. **보조 정렬/조합 함수**

    - `sortGemsForSearch`: 역할 점수, 포인트, 의지력을 기준으로 젬을 정렬해 탐색 효율을 높입니다.
    - `generateCombosForCore`: 단일 코어에 대해 가능한 젬 조합을 DFS로 열거합니다. 목표 포인트 이상을 만족하는 조합만 반환하고, 효율 점수 기준으로 정렬합니다.
    - `enumerateSubsetsForPlan`: 특정 코어에 남겨둘 보유 젬 조합을 모두 생성하여 추가 가공 계획을 계산할 때 사용합니다.

3. **추가 가공 계획 계산**

    - `generateTheoreticalOptions`: 의지력 범위 내에서 가공 가능한 이론 젬 후보(포인트 5~3, 의지력 3~9)를 생성합니다.
    - `findCraftPlan`: 가공해야 할 젬 목록을 탐색합니다. 기준은 (1) 가공 개수 최소화, (2) 가장 높은 포인트 값 최소화, (3) 총 포인트 최소화, (4) 총 의지력 최대화 순으로 비교합니다.
    - `aggregateCraftNeeds`: 같은 사양의 젬을 묶어 집계합니다.
    - `computeCraftingPlan`: 남은 보유 젬 부분 집합과 `findCraftPlan`을 조합해 해당 코어의 목표 달성을 위한 최적 조합을 찾습니다. 보유 젬만으로 달성 가능한 경우에는 추가 가공 없이 성공 처리합니다.

4. **전역 최적화**

    - `findBestAssignment`: 모든 코어의 후보 조합 중에서 젬 ID가 겹치지 않는 최적 조합을 백트래킹으로 찾습니다. 역할 점수 합계를 최대화하며, 가지치기를 위해 suffix 최대 점수 추정을 사용합니다.
    - `findBestAssignmentWithDrops`: 전역 최적화가 실패하면 우선순위가 가장 낮은 코어부터 하나씩 제외하면서 다시 시도합니다. 성공하면 유지된 코어 목록과 제외된 코어 목록을 반환합니다.

5. **최종 결과 구성**
    - `solveForType`: 코어 타입(질서/혼돈)별로 위 과정을 실행합니다. 전역 최적화에서 선택된 코어는 성공 결과로 저장하고, 제외된 코어는 `computeCraftingPlan`으로 재평가합니다. 보유 젬만으로 목표를 맞출 수 있으면 성공, 추가 가공이 필요하면 실패로 기록합니다.
    - `optimizeGemCombination`: 외부에서 호출되는 엔트리 포인트입니다. 코어 선택 정보를 타입별로 분리하고, `solveForType` 결과를 합쳐 반환합니다.

함수 간 데이터 흐름은 다음 순서를 따릅니다.

1. 입력받은 모든 젬을 `decorateGems`로 점수를 계산합니다.
2. 코어 타입별로 `generateCombosForCore`를 이용해 각 우선순위의 후보 조합을 만듭니다.
3. `findBestAssignmentWithDrops`가 가능한 모든 코어를 동시에 만족시키려 시도합니다.
4. 성공한 코어는 그대로 결과에 반영하고, 제외된 코어는 남은 젬을 기반으로 `computeCraftingPlan`으로 분석합니다.
5. 최종적으로 각 코어별 성공/실패 상태, 사용 젬, 추가 가공 필요 젬을 `ResultDisplay`가 사용하기 쉬운 형태로 반환합니다.
