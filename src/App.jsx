import { useState, useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { CoreSelection } from "./components/CoreSelection/CoreSelection";
import { GemInput } from "./components/GemInput/GemInput";
import { GemPreset } from "./components/GemPreset/GemPreset";
import { ResultDisplay } from "./components/ResultDisplay/ResultDisplay";
import { optimizeGemCombination } from "./utils/optimizer";
import { ROLE_TYPES } from "./constants/gameData";
import "./App.css";

function App() {
    const { theme, toggleTheme } = useTheme();
    const [coreSelections, setCoreSelections] = useState(() => {
        const saved = localStorage.getItem("coreSelections");
        return saved ? JSON.parse(saved) : {};
    });
    const [gems, setGems] = useState(() => {
        // 먼저 현재 보유 젬 목록을 로컬스토리지에서 불러오기
        const savedGems = localStorage.getItem("currentGems");
        if (savedGems) {
            return JSON.parse(savedGems);
        }
        
        // 없으면 활성 프리셋에서 불러오기
        const activePresetId = localStorage.getItem("activePreset");
        if (activePresetId) {
            const presets = JSON.parse(localStorage.getItem("gemPresets") || "[]");
            const activePreset = presets.find((p) => p.id === parseInt(activePresetId));
            return activePreset ? activePreset.gems : [];
        }
        return [];
    });
    const [results, setResults] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);

    // 코어 선택 저장
    useEffect(() => {
        localStorage.setItem("coreSelections", JSON.stringify(coreSelections));
    }, [coreSelections]);

    // 보유 젬 목록 저장
    useEffect(() => {
        localStorage.setItem("currentGems", JSON.stringify(gems));
    }, [gems]);

    const handleCalculate = (role) => {
        // 조건 확인
        const hasSelections = Object.values(coreSelections).some((core) => core.selectedGrade && core.selectedPriorities?.length > 0);

        if (!hasSelections) {
            alert("코어의 활성 옵션 우선순위를 최소 하나 이상 선택해주세요.");
            return;
        }

        if (gems.length === 0) {
            alert("보유 젬을 최소 하나 이상 등록해주세요.");
            return;
        }

        setIsCalculating(true);
        setCurrentRole(role);

        // 비동기로 계산 (UI 업데이트를 위해)
        setTimeout(() => {
            const optimizationResults = optimizeGemCombination(coreSelections, gems, role);
            setResults(optimizationResults.results);
            setIsCalculating(false);
        }, 100);
    };

    const handleLoadPreset = (presetGems) => {
        setGems(presetGems);
    };

    return (
        <div className="app">
            <header className="app__header">
                <div className="app__header-content">
                    <h1 className="app__title">젬 조합기</h1>
                    <button className="app__theme-toggle" onClick={toggleTheme}>
                        {theme === "light" ? "다크 모드" : "라이트 모드"}
                    </button>
                </div>
            </header>

            <main className="app__main">
                <div className="app__container">
                    <CoreSelection coreSelections={coreSelections} onSelectionChange={setCoreSelections} />

                    <GemInput gems={gems} onGemsChange={setGems} />

                    <GemPreset gems={gems} onLoadPreset={handleLoadPreset} />

                    <div className="app__actions">
                        <button
                            className="app__calculate-btn app__calculate-btn--dealer"
                            onClick={() => handleCalculate(ROLE_TYPES.DEALER)}
                            disabled={isCalculating}
                        >
                            {isCalculating && currentRole === ROLE_TYPES.DEALER ? "계산 중..." : "딜러 조합 검색"}
                        </button>
                        <button
                            className="app__calculate-btn app__calculate-btn--supporter"
                            onClick={() => handleCalculate(ROLE_TYPES.SUPPORTER)}
                            disabled={isCalculating}
                        >
                            {isCalculating && currentRole === ROLE_TYPES.SUPPORTER ? "계산 중..." : "서폿 조합 검색"}
                        </button>
                    </div>

                    {(results || isCalculating) && <ResultDisplay results={results} isCalculating={isCalculating} role={currentRole} />}
                </div>
            </main>

            <footer className="app__footer">
                <p>Arkgrid - 젬 조합 최적화 도구</p>
            </footer>
        </div>
    );
}

export default App;
