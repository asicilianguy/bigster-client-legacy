"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Play,
    Send,
    Shield,
    XCircle,
} from "lucide-react";
import QuestionSearch from "./QuestionSearch";

interface VerifyResponse {
    valid: boolean;
    can_proceed: boolean;
    reason: string | null;
    status: string;
    candidate_first_name: string;
}

interface TestInfo {
    hash: string;
    status: string;
    candidate_name: string;
    total_questions: number;
    questions_answered: number;
    expires_at: string | null;
    is_expired: boolean;
    is_completed: boolean;
    can_start: boolean;
    privacy_policy: string | null;
    greetings_message: string | null;
    rules: string | null;
    profile: { name: string } | null;
}

interface Question {
    id: number;
    number: number;
    description: string;
    answers: { id: number; description: string }[];
    answered?: boolean;
    selectedAnswerId?: number | null;
}

interface QuestionsResponse {
    questions: Question[];
    total: number;
    answered: number;
    remaining: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function BigsterTestPage() {
    const params = useParams();
    const hash = params.hash as string;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<{ title: string; message: string } | null>(null);

    const [verifyData, setVerifyData] = useState<VerifyResponse | null>(null);
    const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
    const [questionsData, setQuestionsData] = useState<QuestionsResponse | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [localAnswers, setLocalAnswers] = useState<Map<number, number>>(new Map());
    const [direction, setDirection] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showCompletionConfirm, setShowCompletionConfirm] = useState(false);

    const fetchVerify = async () => {
        try {
            const res = await fetch(`${API_BASE}/bigster/verify/${hash}`);
            if (!res.ok) throw new Error("Verifica fallita");
            const data: VerifyResponse = await res.json();
            setVerifyData(data);
            return data;
        } catch (err) {
            console.error("Errore verifica:", err);
            setError({
                title: "Link non valido",
                message: "Il link che hai utilizzato non è valido o è scaduto.",
            });
            return null;
        }
    };

    const fetchTestInfo = async () => {
        try {
            const res = await fetch(`${API_BASE}/bigster/test/${hash}`);
            if (!res.ok) throw new Error("Test info fallita");
            const data: TestInfo = await res.json();
            console.log("TestInfo loaded:", data);
            setTestInfo(data);
            return data;
        } catch (err) {
            console.error("Errore test info:", err);
            return null;
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`${API_BASE}/bigster/test/${hash}/questions?lang=it`);
            if (!res.ok) throw new Error("Questions fallita");
            const data: QuestionsResponse = await res.json();
            setQuestionsData(data);

            const serverAnswers = new Map<number, number>();
            data.questions.forEach((q) => {
                if (q.answered && q.selectedAnswerId) {
                    serverAnswers.set(q.id, q.selectedAnswerId);
                }
            });
            setLocalAnswers(serverAnswers);

            const firstUnanswered = data.questions.findIndex((q) => !q.answered);
            if (firstUnanswered > 0) {
                setCurrentQuestionIndex(firstUnanswered);
            }

            return data;
        } catch (err) {
            console.error("Errore questions:", err);
            return null;
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);

            const verify = await fetchVerify();
            if (!verify || !verify.valid) {
                setIsLoading(false);
                return;
            }

            if (!verify.can_proceed) {
                setError({
                    title: "Test non disponibile",
                    message: verify.reason || "Il test non è più disponibile.",
                });
                setIsLoading(false);
                return;
            }

            const info = await fetchTestInfo();
            if (!info) {
                setError({
                    title: "Errore",
                    message: "Impossibile caricare le informazioni del test.",
                });
                setIsLoading(false);
                return;
            }

            if (info.status === "IN_PROGRESS") {
                await fetchQuestions();
            }

