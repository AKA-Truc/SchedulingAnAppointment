import { PartialType } from '@nestjs/swagger';
import { CreateAppointment } from './CreateAppointment.dto';

export class UpdateAppointment extends PartialType(CreateAppointment) { }
