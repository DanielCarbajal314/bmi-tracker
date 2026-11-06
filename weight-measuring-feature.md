# Weight Measuring Feature

## Overview

Capture participant data and calculate each participant's Body Mass Index (BMI). The record creation date is stored with every participant.

## Participant Data

| Field     | Notes                                      |
| --------- | ------------------------------------------ |
| FirstName |                                            |
| LastName  |                                            |
| Email     |                                            |
| Phone     |                                            |
| Weight    | Pick unit: pounds (lb) or kilograms (kg)   |
| Height    | Pick unit: inches (in) or meters (m)       |
| Birthdate |                                            |

## BMI Calculation

The logic must calculate BMI correctly for both unit systems:

- **Metric** (kg / m): `BMI = weightKg / heightM²`
- **Imperial** (lb / in): `BMI = (weightLb / heightIn²) × 703`

If weight is in pounds and height is in inches, multiply by **703**.

## API Endpoints

| Method | Endpoint | Description                                                                 |
| ------ | -------- | --------------------------------------------------------------------------- |
| `POST` | `/participants`      | Store Participant. Returns all calculations and the assigned ID.            |
| `GET`  | `/participants`      | Returns all Participants. Optional filter by **min** and **max** BMI. Paginated. |

## Database Table

| Column         | Type     |
| -------------- | -------- |
| Id             | int      |
| FirstName      | varchar  |
| Email          | varchar  |
| Phone          | varchar  |
| WeightInLibs   | float    |
| HeightInInches | float    |
| WeightInKilos  | float    |
| HeigntInMeters | float    |
| UnitPicked     | varchar  |
| CreationDate   | datetime |
| BMI            | float    |
| Birthdate       | datetime |

**Database:** PostgreSQL

## Backend: NestJS

Object-oriented design with a REST API.

**Stack**

- Bun
- TypeORM
- Zod for type validation
- OpenAPI

**Patterns**

- Unit of Work + Repository
- CQS (Command and Query) with a Mediator
- Heavy reliance on Dependency Injection

## Frontend: Vite + React

Functional-oriented code.

**Stack**

- TypeScript
- Prettier
- React Testing Library
- TanStack with React Query
- Tailwind + shadcn/ui

**Patterns**

- Custom hooks to isolate logic
- Small, reusable components

## Monorepo

Fully containerized developer environment.

```text
.
├── frontend/
├── backend/            # 2 containers: one runs the app, one runs the migration
├── infrastructure/.    # Terraform with AWS, separate in diferent files
├── cicd/               # Github Actions that calls make file commands
├── .env.example
├── docker-compose.yml  # database: PostgreSQL
└── Makefile
```
