import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleEnum } from 'prisma/generated/mongodb';
import { MongoPrismaService } from 'src/prisma/mongo-prisma.service';
@Injectable()
export class ReviewHospitalService {
  constructor(private readonly prisma: MongoPrismaService) {}

  async createReview(data: {
    comment: string;
    rating: number;
    userId: number;
    doctorId?: number;
    hospitalId?: number;
    role: RoleEnum;
    parentId?: string;
  }) {
    return this.prisma.review.create({ data });
  }

  async getHospitalReviews(hospitalId: number) {
    return this.prisma.review.findMany({
      where: { hospitalId, isVisible: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async replyToReview(
    parentId: string,
    replyData: Omit<Parameters<typeof this.createReview>[0], 'parentId'>,
  ) {
    const parent = await this.prisma.review.findUnique({ where: { id: parentId } });
    if (!parent) throw new NotFoundException('Parent review not found');
    return this.createReview({ ...replyData, parentId });
  }

  async flagReview(id: string, reason: string) {
    return this.prisma.review.update({
      where: { id },
      data: {
        isFlagged: true,
        flaggedReason: reason,
      },
    });
  }

  async deleteReview(id: string) {
    return this.prisma.review.delete({ where: { id } });
  }
}
