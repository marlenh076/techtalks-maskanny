export class AdminError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
export function databaseError(error: { code: string; message: string }, operation = "unspecified"): never {
  // Log only stable diagnostic metadata. Database messages and details can
  // contain user input, payment references, or other private values.
  console.error("[admin.database] " + JSON.stringify({
    operation,
    code: error.code,
    category: error.code === "PGRST202" ? "rpc_unavailable" : "database_error",
  }));
  if (error.code === "42501" || error.code === "M4030")
    throw new AdminError("Forbidden", 403);
  if (error.code.startsWith("M404"))
    throw new AdminError("Resource not found", 404);
  if (error.code.startsWith("M409")) throw new AdminError(error.message, 409);
  if (["23505", "23503", "40001", "40P01"].includes(error.code))
    throw new AdminError("Conflicting operation; refresh before retrying", 409);
  if (
    ["22023", "22P02", "22007", "22008", "23514", "23502"].includes(error.code)
  )
    throw new AdminError("Invalid input or state", 400);
  throw new AdminError("Database operation failed", 500);
}
