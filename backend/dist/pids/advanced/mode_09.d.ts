export interface VehicleInfoItem {
    infoType: number;
    name: string;
    description: string;
    parser: (raw: string) => string;
}
export declare const VEHICLE_INFO_ITEMS: VehicleInfoItem[];
//# sourceMappingURL=mode_09.d.ts.map