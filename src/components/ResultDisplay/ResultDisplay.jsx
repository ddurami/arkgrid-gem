import { GEM_TYPE_MAP, OPTION_NAMES_SHORT, CORE_TYPES, ROLE_TYPES } from "../../constants/gameData";
import "./ResultDisplay.css";

const decode = (value) => JSON.parse('"' + value + '"');

const TEXT = {
    success: decode("\\uC131\\uACF5"),
    partial: decode("\\uC77C\\uBD80 \\uC131\\uACF5"),
    failed: decode("\\uC2E4\\uD328"),
    hero: decode("\\uC601\\uC6C5"),
    legend: decode("\\uC804\\uC124"),
    relic: decode("\\uC720\\uBB3C"),
    ancient: decode("\\uACE0\\uB300"),
    orderName: decode("\\uC9C8\\uC11C"),
    chaosName: decode("\\uD63C\\uB3C8"),
    gemSuffix: decode("\\uC758 \\uC82C #"),
    willpower: decode("\\uC758\\uC9C0\\uB825 "),
    point: decode("\\uD3EC\\uC778\\uD2B8 "),
    slotAddition: decode("\\uBE48 \\uC2AC\\uB86F \\uCD94\\uAC00"),
    replaceLabel: decode("\\uB300\\uCCB4"),
    requirementCountPrefix: decode("\\uD544\\uC694 \\uAC1C\\uC218 "),
    countSuffix: decode("\\uAC1C"),
    calculating: decode("\\uC870\\uD569\\uC744 \\uACC4\\uC0B0\\uD558\\uACE0 \\uC788\\uC2B5\\uB2C8\\uB2E4..."),
    priorityDefault: decode("\\uC6B0\\uC120\\uC21C\\uC704"),
    prioritySuffix: decode("\\uC21C\\uC704"),
    gradePrefix: decode("\\uB4F1\\uAE09: "),
    supplyPrefix: decode("\\uACF5\\uAE09 \\uC758\\uC9C0\\uB825: "),
    targetPrefix: decode("\\uBAA9\\uD45C "),
    pointSuffix: decode("\\uD3EC\\uC778\\uD2B8"),
    achieved: decode("\\uB2EC\\uC131"),
    currentPrefix: decode("\\uD604\\uC7AC "),
    usedWillpower: decode("\\uC0AC\\uC6A9 \\uC758\\uC9C0\\uB825"),
    currentPoint: decode("\\uD604\\uC7AC \\uD3EC\\uC778\\uD2B8"),
    lackingPoint: decode("\\uBD80\\uC871 \\uD3EC\\uC778\\uD2B8"),
    usedGemsTitle: decode("\\uC0AC\\uC6A9\\uB41C \\uC82C "),
    utilGemsTitle: decode("\\uD65C\\uC6A9\\uD55C \\uC82C "),
    neededGemsTitle: decode("\\uD544\\uC694 \\uC82C "),
    neededGemsEmpty: decode("\\uD544\\uC694 \\uC82C"),
    cannotCalc: decode("\\uCD94\\uAC00\\uB85C \\uAC00\\uACF5\\uD574\\uC57C \\uD560 \\uC82C \\uC815\\uBCF4\\uB97C \\uACC4\\uC0B0\\uD560 \\uC218 \\uC5C6\\uC2B5\\uB2C8\\uB2E4."),
    noAdditional: decode("\\uCD94\\uAC00 \\uAC00\\uACF5 \\uC82C\\uC774 \\uD544\\uC694\\uD558\\uC9C0 \\uC54A\\uC2B5\\uB2C8\\uB2E4."),
    lackingSupply: decode("\\uD604\\uC7AC \\uACF5\\uAE09 \\uC758\\uC9C0\\uB825\\uC73C\\uB85C\\uB294 "),
    lackingSuffix: decode("\\uD3EC\\uC778\\uD2B8\\uAC00 \\uBD80\\uC871\\uD569\\uB2C8\\uB2E4. \\uB354 \\uB0AE\\uC740 \\uC758\\uC9C0\\uB825\\uC758 \\uC82C\\uC774 \\uD544\\uC694\\uD569\\uB2C8\\uB2E4."),
    resultTitle: decode("\\uC870\\uD569 \\uACB0\\uACFC"),
    dealer: decode("\\uB51C\\uB7EC"),
    supporter: decode("\\uC11C\\uD3EC\\uD130"),
    replaceStatsMid: decode(" / "),
    dealerScoreLabel: decode("\\uB51C\\uB7EC \\uD6A8\\uC728 \\uC810\\uC218"),
    supporterScoreLabel: decode("\\uC11C\\uD3EC\\uD130 \\uD6A8\\uC728 \\uC810\\uC218"),
    newGemLabel: decode("\\uC2E0\\uADDC \\uC82C"),
    optionUnknown: decode("\\uC635\\uC158 \\uBBF8\\uC815"),
};

