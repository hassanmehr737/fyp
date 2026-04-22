// ===== Core Types =====

export type Provider = 'openai' | 'anthropic';
export type Classification = 'phishing' | 'legitimate' | 'suspicious';
export type PromptStrategy = 'zero-shot' | 'few-shot' | 'chain-of-thought' | 'structured-json';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingCategory = 'credential-theft' | 'financial-fraud' | 'malware-delivery' | 'social-engineering' | 'spear-phishing';

// ===== Email Analysis =====

export interface Email {
    id: string;
    subject: string;
    sender: string;
    body: string;
    headers?: Record<string, string>;
    isPhishing?: boolean; // Ground truth label (for training/evaluation)
    category?: TrainingCategory;
    difficulty?: DifficultyLevel;
    indicators?: PhishingIndicator[];
    createdAt: Date;
}

export interface AnalysisRequest {
    emailContent: string;
    subject?: string;
    sender?: string;
    providers?: Provider[];
    promptStrategy?: PromptStrategy;
}

export interface AnalysisResult {
    id: string;
    emailId: string;
    provider: Provider;
    classification: Classification;
    confidence: number; // 0-1
    explanation: string;
    indicators: PhishingIndicator[];
    responseTimeMs: number;
    tokenUsage: TokenUsage;
    promptVersion: string;
    createdAt: Date;
}

export interface PhishingIndicator {
    type: 'sender' | 'link' | 'language' | 'urgency' | 'impersonation' | 'attachment' | 'header';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    evidence: string;
}

export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
}

// ===== Training Module =====

export interface TrainingModule {
    id: string;
    title: string;
    description: string;
    category: TrainingCategory;
    difficulty: DifficultyLevel;
    emails: TrainingEmail[];
    order: number;
}

export interface TrainingEmail {
    id: string;
    moduleId: string;
    subject: string;
    sender: string;
    body: string;
    isPhishing: boolean;
    category: TrainingCategory;
    difficulty: DifficultyLevel;
    explanation: string;
    indicators: PhishingIndicator[];
}

export interface TrainingSubmission {
    emailId: string;
    userAnswer: Classification;
    isCorrect: boolean;
    timeSpentMs: number;
}

export interface TrainingProgress {
    id: string;
    userId: string;
    moduleId: string;
    completedEmails: number;
    totalEmails: number;
    correctAnswers: number;
    currentStreak: number;
    bestStreak: number;
    badges: Badge[];
    startedAt: Date;
    completedAt?: Date;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: Date;
}

// ===== Evaluation (Pre/Post Test) =====

export interface TestSession {
    id: string;
    userId: string;
    type: 'pre-test' | 'post-test';
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    startedAt: Date;
    completedAt?: Date;
    answers: TestAnswer[];
}

export interface TestAnswer {
    emailId: string;
    userAnswer: Classification;
    correctAnswer: Classification;
    isCorrect: boolean;
    timeSpentMs: number;
}

// ===== User =====

export interface User {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    technicalBackground: 'none' | 'basic' | 'intermediate' | 'advanced';
    ageGroup?: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
    createdAt: Date;
}

// ===== Dashboard Stats =====

export interface UserStats {
    totalAnalyses: number;
    phishingDetected: number;
    legitimateConfirmed: number;
    trainingModulesCompleted: number;
    overallAccuracy: number;
    currentStreak: number;
    badges: Badge[];
    weeklyProgress: WeeklyProgress[];
    categoryPerformance: CategoryPerformance[];
}

export interface WeeklyProgress {
    week: string;
    correctAnswers: number;
    totalAnswers: number;
    accuracy: number;
}

export interface CategoryPerformance {
    category: TrainingCategory;
    accuracy: number;
    totalAttempts: number;
}

// ===== API Response Wrappers =====

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface ComparisonResult {
    emailId: string;
    emailSubject: string;
    results: AnalysisResult[];
    consensus: Classification;
    agreementLevel: number; // 0-1
}
