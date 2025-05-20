import { PartialType } from '@nestjs/swagger';
import { CreateHospital } from './create-hospital.dto';

export class UpdateHospital extends PartialType(CreateHospital) {}
