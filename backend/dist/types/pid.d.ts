export declare enum PIDMode {
    CURRENT_DATA = 1,
    FREEZE_FRAME = 2,
    FAULT_CODES = 3,
    CLEAR_FAULT_CODES = 4,
    TEST_RESULTS_NON_CAN = 5,
    TEST_RESULTS_CAN = 6,
    PENDING_FAULT_CODES = 7,
    CONTROL_OPERATION = 8,
    VEHICLE_INFO = 9,
    PERMANENT_FAULT_CODES = 10
}
export interface PIDDefinition {
    mode: number;
    pid: number;
    name: string;
    description: string;
    minValue: number;
    maxValue: number;
    unit: string;
    formula: (bytes: number[]) => number | string;
    bytes: number;
}
export interface PIDValue {
    pid: PIDDefinition;
    rawValue: number[];
    calculatedValue: number | string;
    unit: string;
    timestamp: Date;
}
export interface PIDLookupResult {
    found: boolean;
    definition?: PIDDefinition;
}
//# sourceMappingURL=pid.d.ts.map