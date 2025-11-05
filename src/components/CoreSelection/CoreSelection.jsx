import { useEffect } from "react";
import { CORES, CORE_TYPES, CORE_GRADES, CORE_OPTIONS, CORE_WILLPOWER } from "../../constants/gameData";
import "./CoreSelection.css";

export function CoreSelection({ coreSelections, onSelectionChange }) {
    const orderCores = CORES.filter((core) => core.type === CORE_TYPES.ORDER);
    const chaosCores = CORES.filter((core) => core.type === CORE_TYPES.CHAOS);

    // 모든 코어에 기본값 설정
    useEffect(() => {
        const needsInitialization = CORES.some((core) => {
            const key = `${core.type}_${core.kind}`;
            return !coreSelections[key];
        });

        if (needsInitialization) {
            const initialSelections = {};
            CORES.forEach((core) => {
                const key = `${core.type}_${core.kind}`;
                if (!coreSelections[key]) {
                    initialSelections[key] = {
                        ...core,
                        selectedGrade: CORE_GRADES.HERO,
                        selectedPriorities: [],
                    };
                }
            });

            if (Object.keys(initialSelections).length > 0) {
                onSelectionChange({
                    ...coreSelections,
                    ...initialSelections,
                });
            }
        }
    }, []);

    const handleGradeSelect = (core, grade) => {
        const key = `${core.type}_${core.kind}`;
        const currentSelection = coreSelections[key];

        // 이미 같은 등급이 선택된 경우 무시
        if (currentSelection?.selectedGrade === grade) return;

        onSelectionChange({
            ...coreSelections,
            [key]: {
                ...core,
                selectedGrade: grade,
                selectedPriorities: [],
            },
        });
    };

    const handlePriorityToggle = (core, point) => {
        const key = `${core.type}_${core.kind}`;
        const currentSelection = coreSelections[key];

        if (!currentSelection || !currentSelection.selectedGrade) return;

        const sameTypeCores = CORES.filter((c) => c.type === core.type);
        const updatedSelections = { ...coreSelections };
        const currentPriority = currentSelection.selectedPriorities?.[0];
        const isSelected = currentPriority && currentPriority.point === point;

        if (isSelected) {
            updatedSelections[key] = {
                ...currentSelection,
                selectedPriorities: [],
            };
        } else {
            const timestamp = Date.now();
            updatedSelections[key] = {
                ...currentSelection,
                selectedPriorities: [{ point, priority: 0, timestamp }],
            };
        }

        // 동일 타입 내 우선순위를 타임스탬프 기준으로 새로 매김
        const selectionsByType = sameTypeCores
            .map((c) => {
                const cKey = `${c.type}_${c.kind}`;
                const sel = updatedSelections[cKey];
                const selected = sel?.selectedPriorities?.[0];
                return selected ? { cKey, selection: sel, priority: selected } : null;
            })
            .filter(Boolean)
            .sort((a, b) => (a.priority.timestamp || 0) - (b.priority.timestamp || 0));

        selectionsByType.forEach((entry, index) => {
            const { cKey, selection, priority } = entry;
            updatedSelections[cKey] = {
                ...selection,
                selectedPriorities: [
                    {
                        ...priority,
                        priority: index + 1,
                    },
                ],
            };
        });

        onSelectionChange(updatedSelections);
    };

    const isPriorityDisabled = (core) => {
        const key = `${core.type}_${core.kind}`;
        const currentSelection = coreSelections[key];
        return !currentSelection || !currentSelection.selectedGrade;
    };

    const getPriorityNumber = (core, point) => {
        const key = `${core.type}_${core.kind}`;
        const currentSelection = coreSelections[key];

        if (!currentSelection) return null;

        const priority = currentSelection.selectedPriorities?.find((p) => p.point === point);
        return priority?.priority || null;
    };

    const renderCoreCard = (core) => {
        const key = `${core.type}_${core.kind}`;
        const selection = coreSelections[key];

        if (!selection) return null;

        const selectedGrade = selection.selectedGrade;
        const availableOptions = CORE_OPTIONS[selectedGrade];
        const willpower = CORE_WILLPOWER[selectedGrade];

        return (
            <div key={key} className={`core-card core-card--${core.type}`}>
                <h3 className="core-card__title">{core.name}</h3>

                <div className="core-card__grades">
                    <div className="core-card__grades-header">
                        <div className="core-card__section-title">등급 선택</div>
                        <div className="core-card__willpower">공급 의지력: {willpower}</div>
                    </div>
                    <div className="core-card__grade-buttons">
                        {Object.values(CORE_GRADES).map((grade) => (
                            <button
                                key={grade}
                                className={`core-card__grade-btn ${selectedGrade === grade ? "core-card__grade-btn--active" : ""}`}
                                onClick={() => handleGradeSelect(core, grade)}
                            >
                                {grade === CORE_GRADES.HERO && "영웅"}
                                {grade === CORE_GRADES.LEGEND && "전설"}
                                {grade === CORE_GRADES.RELIC && "유물"}
                                {grade === CORE_GRADES.ANCIENT && "고대"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="core-card__priorities">
                    <div className="core-card__section-title">활성 옵션 우선순위</div>
                    <div className="core-card__priority-buttons">
                        {availableOptions.map((point) => {
                            const priorityNum = getPriorityNumber(core, point);
                            const isDisabled = isPriorityDisabled(core);

                            return (
                                <button
                                    key={point}
                                    className={`core-card__priority-btn ${priorityNum ? "core-card__priority-btn--selected" : ""}`}
                                    onClick={() => handlePriorityToggle(core, point)}
                                    disabled={isDisabled}
                                >
                                    {point}P{priorityNum && <span className="core-card__priority-badge">{priorityNum}순위</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const handleReset = () => {
        const initialSelections = {};
        CORES.forEach((core) => {
            const key = `${core.type}_${core.kind}`;
            initialSelections[key] = {
                ...core,
                selectedGrade: CORE_GRADES.HERO,
                selectedPriorities: [],
            };
        });
        onSelectionChange(initialSelections);
    };

    return (
        <div className="core-selection">
            <div className="core-selection__header">
                <h2 className="core-selection__title">코어 선택</h2>
                <button className="core-selection__reset-btn" onClick={handleReset}>
                    초기화
                </button>
            </div>

            <div className="core-selection__section">
                <div className="core-selection__grid">{orderCores.map((core) => renderCoreCard(core))}</div>
            </div>

            <div className="core-selection__section">
                <div className="core-selection__grid">{chaosCores.map((core) => renderCoreCard(core))}</div>
            </div>
        </div>
    );
}
