export abstract class DatabaseCheck {
  // Resolves when the database answers, rejects otherwise.
  abstract ping(): Promise<void>;
}
