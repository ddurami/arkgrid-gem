import { CORE_TYPES, CORE_WILLPOWER, GEM_TYPE_MAP, MAX_GEMS_PER_CORE, DEALER_EFFICIENCY, SUPPORTER_EFFICIENCY, ROLE_TYPES } from "../constants/gameData";

const MIN_WILLPOWER = 3;
const MAX_WILLPOWER_ALLOWED = 9;
const DEFAULT_COMBO_LIMIT = 120;

const sumCore = (gems = []) => gems.reduce((total, gem) => total + gem.corePoint, 0);
const sumWill = (gems = []) => gems.reduce((total, gem) => total + gem.willpower, 0);

function computeDealerScore(gem) {
    const first = DEALER_EFFICIENCY[gem.option1Type]?.(gem.option1Point || 0) || 0;
    const second = DEALER_EFFICIENCY[gem.option2Type]?.(gem.option2Point || 0) || 0;
    return first + second;
}

function computeSupporterScore(gem) {
    const first = SUPPORTER_EFFICIENCY[gem.option1Type]?.(gem.option1Point || 0) || 0;
    const second = SUPPORTER_EFFICIENCY[gem.option2Type]?.(gem.option2Point || 0) || 0;
    return first + second;
}

function decorateGems(gems) {
    return gems.map((gem) => ({
        ...gem,
        dealerScore: computeDealerScore(gem),
        supporterScore: computeSupporterScore(gem),
    }));
}

function getGemScore(gem, role) {
    return role === ROLE_TYPES.DEALER ? gem.dealerScore : gem.supporterScore;
}

function sortGemsForSearch(gems, role) {
    return [...gems].sort((a, b) => {
        const scoreDiff = (getGemScore(b, role) || 0) - (getGemScore(a, role) || 0);
        if (scoreDiff !== 0) return scoreDiff;
        if (b.corePoint !== a.corePoint) return b.corePoint - a.corePoint;
        if (a.willpower !== b.willpower) return a.willpower - b.willpower;
        return (a.gemNumber || 0) - (b.gemNumber || 0);
    });
}

function generateCombosForCore(gems, maxWillpower, targetPoint, role, limit = DEFAULT_COMBO_LIMIT) {
    const sorted = sortGemsForSearch(gems, role);
    const selection = [];
    const combos = [];

    function dfs(startIndex, totalWill, totalPoint, totalScore) {
        if (totalWill > maxWillpower || selection.length > MAX_GEMS_PER_CORE) {
            return;
        }

        if (selection.length > 0 && totalPoint >= targetPoint) {
            combos.push({
                gems: [...selection],
                totalWillpower: totalWill,
                totalCorePoint: totalPoint,
                score: totalScore,
            });
            // 계속 탐색하여 더 효율 높은 조합을 찾는다.
        }

        for (let i = startIndex; i < sorted.length; i += 1) {
            const gem = sorted[i];
            const nextWill = totalWill + gem.willpower;
            if (nextWill > maxWillpower) continue;

            selection.push(gem);
            dfs(i + 1, nextWill, totalPoint + gem.corePoint, totalScore + (getGemScore(gem, role) || 0));
            selection.pop();
        }
    }

    dfs(0, 0, 0, 0);

    combos.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.totalCorePoint !== a.totalCorePoint) return b.totalCorePoint - a.totalCorePoint;
        if (a.totalWillpower !== b.totalWillpower) return a.totalWillpower - b.totalWillpower;
        return a.gems.length - b.gems.length;
    });

    if (combos.length > limit) {
        return combos.slice(0, limit);
    }
    return combos;
}

