import { Check, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'participants' })
@Check('chk_participants_unit_picked', `"unit_picked" IN ('imperial', 'metric')`)
export class ParticipantEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 30 })
  phone!: string;

  @Column({ type: 'float', name: 'weight_in_libs' })
  weightInLibs!: number;

  @Column({ type: 'float', name: 'height_in_inches' })
  heightInInches!: number;

  @Column({ type: 'float', name: 'weight_in_kilos' })
  weightInKilos!: number;

  @Column({ type: 'float', name: 'heignt_in_meters' })
  heigntInMeters!: number;

  @Column({ type: 'varchar', length: 10, name: 'unit_picked' })
  unitPicked!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'creation_date' })
  creationDate!: Date;

  @Column({ type: 'float' })
  bmi!: number;

  @Column({ type: 'timestamptz' })
  birthday!: Date;
}
