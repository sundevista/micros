export function defaultResetMailTemplate(url: string, token: string): string {
  return `
    <h1>Password Reset Request for app.com</h1>
    <p>We got password reset request for this email. If it wasn't sent by you. Ignore this mail, otherwise visit <a href='${url}?token=${token}' alt='link to resetting'>this link</a> to reset your password.</p>
  `;
}