function enumerateSubsetsForPlan(gems, maxWillpower, role) {
    const sorted = sortGemsForSearch(gems, role);
    const combinations = [
        {
            gems: [],
            totalWillpower: 0,
            totalCorePoint: 0,
            totalScore: 0,
        },
    ];

    const selection = [];

    function dfs(startIndex, totalWill, totalPoint, totalScore) {
        for (let i = startIndex; i < sorted.length; i += 1) {
            const gem = sorted[i];
            const nextWill = totalWill + gem.willpower;
            if (nextWill > maxWillpower) continue;

            selection.push(gem);

            const nextCombo = {
                gems: [...selection],
                totalWillpower: nextWill,
                totalCorePoint: totalPoint + gem.corePoint,
                totalScore: totalScore + (getGemScore(gem, role) || 0),
            };

            combinations.push(nextCombo);

            if (selection.length < MAX_GEMS_PER_CORE) {
                dfs(i + 1, nextCombo.totalWillpower, nextCombo.totalCorePoint, nextCombo.totalScore);
            }

            selection.pop();
        }
    }

    dfs(0, 0, 0, 0);
    return combinations;
}

function generateTheoreticalOptions(maxWillpowerAvailable) {
    const options = [];
    const maxWill = Math.min(MAX_WILLPOWER_ALLOWED, maxWillpowerAvailable);
    for (let corePoint = 5; corePoint >= 3; corePoint -= 1) {
        for (let willpower = MIN_WILLPOWER; willpower <= maxWill; willpower += 1) {
            options.push({ corePoint, willpower });
        }
    }
    options.sort((a, b) => {
        const efficiencyA = a.corePoint / a.willpower;
        const efficiencyB = b.corePoint / b.willpower;
        if (efficiencyA !== efficiencyB) return efficiencyB - efficiencyA;
        if (a.corePoint !== b.corePoint) return b.corePoint - a.corePoint;
        return a.willpower - b.willpower;
    });
    return options;
}

function findCraftPlan(gap, slots, availableWill) {
    if (gap <= 0) {
        return {
            gems: [],
            totalCorePoint: 0,
            totalWillpower: 0,
        };
    }

    if (slots <= 0 || availableWill < MIN_WILLPOWER) {
        return null;
    }

    const options = generateTheoreticalOptions(availableWill);
    if (options.length === 0) return null;

    let best = null;
    const selected = [];

    const evaluate = (totalPoint, totalWill) => {
        const candidate = {
            gems: [...selected],
            totalCorePoint: totalPoint,
            totalWillpower: totalWill,
            maxCorePoint: selected.reduce((max, gem) => Math.max(max, gem.corePoint), 0),
        };

        if (!best) {
            best = candidate;
            return;
        }

        if (selected.length < best.gems.length) {
            best = candidate;
            return;
        }

        if (selected.length > best.gems.length) {
            return;
        }

        if (candidate.maxCorePoint !== best.maxCorePoint) {
            if (candidate.maxCorePoint < best.maxCorePoint) {
                best = candidate;
            }
            return;
        }

        if (totalPoint !== best.totalCorePoint) {
            if (totalPoint < best.totalCorePoint) {
                best = candidate;
            }
            return;
        }

        if (totalWill > best.totalWillpower) {
            best = candidate;
        }
    };

    const dfs = (startIndex, totalPoint, totalWill) => {
        if (totalWill > availableWill || selected.length > slots) {
            return;
        }

        if (totalPoint >= gap) {
            evaluate(totalPoint, totalWill);
            if (selected.length === 0) {
                return;
            }
        }

        if (selected.length === slots) {
            return;
        }

        for (let i = startIndex; i < options.length; i += 1) {
            const option = options[i];
            selected.push(option);
            dfs(i, totalPoint + option.corePoint, totalWill + option.willpower);
            selected.pop();
        }
    };

    dfs(0, 0, 0);

    return best;
}

function aggregateCraftNeeds(gems) {
    const map = new Map();
    gems.forEach((gem) => {
        const key = `${gem.willpower}-${gem.corePoint}`;
        const current = map.get(key) || { willpower: gem.willpower, corePoint: gem.corePoint, count: 0 };
        current.count += 1;
        map.set(key, current);
    });

    return Array.from(map.values()).sort((a, b) => {
        if (b.corePoint !== a.corePoint) return b.corePoint - a.corePoint;
        if (a.willpower !== b.willpower) return a.willpower - b.willpower;
        return b.count - a.count;
    });
}

