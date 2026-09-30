/**
 * Name of the anti-spam trap field. Deliberately not an autocomplete token (`nickname`, `name`,
 * `email`...): Safari AutoFill or a password manager could fill such a field and silently turn
 * a real lead into a fake success.
 */
export const HONEYPOT_FIELD = 'hp_extra';
