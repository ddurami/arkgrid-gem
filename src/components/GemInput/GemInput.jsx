import { useState, useEffect } from "react";
import {
    GEM_KINDS,
    GEM_NAMES,
    GEM_TYPE_MAP,
    CORE_TYPES,
    GEM_CONSTRAINTS,
    DEALER_OPTIONS,
    SUPPORTER_OPTIONS,
    OPTION_NAMES,
    OPTION_NAMES_SHORT,
} from "../../constants/gameData";
import "./GemInput.css";

export function GemInput({ gems, onGemsChange }) {
    const [gemCounter, setGemCounter] = useState({ order: 1, chaos: 1 });
    const [newGem, setNewGem] = useState({
        type: CORE_TYPES.ORDER,
        willpower: 3, // 기본값 3
        corePoint: 1, // 기본값 1
        // 딜러 옵션
        attackPoint: 0,
        extraDamagePoint: 0,
        bossDamagePoint: 0,
        // 서포터 옵션
        brandPowerPoint: 0,
        allyDamageBoostPoint: 0,
        allyAttackBoostPoint: 0,
    });

    // 프리셋 불러오기나 새로고침시 gemCounter 업데이트
    useEffect(() => {
        if (gems.length > 0) {
            const orderGems = gems.filter((gem) => GEM_TYPE_MAP[gem.kind] === CORE_TYPES.ORDER);
            const chaosGems = gems.filter((gem) => GEM_TYPE_MAP[gem.kind] === CORE_TYPES.CHAOS);

            const maxOrderNumber = orderGems.length > 0 ? Math.max(...orderGems.map((g) => g.gemNumber)) : 0;
            const maxChaosNumber = chaosGems.length > 0 ? Math.max(...chaosGems.map((g) => g.gemNumber)) : 0;

            setGemCounter({
                order: maxOrderNumber + 1,
                chaos: maxChaosNumber + 1,
            });
        }
    }, [gems]);

    // 선택된 옵션 개수 계산
    const selectedOptionsCount = [
        newGem.attackPoint,
        newGem.extraDamagePoint,
        newGem.bossDamagePoint,
        newGem.brandPowerPoint,
        newGem.allyDamageBoostPoint,
        newGem.allyAttackBoostPoint,
    ].filter((point) => point > 0).length;

    const handleAddGem = () => {
        // 옵션 결정 (0이 아닌 값들만)
        const dealerOptions = [
            { type: DEALER_OPTIONS.ATTACK, point: newGem.attackPoint },
            { type: DEALER_OPTIONS.EXTRA_DAMAGE, point: newGem.extraDamagePoint },
            { type: DEALER_OPTIONS.BOSS_DAMAGE, point: newGem.bossDamagePoint },
        ].filter((opt) => opt.point > 0);

        const supporterOptions = [
            { type: SUPPORTER_OPTIONS.BRAND_POWER, point: newGem.brandPowerPoint },
            { type: SUPPORTER_OPTIONS.ALLY_DAMAGE_BOOST, point: newGem.allyDamageBoostPoint },
            { type: SUPPORTER_OPTIONS.ALLY_ATTACK_BOOST, point: newGem.allyAttackBoostPoint },
        ].filter((opt) => opt.point > 0);

        // 우선순위: 딜러 옵션 우선, 그 다음 서포터 옵션
        const allOptions = [...dealerOptions, ...supporterOptions];

        const option1 = allOptions[0] || { type: DEALER_OPTIONS.ATTACK, point: 0 };
        const option2 = allOptions[1] || { type: DEALER_OPTIONS.EXTRA_DAMAGE, point: 0 };

        // 젬 종류 결정
        const kind = newGem.type === CORE_TYPES.ORDER ? GEM_KINDS.ORDER_1 : GEM_KINDS.CHAOS_1;
        const counter = newGem.type === CORE_TYPES.ORDER ? gemCounter.order : gemCounter.chaos;

        const gemWithId = {
            kind,
            gemNumber: counter,
            willpower: newGem.willpower,
            corePoint: newGem.corePoint,
            option1Type: option1.type,
            option1Point: option1.point,
            option2Type: option2.type,
            option2Point: option2.point,
            id: Date.now(),
        };

        onGemsChange([...gems, gemWithId]);

        // 카운터 증가
        if (newGem.type === CORE_TYPES.ORDER) {
            setGemCounter({ ...gemCounter, order: gemCounter.order + 1 });
        } else {
            setGemCounter({ ...gemCounter, chaos: gemCounter.chaos + 1 });
        }

        // 서브 옵션만 초기화 (젬 종류, 의지력, 포인트는 유지)
        setNewGem({
            ...newGem,
            attackPoint: 0,
            extraDamagePoint: 0,
            bossDamagePoint: 0,
            brandPowerPoint: 0,
            allyDamageBoostPoint: 0,
            allyAttackBoostPoint: 0,
        });
    };

    const handleRemoveGem = (id) => {
        onGemsChange(gems.filter((gem) => gem.id !== id));
    };

    const handleClearAll = () => {
        onGemsChange([]);
        setGemCounter({ order: 1, chaos: 1 });
    };

    const orderGems = gems.filter((gem) => GEM_TYPE_MAP[gem.kind] === CORE_TYPES.ORDER);
    const chaosGems = gems.filter((gem) => GEM_TYPE_MAP[gem.kind] === CORE_TYPES.CHAOS);

    const renderGemCards = (gemList) => {
        if (gemList.length === 0) return null;

        return gemList.map((gem) => {
            const gemType = GEM_TYPE_MAP[gem.kind];
            const typeName = gemType === CORE_TYPES.ORDER ? "질서" : "혼돈";

            return (
                <div key={gem.id} className={`gem-compact-card gem-compact-card--${gemType}`}>
                    <div className="gem-compact-card__header">
                        <span className="gem-compact-card__name">
                            {typeName}의 젬 #{gem.gemNumber}
                        </span>
                        <button className="gem-compact-card__remove" onClick={() => handleRemoveGem(gem.id)}>
                            삭제
                        </button>
                    </div>
                    <div className="gem-compact-card__row">
                        <span className="gem-compact-card__stat">의지력 {gem.willpower}</span>
                        <span className="gem-compact-card__stat">포인트 {gem.corePoint}</span>
                    </div>
                    <div className="gem-compact-card__row">
                        <span className="gem-compact-card__stat">
                            {OPTION_NAMES_SHORT[gem.option1Type]} {gem.option1Point}
                        </span>
                        <span className="gem-compact-card__stat">
                            {OPTION_NAMES_SHORT[gem.option2Type]} {gem.option2Point}
                        </span>
                    </div>
                </div>
            );
        });
    };

    return (
        <>
            <div className="gem-input">
                <h2 className="gem-input__title">젬 등록</h2>

                <div className="gem-input__form">
                    <div className="gem-input__form-grid">
                        {/* 첫 줄: 젬 종류, 의지력, 포인트 */}
                        <div className="gem-input__row">
                            <div className="gem-input__field">
                                <label className="gem-input__label">젬 종류</label>
                                <div className="gem-input__button-group">
                                    <button
                                        className={`gem-input__btn gem-input__btn--type gem-input__btn--order ${
                                            newGem.type === CORE_TYPES.ORDER ? "gem-input__btn--active" : ""
                                        }`}
                                        onClick={() => setNewGem({ ...newGem, type: CORE_TYPES.ORDER })}
                                    >
                                        질서
                                    </button>
                                    <button
                                        className={`gem-input__btn gem-input__btn--type gem-input__btn--chaos ${
                                            newGem.type === CORE_TYPES.CHAOS ? "gem-input__btn--active" : ""
                                        }`}
                                        onClick={() => setNewGem({ ...newGem, type: CORE_TYPES.CHAOS })}
                                    >
                                        혼돈
                                    </button>
                                </div>
                            </div>
                            <div className="gem-input__field">
                                <label className="gem-input__label">의지력</label>
                                <div className="gem-input__button-group">
                                    {Array.from({ length: 7 }, (_, i) => 3 + i).map((value) => (
                                        <button
                                            key={value}
                                            className={`gem-input__btn ${newGem.willpower === value ? "gem-input__btn--active" : ""}`}
                                            onClick={() => setNewGem({ ...newGem, willpower: value })}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="gem-input__field">
                                <label className="gem-input__label">포인트</label>
                                <div className="gem-input__button-group">
                                    {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                                        <button
                                            key={value}
                                            className={`gem-input__btn ${newGem.corePoint === value ? "gem-input__btn--active" : ""}`}
                                            onClick={() => setNewGem({ ...newGem, corePoint: value })}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 둘째 줄: 딜러 옵션 */}
                        <div className="gem-input__row">
                            <div className="gem-input__field">
                                <label className="gem-input__label">{OPTION_NAMES[DEALER_OPTIONS.ATTACK]}</label>
                                <div className="gem-input__button-group">
                                    {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                                        <button
                                            key={value}
                                            className={`gem-input__btn ${newGem.attackPoint === value ? "gem-input__btn--active" : ""}`}
                                            onClick={() => {
                                                if (newGem.attackPoint === value) {
                                                    setNewGem({ ...newGem, attackPoint: 0 });
                                                } else {
                                                    setNewGem({ ...newGem, attackPoint: value });
                                                }
                                            }}
                                            disabled={selectedOptionsCount >= 2 && newGem.attackPoint === 0}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="gem-input__field">
                                <label className="gem-input__label">{OPTION_NAMES[DEALER_OPTIONS.EXTRA_DAMAGE]}</label>
                                <div className="gem-input__button-group">
                                    {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                                        <button
                                            key={value}
                                            className={`gem-input__btn ${newGem.extraDamagePoint === value ? "gem-input__btn--active" : ""}`}
                                            onClick={() => {
                                                if (newGem.extraDamagePoint === value) {
                                                    setNewGem({ ...newGem, extraDamagePoint: 0 });
                                                } else {
                                                    setNewGem({ ...newGem, extraDamagePoint: value });
                                                }
                                            }}
                                            disabled={selectedOptionsCount >= 2 && newGem.extraDamagePoint === 0}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="gem-input__field">
                                <label className="gem-input__label">{OPTION_NAMES[DEALER_OPTIONS.BOSS_DAMAGE]}</label>
                                <div className="gem-input__button-group">
                                    {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                                        <button
                                            key={value}
                                            className={`gem-input__btn ${newGem.bossDamagePoint === value ? "gem-input__btn--active" : ""}`}
                                            onClick={() => {
                                                if (newGem.bossDamagePoint === value) {
                                                    setNewGem({ ...newGem, bossDamagePoint: 0 });
                                                } else {
                                                    setNewGem({ ...newGem, bossDamagePoint: value });
                                                }
                                            }}
                                            disabled={selectedOptionsCount >= 2 && newGem.bossDamagePoint === 0}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 셋째 줄: 서포터 옵션 */}
                        <div className="gem-input__row">
                            <div className="gem-input__field">
                                <label className="gem-input__label">{OPTION_NAMES[SUPPORTER_OPTIONS.BRAND_POWER]}</label>
                                <div className="gem-input__button-group">
                                    {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                                        <button
                                            key={value}
                                            className={`gem-input__btn ${newGem.brandPowerPoint === value ? "gem-input__btn--active" : ""}`}
                                            onClick={() => {
                                                if (newGem.brandPowerPoint === value) {
                                                    setNewGem({ ...newGem, brandPowerPoint: 0 });
                                                } else {
                                                    setNewGem({ ...newGem, brandPowerPoint: value });
                                                }
                                            }}
                                            disabled={selectedOptionsCount >= 2 && newGem.brandPowerPoint === 0}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="gem-input__field">
                                <label className="gem-input__label">{OPTION_NAMES[SUPPORTER_OPTIONS.ALLY_DAMAGE_BOOST]}</label>
                                <div className="gem-input__button-group">
                                    {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                                        <button
                                            key={value}
                                            className={`gem-input__btn ${newGem.allyDamageBoostPoint === value ? "gem-input__btn--active" : ""}`}
                                            onClick={() => {
                                                if (newGem.allyDamageBoostPoint === value) {
                                                    setNewGem({ ...newGem, allyDamageBoostPoint: 0 });
                                                } else {
                                                    setNewGem({ ...newGem, allyDamageBoostPoint: value });
                                                }
                                            }}
                                            disabled={selectedOptionsCount >= 2 && newGem.allyDamageBoostPoint === 0}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="gem-input__field">
                                <label className="gem-input__label">{OPTION_NAMES[SUPPORTER_OPTIONS.ALLY_ATTACK_BOOST]}</label>
                                <div className="gem-input__button-group">
                                    {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                                        <button
                                            key={value}
                                            className={`gem-input__btn ${newGem.allyAttackBoostPoint === value ? "gem-input__btn--active" : ""}`}
                                            onClick={() => {
                                                if (newGem.allyAttackBoostPoint === value) {
                                                    setNewGem({ ...newGem, allyAttackBoostPoint: 0 });
                                                } else {
                                                    setNewGem({ ...newGem, allyAttackBoostPoint: value });
                                                }
                                            }}
                                            disabled={selectedOptionsCount >= 2 && newGem.allyAttackBoostPoint === 0}
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="gem-input__add-btn" onClick={handleAddGem}>
                        젬 추가
                    </button>
                </div>
            </div>

            {gems.length > 0 && (
                <div className="gem-list">
                    <div className="gem-list__header">
                        <h2 className="gem-list__title">보유 젬 목록 ({gems.length}개)</h2>
                        <button className="gem-list__reset-btn" onClick={handleClearAll}>
                            초기화
                        </button>
                    </div>
                    {orderGems.length > 0 && (
                        <>
                            <h3 className="gem-list__subtitle">질서 ({orderGems.length}개)</h3>
                            <div className="gem-compact-grid">{renderGemCards(orderGems)}</div>
                        </>
                    )}
                    {chaosGems.length > 0 && (
                        <>
                            <h3 className="gem-list__subtitle">혼돈 ({chaosGems.length}개)</h3>
                            <div className="gem-compact-grid">{renderGemCards(chaosGems)}</div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