function chooseBetterPlan(candidate, current) {
    if (!current) return candidate;

    if (candidate.newGemCount !== current.newGemCount) {
        return candidate.newGemCount < current.newGemCount ? candidate : current;
    }

    if (candidate.existingGems.length !== current.existingGems.length) {
        return candidate.existingGems.length > current.existingGems.length ? candidate : current;
    }

    if ((candidate.efficiency || 0) !== (current.efficiency || 0)) {
        return (candidate.efficiency || 0) > (current.efficiency || 0) ? candidate : current;
    }

    if (candidate.totalCorePoint !== current.totalCorePoint) {
        return candidate.totalCorePoint > current.totalCorePoint ? candidate : current;
    }

    if (candidate.totalWillpower !== current.totalWillpower) {
        return candidate.totalWillpower < current.totalWillpower ? candidate : current;
    }

    return current;
}

function computeCraftingPlan(request, availableGems, role) {
    const targetPoint = request.targetPoint;
    const maxWillpower = request.maxWillpower;
    const subsets = enumerateSubsetsForPlan(availableGems, maxWillpower, role);

    let bestPlan = null;
    let bestPartial = null;

    subsets.forEach((subset) => {
        const slotsLeft = MAX_GEMS_PER_CORE - subset.gems.length;
        if (slotsLeft < 0) return;

        const remainingWill = maxWillpower - subset.totalWillpower;
        if (remainingWill < 0) return;

        const gap = targetPoint - subset.totalCorePoint;

        if (gap <= 0) {
            const candidate = {
                possible: true,
                existingGems: subset.gems,
                craft: { gems: [], totalCorePoint: 0, totalWillpower: 0 },
                totalCorePoint: subset.totalCorePoint,
                totalWillpower: subset.totalWillpower,
                efficiency: subset.totalScore,
                newGemCount: 0,
            };
            bestPlan = chooseBetterPlan(candidate, bestPlan);
        } else if (slotsLeft > 0 && remainingWill >= MIN_WILLPOWER) {
            const craft = findCraftPlan(gap, slotsLeft, remainingWill);
            if (craft) {
                const totalCorePoint = subset.totalCorePoint + craft.totalCorePoint;
                const totalWillpower = subset.totalWillpower + craft.totalWillpower;
                if (totalCorePoint >= targetPoint && totalWillpower <= maxWillpower) {
                    const candidate = {
                        possible: true,
                        existingGems: subset.gems,
                        craft,
                        totalCorePoint,
                        totalWillpower,
                        efficiency: subset.totalScore,
                        newGemCount: craft.gems.length,
                    };
                    bestPlan = chooseBetterPlan(candidate, bestPlan);
                }
            }
        }

        if (!bestPartial) {
            bestPartial = {
                existingGems: subset.gems,
                totalCorePoint: subset.totalCorePoint,
                totalWillpower: subset.totalWillpower,
                efficiency: subset.totalScore,
            };
        } else if (subset.totalCorePoint > bestPartial.totalCorePoint) {
            bestPartial = {
                existingGems: subset.gems,
                totalCorePoint: subset.totalCorePoint,
                totalWillpower: subset.totalWillpower,
                efficiency: subset.totalScore,
            };
        } else if (subset.totalCorePoint === bestPartial.totalCorePoint && subset.totalScore > (bestPartial.efficiency || 0)) {
            bestPartial = {
                existingGems: subset.gems,
                totalCorePoint: subset.totalCorePoint,
                totalWillpower: subset.totalWillpower,
                efficiency: subset.totalScore,
            };
        }
    });

    if (bestPlan) {
        return {
            possible: true,
            existingGems: bestPlan.existingGems,
            craftNeeds: aggregateCraftNeeds(bestPlan.craft.gems),
            totalCorePoint: bestPlan.totalCorePoint,
            totalWillpower: bestPlan.totalWillpower,
            efficiency: bestPlan.efficiency || 0,
            gap: Math.max(0, targetPoint - bestPlan.totalCorePoint),
        };
    }

    const fallback = bestPartial || { existingGems: [], totalCorePoint: 0, totalWillpower: 0, efficiency: 0 };

    return {
        possible: false,
        existingGems: fallback.existingGems,
        craftNeeds: [],
        totalCorePoint: fallback.totalCorePoint,
        totalWillpower: fallback.totalWillpower,
        efficiency: fallback.efficiency || 0,
        gap: Math.max(0, targetPoint - fallback.totalCorePoint),
    };
}