            setIsLoading(false);
        };

        if (hash) {
            loadInitialData();
        }
    }, [hash]);

    const handleStartTest = async () => {
        setIsStarting(true);
        try {
            const res = await fetch(`${API_BASE}/bigster/test/${hash}/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accept_privacy: true }),
            });

            if (!res.ok) throw new Error("Start fallito");

            const info = await fetchTestInfo();
            if (info?.status === "IN_PROGRESS") {
                await fetchQuestions();
            }
        } catch (err) {
            console.error("Errore start:", err);
        } finally {
            setIsStarting(false);
        }
    };

    const handleSelectAnswer = useCallback(async (questionId: number, answerId: number) => {

        setLocalAnswers(prev => new Map(prev).set(questionId, answerId));

        setIsSubmitting(true);
        try {
            await fetch(`${API_BASE}/bigster/test/${hash}/answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question_id: questionId, answer_id: answerId }),
            });
        } catch (err) {
            console.error("Errore salvataggio:", err);
        } finally {
            setIsSubmitting(false);
        }

        setTimeout(() => {
            const questions = questionsData?.questions || [];
            if (currentQuestionIndex < questions.length - 1) {
                setDirection(1);
                setCurrentQuestionIndex(prev => prev + 1);
            }
        }, 300);
    }, [hash, currentQuestionIndex, questionsData]);

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setDirection(-1);
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        const questions = questionsData?.questions || [];
        if (currentQuestionIndex < questions.length - 1) {
            setDirection(1);
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleGoToQuestion = (index: number) => {
        setDirection(index > currentQuestionIndex ? 1 : -1);
        setCurrentQuestionIndex(index);
    };

    const handleCompleteTest = async () => {
        setIsCompleting(true);
        try {
            const res = await fetch(`${API_BASE}/bigster/test/${hash}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirm_completion: true }),
            });

            if (!res.ok) throw new Error("Complete fallito");

            await fetchTestInfo();
            setShowCompletionConfirm(false);
        } catch (err) {
            console.error("Errore complete:", err);
        } finally {
            setIsCompleting(false);
        }
    };

    const questions = questionsData?.questions || [];
    const totalQuestions = questionsData?.total || testInfo?.total_questions || 0;
    const answeredCount = Math.max(localAnswers.size, questionsData?.answered || 0);
    const currentQuestion = questions[currentQuestionIndex];
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    const canComplete = answeredCount >= totalQuestions;

    if (isLoading) {
        return <LoadingScreen message="Caricamento test..." />;
    }

    if (error) {
        return (
            <ErrorScreen
                title={error.title}
                message={error.message}
                icon={<XCircle className="h-16 w-16 text-red-400" />}
            />
        );
    }

    if (!testInfo) {
        return <LoadingScreen message="Caricamento test..." />;
    }

    if (testInfo.status === "COMPLETED" || testInfo.is_completed) {
        return <CompletedScreen candidateName={testInfo.candidate_name} />;
    }

    if (testInfo.status === "EXPIRED" || testInfo.is_expired) {
        return (
            <ErrorScreen
                title="Test scaduto"
                message="Il tempo per completare il test è scaduto. Contatta l'azienda per richiedere un nuovo invito."
                icon={<Clock className="h-16 w-16 text-amber-400" />}
            />
        );
    }

    if (testInfo.status === "PENDING") {
        return (
            <WelcomeScreen
                testInfo={testInfo}
                onStart={handleStartTest}
                isStarting={isStarting}
            />
        );
    }

    if (!questions.length) {
        return <LoadingScreen message="Caricamento domande..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">

            <TestHeader
                progress={progress}
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
                candidateName={testInfo.candidate_name}
            />

            <main className="max-w-3xl mx-auto px-4 py-8 pb-32">

                <div className="text-center mb-8">
                    <span className="text-sm font-medium text-slate-400 tracking-wide uppercase">
                        Domanda {currentQuestionIndex + 1} di {totalQuestions}
                    </span>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: direction * 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -50 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        <QuestionCard
                            question={currentQuestion}
                            selectedAnswerId={localAnswers.get(currentQuestion.id) || null}
                            onSelectAnswer={(answerId) => handleSelectAnswer(currentQuestion.id, answerId)}
                            isSubmitting={isSubmitting}
                        />
                    </motion.div>
                </AnimatePresence>

                <QuestionMiniMap
                    questions={questions}
                    currentIndex={currentQuestionIndex}
                    answeredIds={localAnswers}
                    onGoTo={handleGoToQuestion}
                />
            </main>

            <TestFooter
                currentIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                canComplete={canComplete}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onComplete={() => setShowCompletionConfirm(true)}
            />

            <AnimatePresence>
                {showCompletionConfirm && (
                    <CompletionConfirmModal
                        onConfirm={handleCompleteTest}
                        onCancel={() => setShowCompletionConfirm(false)}
                        isCompleting={isCompleting}
                        answeredCount={answeredCount}
                        totalQuestions={totalQuestions}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function LoadingScreen({ message }: { message: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">{message}</p>
            </div>
        </div>
    );
}

function ErrorScreen({
    title,
    message,
    icon,
}: {
    title: string;
    message: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md text-center">
                <div className="mb-6">{icon}</div>
                <h1 className="text-2xl font-bold text-slate-800 mb-3">{title}</h1>
                <p className="text-slate-600">{message}</p>
            </div>
        </div>
    );
}

function CompletedScreen({ candidateName }: { candidateName: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-lg text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8"
                >
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </motion.div>

                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                    Test completato!
                </h1>

                <p className="text-lg text-slate-600 mb-6">
                    Grazie <strong>{candidateName.split(" ")[0]}</strong>, hai completato il test con successo.
                </p>

                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 text-left">
                    <h3 className="font-semibold text-slate-700 mb-2">E adesso?</h3>
                    <p className="text-slate-600 text-sm">
                        I risultati sono stati inviati automaticamente. Verrai contattato dall'azienda
                        per i prossimi passi del processo di selezione.
                    </p>
                </div>

                <p className="text-slate-400 text-sm mt-8">
                    Puoi chiudere questa pagina.
                </p>
            </motion.div>
        </div>
    );
}

function WelcomeScreen({
    testInfo,
    onStart,
    isStarting,
}: {
    testInfo: TestInfo;
    onStart: () => void;
    isStarting: boolean;
}) {
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50">
            <div className="max-w-2xl mx-auto px-4 py-12">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-10 w-10 text-amber-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800 mb-3">
                        Ciao {testInfo.candidate_name.split(" ")[0]}!
                    </h1>

                    <p className="text-lg text-slate-600">
                        Sei stato invitato a completare un test attitudinale
                    </p>

                    {testInfo.profile?.name && (
                        <p className="text-sm text-slate-500 mt-2">
                            Profilo: <strong>{testInfo.profile.name}</strong>
                        </p>
                    )}
                </motion.div>


                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6"
                >
                    <h2 className="font-semibold text-slate-800 mb-4">Prima di iniziare</h2>

                    <ul className="space-y-3 text-slate-600">
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-700 text-xs font-bold">1</span>
                            </span>
                            <span>
                                Il test contiene <strong>{testInfo.total_questions} domande</strong> e
                                richiede circa <strong>un'ora</strong>. Prenditi il tempo per completarlo
                                tutto d'un colpo.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-700 text-xs font-bold">2</span>
                            </span>
                            <span>
                                Non esistono risposte giuste o sbagliate: rispondi in modo spontaneo,
                                scegliendo ciò che per te è <strong>vero e realistico</strong>. Ognuno
                                ha il proprio punto di vista ed è importante che tu risponda per ciò che
                                è abitudinario per te.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-700 text-xs font-bold">3</span>
                            </span>
                            <span>
                                Per ogni domanda avrai <strong>tre opzioni</strong>:
                                <span className="block mt-1.5 ml-1 space-y-1 text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="w-5 h-5 bg-slate-100 rounded text-center text-xs font-bold text-slate-700 leading-5">A</span>
                                        Sì, sono d'accordo
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="w-5 h-5 bg-slate-100 rounded text-center text-xs font-bold text-slate-700 leading-5">B</span>
                                        Forse, non saprei
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="w-5 h-5 bg-slate-100 rounded text-center text-xs font-bold text-slate-700 leading-5">C</span>
                                        No, non sono d'accordo
                                    </span>
                                </span>
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-700 text-xs font-bold">4</span>
                            </span>
                            <span>
                                Puoi interrompere e riprendere in qualsiasi momento: i tuoi progressi
                                vengono salvati automaticamente.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-700 text-xs font-bold">5</span>
                            </span>
                            <span>
                                Assicurati di essere in un ambiente tranquillo e senza distrazioni.
                            </span>
                        </li>
                    </ul>


                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 text-sm text-slate-500">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
                        <span>
                            <strong>Attenzione:</strong> la risposta <strong>B</strong> (Forse) non
                            significa "un po' sì e un po' no", ma indica una reale incertezza o
                            indecisione.
                        </span>
                    </div>

                    {testInfo.expires_at && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            <span>
                                Scadenza:{" "}
                                {new Date(testInfo.expires_at).toLocaleDateString("it-IT", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    )}
                </motion.div>


                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-slate-50 rounded-xl p-4 mb-6"
                >
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acceptedPrivacy}
                            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500 mt-0.5"
                        />
                        <span className="text-sm text-slate-600">
                            Dichiaro di aver letto e accetto l'{" "}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowPrivacyModal(true);
                                }}
                                className="text-amber-600 hover:text-amber-700 underline underline-offset-2 font-medium"
                            >
                                informativa sulla privacy
                            </button>{" "}
                            e acconsento al trattamento dei miei dati personali per le finalità
                            del test. <span className="text-red-500">*</span>
                        </span>
                    </label>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <button
                        onClick={onStart}
                        disabled={!acceptedPrivacy || isStarting}
                        className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {isStarting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Avvio in corso...
                            </>
                        ) : (
                            <>
                                <Play className="h-5 w-5" />
                                Inizia il test
                            </>
                        )}
                    </button>
                </motion.div>
            </div>

            <AnimatePresence>
                {showPrivacyModal && (
                    <PrivacyModal
                        privacyText={testInfo.privacy_policy}
                        onClose={() => setShowPrivacyModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function PrivacyModal({
    privacyText,
    onClose,
}: {
    privacyText: string | null;
    onClose: () => void;
}) {
    const defaultPrivacy = `Oggetto: Informativa ai sensi dell'art. 13 del D. Lgs. 196/2003 e dell'articolo 13 del Regolamento UE n. 2016/679

Ai sensi dell'art. 13 del D. Lgs. 196/2003 (di seguito "Codice Privacy") e dell'art. 13 del Regolamento UE n. 2016/679 (di seguito "GDPR 2016/679"), recante disposizioni a tutela delle persone e di altri soggetti rispetto al trattamento dei dati personali, desideriamo informarLa che i dati personali da Lei forniti formeranno oggetto di trattamento nel rispetto della normativa sopra richiamata e degli obblighi di riservatezza cui è tenuta l'azienda Kayros 8 SA.

Titolare del trattamento
Il Titolare del trattamento è Kayros 8 SA nella persona del Presidente e legale rappresentante pro tempore Sig. Federico Marchesi, domiciliato per la carica in Lugano alla Via Pioda 12.

Responsabile della protezione dei dati (DPO)
Il responsabile della protezione dei dati (DPO) è Kayros 8 SA Via Pioda, 12 Lugano. Il Responsabile del trattamento è il Sig. Federico Marchesi.

Finalità del trattamento
I dati personali da Lei forniti sono necessari per gli adempimenti previsti per legge.

Modalità di trattamento e conservazione
Il trattamento sarà svolto in forma automatizzata e/o manuale, nel rispetto di quanto previsto dall'art. 32 del GDPR 2016/679 e dall'Allegato B del D.Lgs. 196/2003 (artt. 33-36 del Codice) in materia di misure di sicurezza, ad opera di soggetti appositamente incaricati e in ottemperanza a quanto previsto dagli art. 29 GDPR 2016/679. Le segnaliamo che, nel rispetto dei principi di liceità, limitazione delle finalità e minimizzazione dei dati, ai sensi dell'art. 5 GDPR 2016/679, previo il Suo consenso libero ed esplicito espresso in calce alla presente informativa, i Suoi dati personali saranno conservati per il periodo di tempo necessario per il conseguimento delle finalità per le quali sono raccolti e trattati.

Ambito di comunicazione e diffusione
I dati raccolti non saranno mai diffusi e non saranno oggetto di comunicazione senza Suo esplicito consenso, salvo le comunicazioni necessarie che possono comportare il trasferimento di dati ad enti pubblici, a consulenti o ad altri soggetti per l'adempimento degli obblighi di legge.

Trasferimento dei dati personali
I suoi dati non saranno trasferiti né in Stati membri dell'Unione Europea né in Paesi terzi non appartenenti all'Unione Europea.

Categorie particolari di dati personali
Ai sensi degli articoli 26 e 27 del D.Lgs. 196/2003 e degli articoli 9 e 10 del Regolamento UE n. 2016/679, Lei potrebbe conferire, al titolare del trattamento dati qualificabili come "categorie particolari di dati personali" e cioè quei dati che rivelano "l'origine razziale o etnica, le opinioni politiche, le convinzioni religiose o filosofiche, o l'appartenenza sindacale, nonché dati genetici, dati biometrici intesi a identificare in modo univoco una persona fisica, dati relativi alla salute o alla vita sessuale o all'orientamento sessuale della persona". Tali categorie di dati potranno essere trattate solo previo Suo libero ed esplicito consenso, manifestato in forma scritta in calce alla presente informativa.

Esistenza di un processo decisionale automatizzato
La società Kayros 8 SA non adotta alcun processo decisionale automatizzato, compresa la profilazione, di cui all'articolo 22, paragrafi 1 e 4, del Regolamento UE n. 679/2016.

Diritti dell'interessato
In ogni momento, Lei potrà esercitare, ai sensi dell'art. 7 del D.Lgs. 196/2003 e degli articoli dal 15 al 22 del Regolamento UE n. 2016/679, il diritto di:
a) chiedere la conferma dell'esistenza o meno di propri dati personali;
b) ottenere le indicazioni circa le finalità del trattamento, le categorie dei dati personali, i destinatari o le categorie di destinatari a cui i dati personali sono stati o saranno comunicati e, quando possibile, il periodo di conservazione;
c) ottenere la rettifica e la cancellazione dei dati;
d) ottenere la limitazione del trattamento;
e) ottenere la portabilità dei dati;
f) opporsi al trattamento in qualsiasi momento;
g) opporsi ad un processo decisionale automatizzato relativo alle persone fisiche, compresa la profilazione;
h) chiedere al titolare del trattamento l'accesso ai dati personali e la rettifica o la cancellazione degli stessi;
i) revocare il consenso in qualsiasi momento;
j) proporre reclamo a un'autorità di controllo.

