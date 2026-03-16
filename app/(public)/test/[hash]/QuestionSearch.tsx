"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, X, Hash, CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface Question {
    id: number;
    number: number;
    description: string;
    answers: { id: number; description: string }[];
    answered?: boolean;
    selectedAnswerId?: number | null;
}

interface QuestionSearchProps {
    questions: Question[];
    currentIndex: number;
    answeredIds: Map<number, number>;
    onGoTo: (index: number) => void;
}

function normalize(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/["""''`]/g, "")         
        .replace(/\s+/g, " ")            
        .trim();
}

/**
 * Calcola un punteggio di rilevanza per il match.
 * Più alto = più rilevante.
 *
 * Strategia:
 * 1. Match esatto normalizzato → score altissimo
 * 2. "Starts with" → score alto
 * 3. Tutte le parole della query presenti → score medio-alto
 * 4. Alcune parole presenti → score proporzionale
 * 5. Match per numero domanda (es. "14" → domanda 14)
 */
function scoreMatch(question: Question, query: string): number {
    const normalizedQuery = normalize(query);
    const normalizedDesc = normalize(question.description);

    
    if (!normalizedQuery) return 0;

    
    const queryAsNumber = parseInt(query.trim(), 10);
    if (!isNaN(queryAsNumber) && question.number === queryAsNumber) {
        return 1000; 
    }

    
    if (normalizedDesc === normalizedQuery) return 900;

    
    if (normalizedDesc.startsWith(normalizedQuery)) return 800;

    
    if (normalizedDesc.includes(normalizedQuery)) return 700;

    
    const queryWords = normalizedQuery.split(" ").filter(w => w.length > 1);
    if (queryWords.length === 0) return 0;

    const matchedWords = queryWords.filter(word => normalizedDesc.includes(word));
    const matchRatio = matchedWords.length / queryWords.length;

    if (matchRatio === 1) {
        
        return 500 + (queryWords.length * 10);
    }

    if (matchRatio >= 0.5) {
        
        return Math.round(300 * matchRatio);
    }

    
    if (matchedWords.length > 0) {
        return Math.round(100 * matchRatio);
    }

    return 0;
}





export function QuestionSearch({
    questions,
    currentIndex,
    answeredIds,
    onGoTo,
}: QuestionSearchProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedResultIndex, setSelectedResultIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    
    
    
    const results = useMemo(() => {
        if (!query.trim()) return [];

        const scored = questions
            .map((q, idx) => ({
                question: q,
                index: idx,
                score: scoreMatch(q, query),
            }))
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 15); 

        return scored;
    }, [questions, query]);

    
    
    
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!isOpen || results.length === 0) {
                if (e.key === "Escape") {
                    setIsOpen(false);
                    setQuery("");
                    inputRef.current?.blur();
                }
                return;
            }

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedResultIndex(prev =>
                        prev < results.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedResultIndex(prev =>
                        prev > 0 ? prev - 1 : results.length - 1
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    if (results[selectedResultIndex]) {
                        handleSelectResult(results[selectedResultIndex].index);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    setIsOpen(false);
                    setQuery("");
                    inputRef.current?.blur();
                    break;
            }
        },
        [isOpen, results, selectedResultIndex]
    );

    
    useEffect(() => {
        if (resultsRef.current && results.length > 0) {
            const selectedEl = resultsRef.current.children[selectedResultIndex] as HTMLElement;
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: "nearest" });
            }
        }
    }, [selectedResultIndex, results.length]);

    
    useEffect(() => {
        setSelectedResultIndex(0);
    }, [query]);

    
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    
    
    
    const handleSelectResult = (questionIndex: number) => {
        onGoTo(questionIndex);
        setQuery("");
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        if (e.target.value.trim()) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setQuery("");
        setIsOpen(false);
        inputRef.current?.focus();
    };

    
    
    
    const highlightMatch = (text: string, searchQuery: string): React.ReactNode => {
        if (!searchQuery.trim()) return text;

        const normalizedText = normalize(text);
        const normalizedQuery = normalize(searchQuery);

        
        const startIdx = normalizedText.indexOf(normalizedQuery);
        if (startIdx !== -1) {
            const before = text.slice(0, startIdx);
            const match = text.slice(startIdx, startIdx + normalizedQuery.length);
            const after = text.slice(startIdx + normalizedQuery.length);
            return (
                <>
                    {before}
                    <mark className="bg-amber-200 text-amber-900 rounded-sm px-0.5">{match}</mark>
                    {after}
                </>
            );
        }

        
        const words = searchQuery.trim().split(/\s+/).filter(w => w.length > 1);
        if (words.length === 0) return text;

        const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) => {
            if (regex.test(part)) {
                return (
                    <mark key={i} className="bg-amber-200 text-amber-900 rounded-sm px-0.5">
                        {part}
                    </mark>
                );
            }
            
            regex.lastIndex = 0;
            return part;
        });
    };

    
    
    
    return (
        <div ref={containerRef} className="relative w-full" style={{ zIndex: 40 }}>

            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    🧪 DEV — Cerca Domanda (temporaneo)
                </span>
            </div>


            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.trim() && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Cerca per testo domanda o numero (es. 'preoccuparti' o '14')…"
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>


            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[360px] flex flex-col">
                    {results.length > 0 ? (
                        <>

                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-500">
                                    {results.length} risultat{results.length === 1 ? "o" : "i"} trovati
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    ↑↓ naviga · Enter seleziona · Esc chiudi
                                </span>
                            </div>


                            <div ref={resultsRef} className="overflow-y-auto flex-1">
                                {results.map((result, idx) => {
                                    const isAnswered = answeredIds.has(result.question.id) || result.question.answered;
                                    const isCurrent = result.index === currentIndex;
                                    const isSelected = idx === selectedResultIndex;

                                    return (
                                        <button
                                            key={result.question.id}
                                            onClick={() => handleSelectResult(result.index)}
                                            onMouseEnter={() => setSelectedResultIndex(idx)}
                                            className={`w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-b-0 ${isSelected
                                                    ? "bg-amber-50"
                                                    : "hover:bg-slate-50"
                                                } ${isCurrent ? "ring-2 ring-inset ring-amber-300" : ""}`}
                                        >

                                            <span
                                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isCurrent
                                                        ? "bg-amber-500 text-white"
                                                        : isAnswered
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                            >
                                                {result.question.number}
                                            </span>


                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-700 leading-snug">
                                                    {highlightMatch(result.question.description, query)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {isAnswered ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Risposta
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                            <Circle className="h-3 w-3" />
                                                            Non risposta
                                                        </span>
                                                    )}
                                                    {isCurrent && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                                                            <ArrowRight className="h-3 w-3" />
                                                            Corrente
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="px-4 py-8 text-center">
                            <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">
                                Nessuna domanda trovata per "<strong>{query}</strong>"
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Prova con parole diverse o con il numero della domanda
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default QuestionSearch;
