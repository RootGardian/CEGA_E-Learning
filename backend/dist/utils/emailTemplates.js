"use strict";
/**
 * Professional HTML Email Templates for CEGA E-Learning
 * Inspired by Fortinet, LinkedIn, and enterprise-grade email design standards.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentConfirmationEmail = exports.resetPasswordEmail = exports.welcomeEmail = void 0;
const BRAND = {
    name: 'CEGA E-Learning',
    color: '#0D6E3F', // Primary green
    colorDark: '#094D2C',
    colorLight: '#E8F5EE',
    textDark: '#1A1A2E',
    textMuted: '#6B7280',
    bgLight: '#F9FAFB',
    borderColor: '#E5E7EB',
    year: new Date().getFullYear(),
};
// ─────────────────────────────────────────────
// Shared layout wrapper
// ─────────────────────────────────────────────
const wrapLayout = (bodyContent) => {
    const frontendUrl = process.env.FRONTEND_URL || 'https://cega-elearning.com';
    return `
<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${BRAND.name}</title>
  <!--[if mso]>
  <style>table,td,div,p,a{font-family:Arial,Helvetica,sans-serif !important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgLight};font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bgLight};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <!-- Email container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.color} 0%, ${BRAND.colorDark} 100%);padding:32px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:72px;height:72px;background:#ffffff;border-radius:12px;display:inline-block;margin-bottom:12px;overflow:hidden;padding:4px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                      <img src="${frontendUrl}/logo_cega.jpeg" alt="${BRAND.name} Logo" style="width:100%;height:100%;object-fit:contain;display:block;border-radius:8px;" />
                    </div>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">${BRAND.name}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:1px;text-transform:uppercase;">Plateforme d'apprentissage en ligne</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid ${BRAND.borderColor};margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px 36px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${BRAND.textMuted};line-height:1.6;">
                Cet email a été envoyé automatiquement par <strong>${BRAND.name}</strong>.<br/>
                Veuillez ne pas répondre à ce message.
              </p>
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.6;">
                © ${BRAND.year} CEGA — Centre d'Expertise en Géosciences et Applications.<br/>
                Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>

        <!-- Unsubscribe / info link -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:20px 0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;">
                Si vous n'êtes pas à l'origine de cette action, vous pouvez ignorer cet email en toute sécurité.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
};
// ─────────────────────────────────────────────
// 1. Welcome email (after registration)
// ─────────────────────────────────────────────
const welcomeEmail = (firstName, loginUrl) => {
    const subject = `Bienvenue sur ${BRAND.name}, ${firstName} !`;
    const text = `Bonjour ${firstName},\n\nBienvenue sur ${BRAND.name} ! Votre compte a été créé avec succès.\n\nPour finaliser votre inscription, veuillez procéder au paiement de vos frais de scolarité afin d'activer votre accès aux cours.\n\nConnectez-vous ici : ${loginUrl}\n\nCordialement,\nL'équipe ${BRAND.name}`;
    const html = wrapLayout(`
    <!-- Greeting -->
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.textDark};">
      Bienvenue, ${firstName} 
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      Nous sommes ravis de vous accueillir sur <strong>${BRAND.name}</strong>.
    </p>

    <!-- Info card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.colorLight};border-radius:8px;border-left:4px solid ${BRAND.color};margin-bottom:28px;">
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${BRAND.textDark};">Votre compte a été créé avec succès</p>
          <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.5;">
            Pour accéder à l'ensemble des cours et ressources pédagogiques, veuillez finaliser votre inscription en procédant au paiement de vos frais de scolarité.
          </p>
        </td>
      </tr>
    </table>

    <!-- What you get -->
    <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:${BRAND.textDark};">Ce qui vous attend :</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};line-height:1.5;">
          <span style="color:${BRAND.color};font-weight:700;margin-right:8px;">✓</span> Accès illimité à tous les cours de votre filière
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};line-height:1.5;">
          <span style="color:${BRAND.color};font-weight:700;margin-right:8px;">✓</span> Suivi de progression personnalisé
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};line-height:1.5;">
          <span style="color:${BRAND.color};font-weight:700;margin-right:8px;">✓</span> Évaluations et quiz interactifs
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};line-height:1.5;">
          <span style="color:${BRAND.color};font-weight:700;margin-right:8px;">✓</span> Notifications en temps réel
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom:8px;">
          <a href="${loginUrl}" target="_blank" style="display:inline-block;padding:14px 36px;background:${BRAND.color};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.3px;mso-padding-alt:0;">
            <!--[if mso]><i style="letter-spacing:36px;mso-font-width:-100%;mso-text-raise:21pt">&nbsp;</i><![endif]-->
            Accéder à mon espace
            <!--[if mso]><i style="letter-spacing:36px;mso-font-width:-100%">&nbsp;</i><![endif]-->
          </a>
        </td>
      </tr>
    </table>

    <!-- Sign-off -->
    <p style="margin:28px 0 0;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Cordialement,<br/>
      <strong>L'équipe ${BRAND.name}</strong>
    </p>
  `);
    return { subject, text, html };
};
exports.welcomeEmail = welcomeEmail;
// ─────────────────────────────────────────────
// 2. Password reset email
// ─────────────────────────────────────────────
const resetPasswordEmail = (firstName, resetUrl) => {
    const subject = `${BRAND.name} — Réinitialisation de votre mot de passe`;
    const text = `Bonjour ${firstName},\n\nNous avons reçu une demande de réinitialisation du mot de passe associé à votre compte ${BRAND.name}.\n\nCliquez sur ce lien pour créer un nouveau mot de passe (valide 10 minutes) : ${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email. Votre compte est en sécurité.\n\nCordialement,\nL'équipe ${BRAND.name}`;
    const html = wrapLayout(`
    <!-- Greeting -->
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.textDark};">
      Réinitialisation du mot de passe
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      Bonjour <strong>${firstName}</strong>,
    </p>

    <p style="margin:0 0 20px;font-size:14px;color:${BRAND.textDark};line-height:1.7;">
      Nous avons reçu une demande de réinitialisation du mot de passe associé à votre compte <strong>${BRAND.name}</strong>. 
      Si vous êtes à l'origine de cette demande, cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
    </p>

    <!-- Warning card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FEF3C7;border-radius:8px;border-left:4px solid #F59E0B;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#92400E;line-height:1.5;">
            <strong>⏱ Ce lien expire dans 10 minutes.</strong><br/>
            Pour des raisons de sécurité, cette demande de réinitialisation est valide pendant une durée limitée.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td align="center">
          <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 36px;background:${BRAND.color};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.3px;mso-padding-alt:0;">
            <!--[if mso]><i style="letter-spacing:36px;mso-font-width:-100%;mso-text-raise:21pt">&nbsp;</i><![endif]-->
            Réinitialiser mon mot de passe
            <!--[if mso]><i style="letter-spacing:36px;mso-font-width:-100%">&nbsp;</i><![endif]-->
          </a>
        </td>
      </tr>
    </table>

    <!-- Fallback link -->
    <p style="margin:0 0 20px;font-size:12px;color:${BRAND.textMuted};line-height:1.6;word-break:break-all;">
      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur&nbsp;:<br/>
      <a href="${resetUrl}" style="color:${BRAND.color};text-decoration:underline;">${resetUrl}</a>
    </p>

    <!-- Security notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bgLight};border-radius:8px;margin-bottom:20px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.5;">
             <strong>Vous n'avez pas fait cette demande ?</strong><br/>
            Si vous n'êtes pas à l'origine de cette action, ignorez simplement cet email. Aucune modification ne sera apportée à votre compte.
          </p>
        </td>
      </tr>
    </table>

    <!-- Sign-off -->
    <p style="margin:0;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Cordialement,<br/>
      <strong>L'équipe Sécurité ${BRAND.name}</strong>
    </p>
  `);
    return { subject, text, html };
};
exports.resetPasswordEmail = resetPasswordEmail;
// ─────────────────────────────────────────────
// 3. Payment confirmation email
// ─────────────────────────────────────────────
const paymentConfirmationEmail = (firstName, amount, currency, transactionId, dashboardUrl) => {
    const subject = `${BRAND.name} — Confirmation de paiement`;
    const formattedAmount = amount.toLocaleString('fr-FR');
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const text = `Bonjour ${firstName},\n\nVotre paiement de ${formattedAmount} ${currency} a été traité avec succès.\n\nRéférence : ${transactionId}\nDate : ${date}\n\nVotre abonnement est maintenant actif. Accédez à vos cours : ${dashboardUrl}\n\nCordialement,\nL'équipe ${BRAND.name}`;
    const html = wrapLayout(`
    <!-- Greeting -->
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${BRAND.textDark};">
      Paiement confirmé 
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textMuted};line-height:1.6;">
      Bonjour <strong>${firstName}</strong>, merci pour votre paiement !
    </p>

    <!-- Receipt card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bgLight};border-radius:8px;border:1px solid ${BRAND.borderColor};margin-bottom:28px;">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 16px;font-size:14px;font-weight:600;color:${BRAND.textDark};text-transform:uppercase;letter-spacing:0.5px;">Récapitulatif</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;font-size:13px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};">Montant</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;color:${BRAND.textDark};text-align:right;border-bottom:1px solid ${BRAND.borderColor};">${formattedAmount} ${currency}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};">Date</td>
              <td style="padding:8px 0;font-size:14px;color:${BRAND.textDark};text-align:right;border-bottom:1px solid ${BRAND.borderColor};">${date}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.borderColor};">Référence</td>
              <td style="padding:8px 0;font-size:12px;color:${BRAND.textDark};text-align:right;border-bottom:1px solid ${BRAND.borderColor};font-family:monospace;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:${BRAND.textMuted};">Statut</td>
              <td style="padding:8px 0;font-size:14px;text-align:right;">
                <span style="background:${BRAND.colorLight};color:${BRAND.color};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">Confirmé</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Success notice -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.colorLight};border-radius:8px;border-left:4px solid ${BRAND.color};margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:${BRAND.colorDark};line-height:1.5;">
            <strong> Votre abonnement est maintenant actif !</strong><br/>
            Vous avez désormais accès à l'ensemble des cours et ressources de votre filière pour une durée de 6 mois.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td align="center">
          <a href="${dashboardUrl}" target="_blank" style="display:inline-block;padding:14px 36px;background:${BRAND.color};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.3px;">
            Accéder à mes cours
          </a>
        </td>
      </tr>
    </table>

    <!-- Sign-off -->
    <p style="margin:0;font-size:14px;color:${BRAND.textMuted};line-height:1.6;">
      Cordialement,<br/>
      <strong>L'équipe ${BRAND.name}</strong>
    </p>
  `);
    return { subject, text, html };
};
exports.paymentConfirmationEmail = paymentConfirmationEmail;