Può esercitare i Suoi diritti con richiesta scritta inviata a Kayros 8 SA all'indirizzo postale della sede legale o all'indirizzo mail amministrazione@kayros8.ch.`;

    const content = privacyText || defaultPrivacy;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Shield className="h-4 w-4 text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Informativa sulla Privacy
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <XCircle className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {content.split("\n\n").map((paragraph, idx) => {
                        const lines = paragraph.split("\n");
                        const isSection = lines[0].length < 60 && !lines[0].endsWith(".");

                        if (isSection && lines.length > 1) {
                            return (
                                <div key={idx} className="mb-4">
                                    <h3 className="text-sm font-bold text-slate-800 mb-1">
                                        {lines[0]}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {lines.slice(1).join("\n")}
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <p
                                key={idx}
                                className="text-sm text-slate-600 mb-3 leading-relaxed"
                            >
                                {paragraph}
                            </p>
                        );
                    })}
                </div>

                <div className="px-6 py-4 border-t border-slate-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
                    >
                        Ho letto l'informativa
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function TestHeader({
    progress,
    answeredCount,
    totalQuestions,
    candidateName,
}: {
    progress: number;
    answeredCount: number;
    totalQuestions: number;
    candidateName: string;
}) {
    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-3xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">
                        {candidateName.split(" ")[0]}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                        {answeredCount} / {totalQuestions}
                    </span>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                </div>

                <div className="text-right mt-1">
                    <span className="text-xs text-slate-400">
                        {Math.round(progress)}% completato
                    </span>
                </div>
            </div>
        </header>
    );
}

function QuestionCard({
    question,
    selectedAnswerId,
    onSelectAnswer,
    isSubmitting,
}: {
    question: Question;
    selectedAnswerId: number | null;
    onSelectAnswer: (answerId: number) => void;
    isSubmitting: boolean;
}) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 pb-4">
                <p className="text-lg text-slate-800 leading-relaxed">
                    {question.description}
                </p>
            </div>

            <div className="px-4 pb-4 space-y-2">
                {question.answers.map((answer) => {
                    const isSelected = selectedAnswerId === answer.id;

                    return (
                        <motion.button
                            key={answer.id}
                            onClick={() => onSelectAnswer(answer.id)}
                            disabled={isSubmitting}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${isSelected
                                ? "border-amber-400 bg-amber-50 text-amber-900"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected
                                        ? "border-amber-500 bg-amber-500"
                                        : "border-slate-300"
                                        }`}
                                >
                                    {isSelected && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2 h-2 bg-white rounded-full"
                                        />
                                    )}
                                </span>
                                <span className="flex-1">{answer.description}</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