function findBestAssignment(coreKeys, combosMap) {
    if (coreKeys.length === 0) {
        return { score: 0, assignment: {} };
    }

    for (const key of coreKeys) {
        const list = combosMap[key];
        if (!list || list.length === 0) {
            return null;
        }
    }

    const orderedKeys = [...coreKeys].sort((a, b) => combosMap[a].length - combosMap[b].length);
    const suffixMaxScore = new Array(orderedKeys.length).fill(0);

    for (let i = orderedKeys.length - 1; i >= 0; i -= 1) {
        const combos = combosMap[orderedKeys[i]];
        const bestScore = combos.length > 0 ? combos[0].score : 0;
        suffixMaxScore[i] = bestScore + (i + 1 < orderedKeys.length ? suffixMaxScore[i + 1] : 0);
    }

    const usedGemIds = new Set();
    const currentAssignment = {};
    let best = null;

    const dfs = (index, totalScore) => {
        if (index === orderedKeys.length) {
            if (!best || totalScore > best.score) {
                best = {
                    score: totalScore,
                    assignment: { ...currentAssignment },
                };
            }
            return;
        }

        const potentialMax = totalScore + suffixMaxScore[index];
        if (best && potentialMax <= best.score) {
            return;
        }

        const key = orderedKeys[index];
        const combos = combosMap[key];

        for (const combo of combos) {
            let conflict = false;
            for (const gem of combo.gems) {
                if (usedGemIds.has(gem.id)) {
                    conflict = true;
                    break;
                }
            }
            if (conflict) continue;

            combo.gems.forEach((gem) => usedGemIds.add(gem.id));
            currentAssignment[key] = combo;
            dfs(index + 1, totalScore + combo.score);
            delete currentAssignment[key];
            combo.gems.forEach((gem) => usedGemIds.delete(gem.id));
        }
    };

    dfs(0, 0);

    return best;
}

function sortDropOrder(requests) {
    return [...requests].sort((a, b) => {
        const priorityA = a.priorityOrder ?? Number.POSITIVE_INFINITY;
        const priorityB = b.priorityOrder ?? Number.POSITIVE_INFINITY;
        if (priorityA !== priorityB) {
            return priorityB - priorityA; // 높은 숫자(낮은 우선순위)부터 제거
        }
        return (a.timestamp || 0) - (b.timestamp || 0);
    });
}

function findBestAssignmentWithDrops(requests, combosMap) {
    const allKeys = requests.map((req) => req.key);
    const initial = findBestAssignment(allKeys, combosMap);
    if (initial) {
        return {
            assignment: initial.assignment,
            keptKeys: allKeys,
            droppedKeys: [],
        };
    }

    const dropOrder = sortDropOrder(requests).map((req) => req.key);

    for (let removeCount = 1; removeCount <= dropOrder.length; removeCount += 1) {
        const dropSet = new Set(dropOrder.slice(0, removeCount));
        const keptKeys = allKeys.filter((key) => !dropSet.has(key));
        if (keptKeys.length === 0) {
            continue;
        }
        const attempt = findBestAssignment(keptKeys, combosMap);
        if (attempt) {
            return {
                assignment: attempt.assignment,
                keptKeys,
                droppedKeys: dropOrder.slice(0, removeCount),
            };
        }
    }

    return {
        assignment: null,
        keptKeys: [],
        droppedKeys: allKeys,
    };
}

