/**
 * Creates successful deletion message for HTTP DELETE handlers
 * @param {string} id id to include in message
 */
export function getSuccessfulDeletionMessage(id) {
  return `User with id: ${id} was successfully deleted`;
}

export const DEFAULT_PORT = 9090;
