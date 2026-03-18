export interface Mode06TestResult {
    testId: number;
    componentId: number;
    testValue: number;
    minValue: number;
    maxValue: number;
    passed: boolean;
}
export declare const MODE_06_TESTS: Record<number, string>;
export declare function parseMode06Response(raw: string): Mode06TestResult[];
//# sourceMappingURL=mode_06.d.ts.map