function QuestionMiniMap({
    questions,
    currentIndex,
    answeredIds,
    onGoTo,
}: {
    questions: Question[];
    currentIndex: number;
    answeredIds: Map<number, number>;
    onGoTo: (index: number) => void;
}) {
    const windowSize = 15;
    const halfWindow = Math.floor(windowSize / 2);

    let start = Math.max(0, currentIndex - halfWindow);
    let end = Math.min(questions.length, start + windowSize);

    if (end - start < windowSize) {
        start = Math.max(0, end - windowSize);
    }

    const visibleQuestions = questions.slice(start, end);

    return (
        <div className="mt-8">
            <div className="flex items-center justify-center gap-1 flex-wrap">
                {start > 0 && (
                    <span className="text-slate-400 text-xs px-1">...</span>
                )}

                {visibleQuestions.map((q, idx) => {
                    const actualIndex = start + idx;
                    const isAnswered = answeredIds.has(q.id) || q.answered;
                    const isCurrent = actualIndex === currentIndex;

                    return (
                        <button
                            key={q.id}
                            onClick={() => onGoTo(actualIndex)}
                            className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${isCurrent
                                ? "bg-amber-500 text-white shadow-md scale-110"
                                : isAnswered
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                        >
                            {actualIndex + 1}
                        </button>
                    );
                })}

                {end < questions.length && (
                    <span className="text-slate-400 text-xs px-1">...</span>
                )}
            </div>
        </div>
    );
}

function TestFooter({
    currentIndex,
    totalQuestions,
    canComplete,
    onPrevious,
    onNext,
    onComplete,
}: {
    currentIndex: number;
    totalQuestions: number;
    canComplete: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onComplete: () => void;
}) {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalQuestions - 1;

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={onPrevious}
                        disabled={isFirst}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Precedente</span>
                    </button>

                    {canComplete && (
                        <button
                            onClick={onComplete}
                            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors flex items-center gap-2"
                        >
                            <Send className="h-4 w-4" />
                            Completa test
                        </button>
                    )}

                    <button
                        onClick={onNext}
                        disabled={isLast}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <span className="hidden sm:inline">Successiva</span>
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </footer>
    );
}

function CompletionConfirmModal({
    onConfirm,
    onCancel,
    isCompleting,
    answeredCount,
    totalQuestions,
}: {
    onConfirm: () => void;
    onCancel: () => void;
    isCompleting: boolean;
    answeredCount: number;
    totalQuestions: number;
}) {
    const allAnswered = answeredCount >= totalQuestions;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-8 w-8 text-amber-600" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
                        Conferma completamento
                    </h2>

                    <p className="text-slate-600 text-center mb-4">
                        {allAnswered
                            ? "Hai risposto a tutte le domande. Sei sicuro di voler completare il test?"
                            : `Hai risposto a ${answeredCount} domande su ${totalQuestions}. Vuoi comunque completare il test?`}
                    </p>

                    {!allAnswered && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                            <p className="text-amber-800 text-sm text-center">
                                ⚠️ Alcune domande non hanno ricevuto risposta
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isCompleting}
                            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isCompleting}
                            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {isCompleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Invio...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Conferma
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
