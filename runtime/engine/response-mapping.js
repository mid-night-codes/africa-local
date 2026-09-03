/**
 * Maps a canonical result ({status, reason}) to a provider-specific response fragment using
 * that provider's mappings/statuses.yaml and mappings/errors.yaml (§12). A reason-specific
 * mapping always wins over the generic status mapping so "FAILED" scenarios can each carry their
 * own provider error code.
 */
export function mapCanonicalResult(mappings, status, reason) {
  const statusMapping = mappings.statuses?.[status] ?? { responseCode: "1", responseMessage: status };
  const reasonMapping = reason ? mappings.errors?.[reason] : undefined;
  return { ...statusMapping, ...reasonMapping };
}
