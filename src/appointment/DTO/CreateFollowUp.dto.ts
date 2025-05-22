import { IsInt, IsString, IsDateString } from 'class-validator';

export class CreateFollowUp {
  @IsInt()
  appointmentId: number;

  @IsDateString()
  nextDate: string;

  @IsString()
  reason: string;
}
