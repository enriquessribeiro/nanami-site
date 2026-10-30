/** Junta classes condicionais sem dependência externa. */
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
