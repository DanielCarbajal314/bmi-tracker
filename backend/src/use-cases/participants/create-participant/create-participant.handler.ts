import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AppUnitOfWork } from '#persistency/transactions/app/app.unit-of-work';
import type { ParticipantContract } from '../participant.contract';
import { toParticipantContract } from '../participant.mapper';
import { birthdayFromAge } from './birthday.calculator';
import { CreateParticipantCommand } from './create-participant.command';
import { calculateMeasurements } from './measurements.calculator';

@CommandHandler(CreateParticipantCommand)
export class CreateParticipantHandler
  implements ICommandHandler<CreateParticipantCommand, ParticipantContract>
{
  constructor(@Inject(AppUnitOfWork) private readonly unitOfWork: AppUnitOfWork) {}

  async execute({ input }: CreateParticipantCommand): Promise<ParticipantContract> {
    const measurements = calculateMeasurements(input);
    const birthday = birthdayFromAge(input.age, new Date());

    const participant = await this.unitOfWork.execute(({ participants }) =>
      participants.create({
        firstName: input.firstName,
        email: input.email,
        phone: input.phone,
        unitPicked: input.unitPicked,
        weightInLibs: measurements.weightInLbs,
        weightInKilos: measurements.weightInKilos,
        heightInInches: measurements.heightInInches,
        heigntInMeters: measurements.heightInMeters,
        bmi: measurements.bmi,
        birthday,
      }),
    );

    return toParticipantContract(participant);
  }
}
