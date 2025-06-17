export interface VisitStats {
    totalVisits: number;
    visitsByMonth: Array<{ month: string; count: number }>;
    averageVisitsPerMonth: number;
    lastVisitDate: Date;
}

export interface CostAnalysis {
    totalCost: number;
    costByMonth: Array<{ month: string; amount: number }>;
    averageCostPerVisit: number;
    costByPaymentMethod: Array<{ method: string; amount: number }>;
}

export interface MedicalHistoryTimeline {
    appointments: Array<{
        date: Date;
        doctorName: string;
        hospitalName: string;
        diagnosis: string;
        prescriptions: Array<{
            medicineName: string;
            dosage: string;
        }>;
    }>;
}

export interface HealthAnalytics {
    visitStats: VisitStats;
    costAnalysis: CostAnalysis;
    medicalHistory: MedicalHistoryTimeline;
}
