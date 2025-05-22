import { PartialType } from '@nestjs/swagger';
import { CreateFollowUp } from './CreateFollowUp.dto';

export class UpdateFollowUp extends PartialType(CreateFollowUp) { }
