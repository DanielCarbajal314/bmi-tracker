// What the promise rejected with. Fails when it resolves, which `await expect().rejects` does
// not say in its types.
export async function rejectionOf(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error: unknown) {
    return error;
  }
  throw new Error('Expected the promise to reject, but it resolved');
}
