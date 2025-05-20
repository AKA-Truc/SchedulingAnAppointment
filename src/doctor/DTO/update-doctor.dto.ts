import { PartialType } from '@nestjs/swagger';
import { CreateDoctor } from './create-doctor.dto';

export class UpdateDoctor extends PartialType(CreateDoctor) {}