const STATUS_LABELS = {
    success: TEXT.success,
    partial: TEXT.partial,
    failed: TEXT.failed,
};

const GRADE_LABELS = {
    hero: TEXT.hero,
    legend: TEXT.legend,
    relic: TEXT.relic,
    ancient: TEXT.ancient,
};

function formatGemOwner(gem, fallbackType) {
    const type = GEM_TYPE_MAP[gem.kind] || fallbackType;
    return type === CORE_TYPES.ORDER ? TEXT.orderName : TEXT.chaosName;
}

function formatScore(value) {
    if (value === null || value === undefined) {
        return null;
    }
    return Number(value).toFixed(2);
}

function renderGemCard(gem, coreType, role) {
    const typeName = formatGemOwner(gem, coreType);
    const score = role === ROLE_TYPES.DEALER ? gem.dealerScore : gem.supporterScore;
    const formattedScore = formatScore(score);

    if (gem.isTheoretical) {
        const replacementLabel = gem.replaces ? ` (#${gem.replaces.gemNumber} ${TEXT.replaceLabel})` : "";
        return (
            <div key={gem.id} className={"result-gem result-gem--" + coreType}>
                <div className="result-gem__name">{`${typeName} ${TEXT.newGemLabel}${replacementLabel}`}</div>
                <div className="result-gem__stats">
                    <span>{TEXT.willpower + gem.willpower}</span>
                    <span>{TEXT.point + gem.corePoint}</span>
                    <span>{TEXT.optionUnknown}</span>
                    <span>{TEXT.optionUnknown}</span>
                </div>
            </div>
        );
    }

    return (
        <div key={gem.id} className={"result-gem result-gem--" + coreType}>
            <div className="result-gem__name">
                {typeName + TEXT.gemSuffix + gem.gemNumber}
                {formattedScore !== null && <span className="result-gem__replaced-info"> ({formattedScore})</span>}
            </div>
            <div className="result-gem__stats">
                <span>{TEXT.willpower + gem.willpower}</span>
                <span>{TEXT.point + gem.corePoint}</span>
                <span>{(OPTION_NAMES_SHORT[gem.option1Type] || "") + " " + (gem.option1Point ?? "-")}</span>
                <span>{(OPTION_NAMES_SHORT[gem.option2Type] || "") + " " + (gem.option2Point ?? "-")}</span>
            </div>
        </div>
    );
}

function renderRequirementCard(requirement, coreType, index) {
    const statsText =
        " (" +
        TEXT.willpower +
        requirement.willpower +
        TEXT.replaceStatsMid +
        TEXT.point +
        requirement.corePoint +
        ")";

    return (
        <div key={coreType + "-req-" + index} className={"result-gem result-gem--" + coreType}>
            <div className="result-gem__name">
                {TEXT.newGemLabel}
                <span className="result-gem__replaced-info">{statsText}</span>
            </div>
            <div className="result-gem__stats">
                <span>{TEXT.willpower + requirement.willpower}</span>
                <span>{TEXT.point + requirement.corePoint}</span>
            </div>
        </div>
    );
}