function solveForType(requests, gems, role) {
    if (!requests || requests.length === 0) {
        return {};
    }

    const requestMap = {};
    const combosByKey = {};

    requests.forEach((request) => {
        const maxWillpower = CORE_WILLPOWER[request.core.selectedGrade] ?? 0;
        request.maxWillpower = maxWillpower;
        requestMap[request.key] = request;
        combosByKey[request.key] = generateCombosForCore(gems, maxWillpower, request.targetPoint, role);
    });

    const { assignment, keptKeys, droppedKeys } = findBestAssignmentWithDrops(requests, combosByKey);

    const usedGemIds = new Set();
    const results = {};

    if (assignment) {
        keptKeys.forEach((key) => {
            const combo = assignment[key];
            if (!combo) return;
            combo.gems.forEach((gem) => usedGemIds.add(gem.id));
        });

        keptKeys.forEach((key) => {
            const req = requestMap[key];
            const combo = assignment[key];
            results[key] = {
                status: "success",
                core: req.core,
                targetPoint: req.targetPoint,
                priorityOrder: req.priorityOrder,
                maxWillpower: req.maxWillpower,
                usedGems: combo.gems,
                achieved: {
                    totalCorePoint: combo.totalCorePoint,
                    totalWillpower: combo.totalWillpower,
                    efficiency: combo.score,
                },
                requirements: {
                    possible: true,
                    gap: 0,
                    neededGems: [],
                },
            };
        });
    }

    let availableForPlans = gems.filter((gem) => !usedGemIds.has(gem.id));

    const droppedList = (droppedKeys || []).slice().sort((a, b) => {
        const pa = requestMap[a]?.priorityOrder ?? Number.POSITIVE_INFINITY;
        const pb = requestMap[b]?.priorityOrder ?? Number.POSITIVE_INFINITY;
        if (pa !== pb) return pa - pb;
        const ta = requestMap[a]?.timestamp || 0;
        const tb = requestMap[b]?.timestamp || 0;
        return ta - tb;
    });

    droppedList.forEach((key) => {
        const req = requestMap[key];
        if (!req) return;
        const plan = computeCraftingPlan(req, availableForPlans, role);
        const achievedCorePoint = plan.totalCorePoint || 0;
        const achievedWillpower = plan.totalWillpower || 0;
        const successWithCurrentInventory =
            plan.possible && (plan.craftNeeds?.length || 0) === 0 && achievedCorePoint >= req.targetPoint && achievedWillpower <= req.maxWillpower;

        results[key] = {
            status: successWithCurrentInventory ? "success" : "failed",
            core: req.core,
            targetPoint: req.targetPoint,
            priorityOrder: req.priorityOrder,
            maxWillpower: req.maxWillpower,
            usedGems: plan.existingGems,
            achieved: {
                totalCorePoint: achievedCorePoint,
                totalWillpower: achievedWillpower,
                efficiency: plan.efficiency,
            },
            requirements: {
                possible: plan.possible,
                gap: successWithCurrentInventory ? 0 : plan.gap,
                neededGems: successWithCurrentInventory ? [] : plan.craftNeeds,
            },
        };

        if (plan.existingGems && plan.existingGems.length > 0) {
            const usedIds = new Set(plan.existingGems.map((gem) => gem.id));
            availableForPlans = availableForPlans.filter((gem) => !usedIds.has(gem.id));
        }
    });

    return results;
}

export function optimizeGemCombination(coreSelections, gems, role) {
    const decoratedGems = decorateGems(gems);
    const results = {};

    const requestsByType = {
        [CORE_TYPES.ORDER]: [],
        [CORE_TYPES.CHAOS]: [],
    };

    Object.entries(coreSelections).forEach(([key, selection]) => {
        const priority = selection?.selectedPriorities?.[0];
        if (!selection?.selectedGrade || !priority) return;

        requestsByType[selection.type]?.push({
            key,
            core: selection,
            targetPoint: priority.point,
            priorityOrder: priority.priority || 0,
            timestamp: priority.timestamp || 0,
        });
    });

    const processType = (type) => {
        const queue = requestsByType[type];
        if (!queue || queue.length === 0) {
            return;
        }

        queue.sort((a, b) => {
            if (a.priorityOrder && b.priorityOrder && a.priorityOrder !== b.priorityOrder) {
                return a.priorityOrder - b.priorityOrder;
            }
            return (a.timestamp || 0) - (b.timestamp || 0);
        });

        const typeGems = decoratedGems.filter((gem) => GEM_TYPE_MAP[gem.kind] === type);
        const typeResults = solveForType(queue, typeGems, role);
        Object.assign(results, typeResults);
    };

    processType(CORE_TYPES.ORDER);
    processType(CORE_TYPES.CHAOS);

    return { results };
}
