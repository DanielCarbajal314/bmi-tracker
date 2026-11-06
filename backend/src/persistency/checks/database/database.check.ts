export abstract class DatabaseProbe {
  // Resolves when the database answers, rejects otherwise.
  abstract ping(): Promise<void>;
}
