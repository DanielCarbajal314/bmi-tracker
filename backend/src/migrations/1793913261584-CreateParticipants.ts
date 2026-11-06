import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateParticipants1793913261584 implements MigrationInterface {
    name = 'CreateParticipants1793913261584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "participants" ("id" SERIAL NOT NULL, "first_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(30) NOT NULL, "weight_in_libs" double precision NOT NULL, "height_in_inches" double precision NOT NULL, "weight_in_kilos" double precision NOT NULL, "heignt_in_meters" double precision NOT NULL, "unit_picked" character varying(10) NOT NULL, "creation_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "bmi" double precision NOT NULL, "birthday" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "chk_participants_unit_picked" CHECK ("unit_picked" IN ('imperial', 'metric')), CONSTRAINT "PK_1cda06c31eec1c95b3365a0283f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "participants"`);
    }

}
