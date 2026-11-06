// Domain errors know nothing about HTTP: the router layer maps them to a status.
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {}

export class ConflictError extends DomainError {}

export class BusinessRuleError extends DomainError {}
