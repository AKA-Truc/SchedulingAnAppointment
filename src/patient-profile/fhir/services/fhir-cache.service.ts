import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FHIRService } from './fhir.service';
import { MongoPrismaService } from '../../../prisma/mongo-prisma.service';

@Injectable()
export class FhirCacheService {
    private readonly logger = new Logger(FhirCacheService.name);

    constructor(
        private readonly fhirService: FHIRService,
        private readonly mongoPrisma: MongoPrismaService,
    ) { }

    // 🔁 Cron job: chạy mỗi 30 phút
    @Cron(CronExpression.EVERY_30_MINUTES)
    async cacheObservationsAndConditions() {
        this.logger.log('⏳ Cron job bắt đầu: cache Observations & Conditions');

        try {
            const patients = await this.fhirService.searchPatients({});

            for (const patient of patients) {
                const patientId = patient.id;
                if (!patientId) continue; // Bỏ qua nếu không có ID

                await this.cacheResources('Observation', patientId);
                await this.cacheResources('Condition', patientId);
            }

            this.logger.log('✅ Đã cache xong tất cả observations và conditions');
        } catch (error) {
            this.logger.error('❌ Lỗi khi cache dữ liệu FHIR:', error);
        }
    }

    private async cacheResources(
        resourceType: 'Observation' | 'Condition',
        patientId: string
    ) {
        const fetchFn =
            resourceType === 'Observation'
                ? this.fhirService.searchObservations.bind(this.fhirService)
                : this.fhirService.searchConditions.bind(this.fhirService);

        const resources = await fetchFn(patientId);

        for (const res of resources) {
            const resourceId = res.id;
            if (!resourceId) continue;

            const existing = await this.mongoPrisma.fHIRResource.findFirst({
                where: {
                    resourceType,
                    resourceId,
                    patientId
                }
            });

            if (!existing) {
                await this.mongoPrisma.fHIRResource.create({
                    data: {
                        resourceType,
                        resourceId,
                        resourceData: res,
                        versionId: '1',
                        patientId,
                        source: 'cron'
                    }
                });
            }
        }
    }
}
