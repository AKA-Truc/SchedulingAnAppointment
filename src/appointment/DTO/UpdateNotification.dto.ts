import { PartialType } from '@nestjs/swagger';
import { CreateNotification } from './CreateNotification.dto';

export class UpdateNotification extends PartialType(CreateNotification) { }
