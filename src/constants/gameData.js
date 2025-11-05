// 코어 타입
export const CORE_TYPES = {
  ORDER: 'order',
  CHAOS: 'chaos',
};

// 코어 종류
export const CORE_KINDS = {
  SUN: 'sun',
  MOON: 'moon',
  STAR: 'star',
};

// 코어 등급
export const CORE_GRADES = {
  HERO: 'hero',
  LEGEND: 'legend',
  RELIC: 'relic',
  ANCIENT: 'ancient',
};

// 코어 등급별 공급 의지력
export const CORE_WILLPOWER = {
  [CORE_GRADES.HERO]: 9,
  [CORE_GRADES.LEGEND]: 12,
  [CORE_GRADES.RELIC]: 15,
  [CORE_GRADES.ANCIENT]: 17,
};

// 코어 등급별 사용 가능한 옵션 포인트
export const CORE_OPTIONS = {
  [CORE_GRADES.HERO]: [10],
  [CORE_GRADES.LEGEND]: [10, 14],
  [CORE_GRADES.RELIC]: [10, 14, 17, 18, 19, 20],
  [CORE_GRADES.ANCIENT]: [10, 14, 17, 18, 19, 20],
};

// 코어 목록
export const CORES = [
  { type: CORE_TYPES.ORDER, kind: CORE_KINDS.SUN, name: '질서의 해' },
  { type: CORE_TYPES.ORDER, kind: CORE_KINDS.MOON, name: '질서의 달' },
  { type: CORE_TYPES.ORDER, kind: CORE_KINDS.STAR, name: '질서의 별' },
  { type: CORE_TYPES.CHAOS, kind: CORE_KINDS.SUN, name: '혼돈의 해' },
  { type: CORE_TYPES.CHAOS, kind: CORE_KINDS.MOON, name: '혼돈의 달' },
  { type: CORE_TYPES.CHAOS, kind: CORE_KINDS.STAR, name: '혼돈의 별' },
];

// 젬 종류
export const GEM_KINDS = {
  ORDER_1: 'order_1',
  ORDER_2: 'order_2',
  ORDER_3: 'order_3',
  CHAOS_1: 'chaos_1',
  CHAOS_2: 'chaos_2',
  CHAOS_3: 'chaos_3',
};

// 젬 이름
export const GEM_NAMES = {
  [GEM_KINDS.ORDER_1]: '질서의 젬 1',
  [GEM_KINDS.ORDER_2]: '질서의 젬 2',
  [GEM_KINDS.ORDER_3]: '질서의 젬 3',
  [GEM_KINDS.CHAOS_1]: '혼돈의 젬 1',
  [GEM_KINDS.CHAOS_2]: '혼돈의 젬 2',
  [GEM_KINDS.CHAOS_3]: '혼돈의 젬 3',
};

// 젬 타입별 매핑
export const GEM_TYPE_MAP = {
  [GEM_KINDS.ORDER_1]: CORE_TYPES.ORDER,
  [GEM_KINDS.ORDER_2]: CORE_TYPES.ORDER,
  [GEM_KINDS.ORDER_3]: CORE_TYPES.ORDER,
  [GEM_KINDS.CHAOS_1]: CORE_TYPES.CHAOS,
  [GEM_KINDS.CHAOS_2]: CORE_TYPES.CHAOS,
  [GEM_KINDS.CHAOS_3]: CORE_TYPES.CHAOS,
};

// 역할 타입
export const ROLE_TYPES = {
  DEALER: 'dealer',
  SUPPORTER: 'supporter',
};

// 딜러 옵션 종류
export const DEALER_OPTIONS = {
  ATTACK: 'attack',
  EXTRA_DAMAGE: 'extra_damage',
  BOSS_DAMAGE: 'boss_damage',
};

// 서포터 옵션 종류
export const SUPPORTER_OPTIONS = {
  BRAND_POWER: 'brand_power',
  ALLY_DAMAGE_BOOST: 'ally_damage_boost',
  ALLY_ATTACK_BOOST: 'ally_attack_boost',
};

// 옵션 이름 (전체 명칭)
export const OPTION_NAMES = {
  [DEALER_OPTIONS.ATTACK]: '공격력',
  [DEALER_OPTIONS.EXTRA_DAMAGE]: '추가 피해',
  [DEALER_OPTIONS.BOSS_DAMAGE]: '보스 피해',
  [SUPPORTER_OPTIONS.BRAND_POWER]: '낙인력',
  [SUPPORTER_OPTIONS.ALLY_DAMAGE_BOOST]: '아군 피해 강화',
  [SUPPORTER_OPTIONS.ALLY_ATTACK_BOOST]: '아군 공격 강화',
};

// 옵션 이름 (줄임말 - 젬 카드 표시용)
export const OPTION_NAMES_SHORT = {
  [DEALER_OPTIONS.ATTACK]: '공격력',
  [DEALER_OPTIONS.EXTRA_DAMAGE]: '추피',
  [DEALER_OPTIONS.BOSS_DAMAGE]: '보피',
  [SUPPORTER_OPTIONS.BRAND_POWER]: '낙인력',
  [SUPPORTER_OPTIONS.ALLY_DAMAGE_BOOST]: '아피강',
  [SUPPORTER_OPTIONS.ALLY_ATTACK_BOOST]: '아공강',
};

// 딜러 옵션별 효율 계산 (N은 포인트)
export const DEALER_EFFICIENCY = {
  [DEALER_OPTIONS.ATTACK]: (n) => n * 3.667,
  [DEALER_OPTIONS.EXTRA_DAMAGE]: (n) => n * 8.0834,
  [DEALER_OPTIONS.BOSS_DAMAGE]: (n) => n * 8.3334,
};

// 서포터 옵션별 효율 계산 (N은 포인트)
export const SUPPORTER_EFFICIENCY = {
  [SUPPORTER_OPTIONS.ALLY_ATTACK_BOOST]: (n) => n * 2.33157311,
  [SUPPORTER_OPTIONS.BRAND_POWER]: (n) => n * 2.27687500,
  [SUPPORTER_OPTIONS.ALLY_DAMAGE_BOOST]: (n) => n * 2.20059198,
};

// 젬 최소/최대 값
export const GEM_CONSTRAINTS = {
  MIN_WILLPOWER: 3, // 가공 후 최소 의지력 (기본값 10에서 -1레벨 = 9, -5가공 = 4, 하지만 최저 3)
  MAX_WILLPOWER: 9, // 최대 의지력 (기본값 10 - 1레벨)
  MIN_CORE_POINT: 1, // 최소 1레벨부터 시작
  MAX_CORE_POINT: 5, // 최대 가공
  MIN_OPTION_POINT: 0, // 미가공 상태
  MAX_OPTION_POINT: 5, // 최대 가공
};

// 코어당 최대 젬 장착 개수
export const MAX_GEMS_PER_CORE = 4;

