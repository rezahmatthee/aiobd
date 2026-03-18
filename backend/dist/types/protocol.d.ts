export declare enum ProtocolType {
    SAE_J1850_PWM = "SAE_J1850_PWM",
    SAE_J1850_VPW = "SAE_J1850_VPW",
    ISO_9141_2 = "ISO_9141_2",
    ISO_14230 = "ISO_14230",
    ISO_15765 = "ISO_15765",
    ISO_27145 = "ISO_27145",
    AUTO = "AUTO"
}
export declare enum ProtocolStatus {
    DISCONNECTED = "DISCONNECTED",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    ERROR = "ERROR"
}
export interface ProtocolFrame {
    header: Buffer;
    data: Buffer;
    checksum?: Buffer;
    raw: Buffer;
}
export interface ProtocolConfig {
    baudRate?: number;
    timeout?: number;
    retries?: number;
    headerEnabled?: boolean;
    canId?: number;
}
export interface ProtocolResponse {
    success: boolean;
    data?: Buffer;
    error?: string;
    raw?: string;
    timestamp: Date;
}
export interface IProtocol {
    type: ProtocolType;
    status: ProtocolStatus;
    config: ProtocolConfig;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendRequest(mode: number, pid: number): Promise<ProtocolResponse>;
    parseResponse(raw: string): ProtocolResponse;
    isConnected(): boolean;
}
//# sourceMappingURL=protocol.d.ts.map