export function ResultDisplay({ results, isCalculating, role }) {
    if (isCalculating) {
        return (
            <div className="result-display">
                <div className="result-display__loading">
                    <div className="result-display__spinner"></div>
                    <p>{TEXT.calculating}</p>
                </div>
            </div>
        );
    }

    if (!results || Object.keys(results).length === 0) {
        return null;
    }

    const sortEntriesByPriority = (entries) =>
        entries.sort(([, a], [, b]) => {
            const pa = a?.priorityOrder ?? Number.POSITIVE_INFINITY;
            const pb = b?.priorityOrder ?? Number.POSITIVE_INFINITY;
            if (pa !== pb) return pa - pb;
            const ta = a?.core?.selectedPriorities?.[0]?.timestamp || a?.priorityTimestamp || 0;
            const tb = b?.core?.selectedPriorities?.[0]?.timestamp || b?.priorityTimestamp || 0;
            return ta - tb;
        });

    const orderResults = sortEntriesByPriority(Object.entries(results).filter(([key]) => key.startsWith(CORE_TYPES.ORDER)));
    const chaosResults = sortEntriesByPriority(Object.entries(results).filter(([key]) => key.startsWith(CORE_TYPES.CHAOS)));

    const renderCoreResult = ([coreKey, result]) => {
        if (!result) return null;

        const {
            core,
            status,
            targetPoint,
            priorityOrder,
            maxWillpower,
            usedGems = [],
            achieved = {},
            requirements = { neededGems: [], gap: 0, possible: true },
        } = result;

        const achievedPoint = achieved.totalCorePoint || 0;
        const achievedWillpower = achieved.totalWillpower || 0;
        const requirementList = requirements.neededGems || [];
        const expandedRequirements = requirementList.flatMap((item) => {
            const times = item.count && item.count > 0 ? item.count : 1;
            return Array.from({ length: times }).map(() => ({ willpower: item.willpower, corePoint: item.corePoint }));
        });
        const requirementCount = expandedRequirements.length;
        const gradeLabel = GRADE_LABELS[core.selectedGrade] || core.selectedGrade;
        const priorityLabel = priorityOrder ? priorityOrder + TEXT.prioritySuffix : TEXT.priorityDefault;
        const statusLabel = STATUS_LABELS[status] || status;
        const gap = requirements.gap || 0;
        const efficiencyScore = achieved.efficiency !== undefined && achieved.efficiency !== null ? Number(achieved.efficiency) : null;
        const scoreLabel = role === ROLE_TYPES.DEALER ? TEXT.dealerScoreLabel : TEXT.supporterScoreLabel;
        const scoreDisplay = efficiencyScore === null ? "-" : efficiencyScore.toFixed(2);
        const priorityText = `${priorityLabel} ${targetPoint}${TEXT.pointSuffix}`;

        return (
            <div key={coreKey} className={"result-card result-card--" + status}>
                <div className="result-card__header">
                    <h3 className={"result-card__title result-card__title--" + core.type}>{core.name}</h3>
                    <div className={"result-card__status result-card__status--" + status}>{statusLabel}</div>
                </div>

                <div className="result-card__grade-row">
                    <div className="result-card__grade">{TEXT.gradePrefix + gradeLabel}</div>
                    <div className="result-card__willpower">{TEXT.supplyPrefix + maxWillpower}</div>
                </div>

                <div className="result-card__priorities">
                    <div className={"result-card__priority " + (status === "success" ? "result-card__priority--success" : "result-card__priority--failed")}>
                        <span className="result-card__priority-point">{priorityText}</span>
                        <span className={"result-card__priority-status " + (status === "success" ? "result-card__priority-status--success" : "result-card__priority-status--failed")}>{statusLabel}</span>
                    </div>
                </div>

                <div className="result-card__stats">
                    <div className="result-card__stat">
                        <span>{TEXT.usedWillpower}</span>
                        <span className="result-card__stat-value">{achievedWillpower + " / " + maxWillpower}</span>
                    </div>
                    <div className="result-card__stat">
                        <span>{TEXT.currentPoint}</span>
                        <span className="result-card__stat-value">{achievedPoint}</span>
                    </div>
                    <div className="result-card__stat">
                        <span>{scoreLabel}</span>
                        <span className="result-card__stat-value">{scoreDisplay}</span>
                    </div>
                    {gap > 0 && (
                        <div className="result-card__stat">
                            <span>{TEXT.lackingPoint}</span>
                            <span className="result-card__stat-value">{gap}</span>
                        </div>
                    )}
                </div>

                {usedGems.length > 0 && (
                    <div className="result-card__combination">
                        <h4 className="result-card__section-title">
                            {status === "success"
                                ? TEXT.usedGemsTitle + "(" + usedGems.length + TEXT.countSuffix + ")"
                                : TEXT.utilGemsTitle + "(" + usedGems.length + TEXT.countSuffix + ")"}
                        </h4>
                        <div className="result-card__gems">{usedGems.map((gem) => renderGemCard(gem, core.type, role))}</div>
                    </div>
                )}

                {status !== "success" && (
                    <div className="result-card__requirements">
                        <h4 className="result-card__section-title">
                            {expandedRequirements.length > 0
                                ? TEXT.neededGemsTitle + "(" + requirementCount + TEXT.countSuffix + ")"
                                : TEXT.neededGemsEmpty}
                        </h4>
                        {expandedRequirements.length > 0 ? (
                            <div className="result-card__gems">
                                {expandedRequirements.map((req, index) => renderRequirementCard(req, core.type, index))}
                            </div>
                        ) : (
                            <div className="result-card__requirement-info">
                                <p>{requirements.possible ? TEXT.noAdditional : TEXT.cannotCalc}</p>
                            </div>
                        )}
                        {!requirements.possible && gap > 0 && (
                            <div className="result-card__requirement-info">
                                <p>{TEXT.lackingSupply + gap + TEXT.lackingSuffix}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="result-display">
            <div className="result-display__header">
                <h2 className="result-display__title">{TEXT.resultTitle}</h2>
                {role && <div className="result-display__role-badge">{role === ROLE_TYPES.DEALER ? TEXT.dealer : TEXT.supporter}</div>}
            </div>

            {orderResults.length > 0 && (
                <div className="result-display__section">
                    <div className="result-display__grid">{orderResults.map(renderCoreResult)}</div>
                </div>
            )}

            {chaosResults.length > 0 && (
                <div className="result-display__section">
                    <div className="result-display__grid">{chaosResults.map(renderCoreResult)}</div>
                </div>
            )}
        </div>
    );
}