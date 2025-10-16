import { components, internal } from "./_generated/api";
import { Resend, vEmailId, vEmailEvent } from "@convex-dev/resend";
import { internalMutation, action } from "./_generated/server";
import { v } from "convex/values";

export const resend: Resend = new Resend(components.resend, {
  onEmailEvent: internal.sendEmails.handleEmailEvent,
  testMode: false, // allow real sends when the feature is on
});

// Determine whether email sending should be attempted at all.
// Honors project feature flags synced into env and also falls back to API key presence.
const isEmailEnabled = (): boolean => {
  if (process.env.EMAIL_ENABLED === "true") return true;
  if (process.env.RESEND_ENABLED === "true") return true;
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 0) return true;
  return false;
};

const COMPANY_NAME = process.env.COMPANY_NAME || "BuyMeADrink";
const DEFAULT_FROM_EMAIL =
  process.env.SENDER_EMAIL || "no-reply@buymeadrink.app";

const formatCurrency = (amountCents: number, currency: string): string => {
  const value = (amountCents / 100).toFixed(2);
  return `${currency.toUpperCase()} ${value}`;
};

const wrapEmail = (title: string, content: string): string => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:32px;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e5e5e5;">
      <tr>
        <td>
          <h1 style="margin:0 0 16px 0;font-size:24px;color:#111;">${title}</h1>
          ${content}
          <p style="margin-top:32px;font-size:13px;color:#777;">Sent by ${COMPANY_NAME}. Need help? Reply to this email.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const toPlainText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

type GiftReceiptEmailInput = {
  fanName: string;
  creatorName: string;
  giftTitle: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  message?: string | null;
};

type CreatorGiftAlertEmailInput = {
  creatorName: string;
  fanName: string;
  giftTitle: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  message?: string | null;
};

type TierSignupEmailInput = {
  fanName: string;
  creatorName: string;
  tierName: string;
  price: number;
  currency: string;
  perks?: string[];
};

type PayoutSummaryEmailInput = {
  creatorName: string;
  periodLabel: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  totalGifts: number;
  payoutLink?: string;
};

export const buildGiftReceiptEmail = (
  input: GiftReceiptEmailInput
): { subject: string; html: string; text: string } => {
  const { fanName, creatorName, giftTitle, quantity, totalAmount, currency, message } =
    input;

  const body = `
          <p style="margin:0 0 16px 0;font-size:16px;">Hi ${fanName || "there"},</p>
          <p style="margin:0 0 16px 0;font-size:16px;">Thanks for buying ${quantity} × ${giftTitle} for ${creatorName}. They will see your support right away.</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="padding:8px 0;font-weight:bold;">Order total</td>
              <td style="padding:8px 0;text-align:right;">${formatCurrency(
                totalAmount,
                currency
              )}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;">Quantity</td>
              <td style="padding:8px 0;text-align:right;">${quantity}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;">Gift</td>
              <td style="padding:8px 0;text-align:right;">${giftTitle}</td>
            </tr>
          </table>
          ${
            message
              ? `<div style="margin:16px 0;padding:16px;background:#f1f5f9;border-radius:12px;">
                <p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;">Your message</p>
                <p style="margin:0;font-size:15px;white-space:pre-wrap;">${message}</p>
              </div>`
              : ""
          }
          <p style="margin:16px 0 0 0;font-size:15px;color:#444;">You will see ${COMPANY_NAME} on your bank statement. Need help? Reply to this email.</p>
  `;

  const html = wrapEmail("Thanks for your gift!", body);
  return {
    subject: `You just supported ${creatorName}`,
    html,
    text: toPlainText(html),
  };
};

export const buildCreatorGiftAlertEmail = (
  input: CreatorGiftAlertEmailInput
): { subject: string; html: string; text: string } => {
  const { creatorName, fanName, giftTitle, quantity, totalAmount, currency, message } =
    input;

  const body = `
          <p style="margin:0 0 16px 0;font-size:16px;">Hi ${creatorName},</p>
          <p style="margin:0 0 16px 0;font-size:16px;">${fanName || "Someone"} just bought ${quantity} × ${giftTitle}.</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="padding:8px 0;font-weight:bold;">Total</td>
              <td style="padding:8px 0;text-align:right;">${formatCurrency(
                totalAmount,
                currency
              )}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;">Fan</td>
              <td style="padding:8px 0;text-align:right;">${fanName || "Anonymous"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;">Gift</td>
              <td style="padding:8px 0;text-align:right;">${giftTitle}</td>
            </tr>
          </table>
          ${
            message
              ? `<div style="margin:16px 0;padding:16px;background:#fef3c7;border-radius:12px;">
                <p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;">Message</p>
                <p style="margin:0;font-size:15px;white-space:pre-wrap;">${message}</p>
              </div>`
              : ""
          }
          <p style="margin:16px 0 0 0;font-size:15px;color:#444;">Check your dashboard for the latest running total.</p>
  `;

  const html = wrapEmail("New fan support received", body);
  return {
    subject: `${fanName || "A fan"} sent you a gift`,
    html,
    text: toPlainText(html),
  };
};

export const buildTierSignupEmail = (
  input: TierSignupEmailInput
): { subject: string; html: string; text: string } => {
  const { fanName, creatorName, tierName, price, currency, perks } = input;

  const perksMarkup =
    perks && perks.length > 0
      ? `<ul style="margin:0;padding-left:20px;font-size:15px;color:#444;">
          ${perks
            .map(
              (perk) =>
                `<li style="margin-bottom:8px;">${perk}</li>`
            )
            .join("")}
        </ul>`
      : `<p style="margin:0;font-size:15px;color:#444;">Perks will be shared soon.</p>`;

  const body = `
          <p style="margin:0 0 16px 0;font-size:16px;">Hi ${fanName || "there"},</p>
          <p style="margin:0 0 16px 0;font-size:16px;">Thanks for joining the ${tierName} tier for ${creatorName}.</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="padding:8px 0;font-weight:bold;">Amount</td>
              <td style="padding:8px 0;text-align:right;">${formatCurrency(
                price,
                currency
              )} / month</td>
            </tr>
            <tr>
              <td style="padding:8px 0;">Creator</td>
              <td style="padding:8px 0;text-align:right;">${creatorName}</td>
            </tr>
          </table>
          <div style="margin:16px 0;">
            <p style="margin:0 0 8px 0;font-size:15px;font-weight:bold;">Your perks</p>
            ${perksMarkup}
          </div>
          <p style="margin:16px 0 0 0;font-size:15px;color:#444;">You can manage this plan any time through your account.</p>
  `;

  const html = wrapEmail(`You joined the ${tierName} tier`, body);
  return {
    subject: `Welcome to ${tierName} for ${creatorName}`,
    html,
    text: toPlainText(html),
  };
};

export const buildPayoutSummaryEmail = (
  input: PayoutSummaryEmailInput
): { subject: string; html: string; text: string } => {
  const {
    creatorName,
    periodLabel,
    grossAmount,
    platformFee,
    netAmount,
    currency,
    totalGifts,
    payoutLink,
  } = input;

  const body = `
          <p style="margin:0 0 16px 0;font-size:16px;">Hi ${creatorName},</p>
          <p style="margin:0 0 16px 0;font-size:16px;">Here is your ${periodLabel} summary.</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="padding:8px 0;font-weight:bold;">Total gifts</td>
              <td style="padding:8px 0;text-align:right;">${totalGifts}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;">Gross amount</td>
              <td style="padding:8px 0;text-align:right;">${formatCurrency(
                grossAmount,
                currency
              )}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;">Platform fee</td>
              <td style="padding:8px 0;text-align:right;">${formatCurrency(
                platformFee,
                currency
              )}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-weight:bold;">Net earnings</td>
              <td style="padding:8px 0;text-align:right;">${formatCurrency(
                netAmount,
                currency
              )}</td>
            </tr>
          </table>
          ${
            payoutLink
              ? `<p style="margin:16px 0 0 0;font-size:15px;">Request a payout here: <a href="${payoutLink}" style="color:#2563eb;">Open payouts dashboard</a></p>`
              : `<p style="margin:16px 0 0 0;font-size:15px;">Request a payout any time from your dashboard.</p>`
          }
  `;

  const html = wrapEmail(`${periodLabel} payout summary`, body);
  return {
    subject: `${periodLabel} payout summary`,
    html,
    text: toPlainText(html),
  };
};

export const handleEmailEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (ctx, args) => {
    console.log("Email event received:", args.id, args.event);
    // Handle email events here (deliveries, bounces, etc.)
    // You can update your database or trigger other actions based on the event
  },
});

export const sendTestEmail = internalMutation({
  handler: async (ctx) => {
    if (!isEmailEnabled()) {
      console.log("📭 Email disabled; skipping test email send");
      return;
    }

    await resend.sendEmail(
      ctx,
      `${COMPANY_NAME} <${DEFAULT_FROM_EMAIL}>`,
      "delivered@resend.dev",
      `Test email from ${COMPANY_NAME}`,
      `<h1>Test email</h1><p>This message confirms ${COMPANY_NAME} can send email through Resend.</p>`
    );
  },
});

export const sendTestEmailToAddress = action({
  args: { 
    toEmail: v.string(),
    subject: v.optional(v.string()),
    message: v.optional(v.string())
  },
  handler: async (ctx, { toEmail, subject, message }) => {
    // Check if user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be authenticated to send test emails");
    }

    if (!isEmailEnabled()) {
      throw new Error("Email sending is currently turned off");
    }

    const fromEmail =
      process.env.SENDER_EMAIL || process.env.SUPPORT_EMAIL || DEFAULT_FROM_EMAIL;
    
    try {
      await resend.sendEmail(
        ctx,
        `${COMPANY_NAME} <${fromEmail}>`,
        toEmail,
        subject || `Test email from ${COMPANY_NAME}`,
        message ||
          `<h1>${COMPANY_NAME}</h1><p>This is a simple test message. If you received it, email is working.</p>`
      );
      
      return { success: true, message: "Test email sent successfully!" };
    } catch (error) {
      console.error("Failed to send test email:", error);
      throw new Error("Failed to send test email. Check your email configuration.");
    }
  },
});

export const sendWelcomeEmail = internalMutation({
  args: { email: v.string(), name: v.string() },
  handler: async (ctx, { email, name }) => {
    // Respect config toggle: do not send if email feature disabled
    if (!isEmailEnabled()) {
      console.log(
        "📭 Email disabled by config; skipping welcome email for",
        email
      );
      return;
    }
    const fromEmail =
      process.env.SENDER_EMAIL || process.env.SUPPORT_EMAIL || DEFAULT_FROM_EMAIL;
    
    await resend.sendEmail(
      ctx,
      `${COMPANY_NAME} <${fromEmail}>`,
      email,
      `Welcome to ${COMPANY_NAME}, ${name}!`,
      `<h1>Welcome aboard, ${name}!</h1><p>We're excited to have you with us at ${COMPANY_NAME}.</p>`
    );
  },
});

export const sendCreatorWelcomeEmail = internalMutation({
  args: { 
    email: v.string(), 
    name: v.string(), 
    handle: v.string(),
    profileUrl: v.string()
  },
  handler: async (ctx, { email, name, handle, profileUrl }) => {
    // Respect config toggle: do not send if email feature disabled
    if (!isEmailEnabled()) {
      console.log(
        "📭 Email disabled by config; skipping creator welcome email for",
        email
      );
      return;
    }
    
    const fromEmail =
      process.env.SENDER_EMAIL || process.env.SUPPORT_EMAIL || DEFAULT_FROM_EMAIL;
    
    const subject = `🎉 Welcome to ${COMPANY_NAME}, ${name}! Your creator profile is ready`;
    
    const content = `
      <h1>🎉 Welcome to ${COMPANY_NAME}, ${name}!</h1>
      
      <p>Congratulations! Your creator profile is now live and ready for fans to discover and support you.</p>
      
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;">
        <h3 style="margin-top:0;">Your Profile Details:</h3>
        <ul style="margin:0;">
          <li><strong>Handle:</strong> @${handle}</li>
          <li><strong>Profile URL:</strong> <a href="${profileUrl}" style="color:#10b981;">${profileUrl}</a></li>
        </ul>
      </div>
      
      <h3>🚀 What's Next?</h3>
      <ul>
        <li><strong>Share your profile:</strong> Let your fans know they can support you directly</li>
        <li><strong>Add more gifts:</strong> Create additional gift options for different price points</li>
        <li><strong>Set up support tiers:</strong> Offer monthly subscription options for recurring support</li>
        <li><strong>Connect social media:</strong> Link your other platforms to drive traffic</li>
      </ul>
      
      <div style="text-align:center;margin:30px 0;">
        <a href="${profileUrl}" style="background:#10b981;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">View Your Profile</a>
      </div>
      
      <h3>💡 Pro Tips:</h3>
      <ul>
        <li>Share your profile link in your social media bios</li>
        <li>Create gifts that reflect your personality and content</li>
        <li>Engage with fans who send you gifts - they love personal messages!</li>
        <li>Use support tiers to offer exclusive content or perks</li>
      </ul>
      
      <p>If you have any questions or need help getting started, just reply to this email. We're here to help you succeed!</p>
      
      <p>Happy creating!<br>The ${COMPANY_NAME} Team</p>
    `;
    
    await resend.sendEmail(
      ctx,
      `${COMPANY_NAME} <${fromEmail}>`,
      email,
      subject,
      content
    );
    
    console.log(`✅ Sent creator welcome email to ${name} (${email})`);
  },
});

export const sendGiftPurchaseNotifications = internalMutation({
  args: {
    creatorName: v.string(),
    creatorEmail: v.optional(v.string()),
    fanName: v.optional(v.string()),
    fanEmail: v.optional(v.string()),
    giftTitle: v.string(),
    quantity: v.number(),
    totalAmount: v.number(),
    currency: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      creatorName,
      creatorEmail,
      fanName,
      fanEmail,
      giftTitle,
      quantity,
      totalAmount,
      currency,
      message,
    }
  ) => {
    if (!isEmailEnabled()) {
      console.log("📭 Email disabled; skipping gift notifications");
      return;
    }

    const fromEmail =
      process.env.SENDER_EMAIL || process.env.SUPPORT_EMAIL || DEFAULT_FROM_EMAIL;

    if (fanEmail) {
      try {
        const receipt = buildGiftReceiptEmail({
          fanName: fanName || "there",
          creatorName,
          giftTitle,
          quantity,
          totalAmount,
          currency,
          message,
        });

        await resend.sendEmail(
          ctx,
          `${COMPANY_NAME} <${fromEmail}>`,
          fanEmail,
          receipt.subject,
          receipt.html,
          receipt.text
        );
      } catch (error) {
        console.error("Failed to send fan gift receipt:", error);
      }
    }

    if (creatorEmail) {
      try {
        const creatorAlert = buildCreatorGiftAlertEmail({
          creatorName,
          fanName: fanName || "Anonymous",
          giftTitle,
          quantity,
          totalAmount,
          currency,
          message,
        });

        await resend.sendEmail(
          ctx,
          `${COMPANY_NAME} <${fromEmail}>`,
          creatorEmail,
          creatorAlert.subject,
          creatorAlert.html,
          creatorAlert.text
        );
      } catch (error) {
        console.error("Failed to send creator gift alert:", error);
      }
    }
  },
});

export const sendTierSignupEmail = internalMutation({
  args: {
    fanEmail: v.optional(v.string()),
    fanName: v.optional(v.string()),
    creatorName: v.string(),
    tierName: v.string(),
    price: v.number(),
    currency: v.string(),
    perks: v.optional(v.array(v.string())),
  },
  handler: async (
    ctx,
    { fanEmail, fanName, creatorName, tierName, price, currency, perks }
  ) => {
    if (!isEmailEnabled()) {
      console.log("📭 Email disabled; skipping tier signup email");
      return;
    }

    if (!fanEmail) {
      console.log("ℹ️ No fan email for tier signup; skipping send");
      return;
    }

    const fromEmail =
      process.env.SENDER_EMAIL || process.env.SUPPORT_EMAIL || DEFAULT_FROM_EMAIL;

    const fanMessage = buildTierSignupEmail({
      fanName: fanName || "there",
      creatorName,
      tierName,
      price,
      currency,
      perks: perks && perks.length > 0 ? perks : undefined,
    });

    await resend.sendEmail(
      ctx,
      `${COMPANY_NAME} <${fromEmail}>`,
      fanEmail,
      fanMessage.subject,
      fanMessage.html,
      fanMessage.text
    );
  },
});

/**
 * Send monthly payout digest to creator
 */
export const sendPayoutDigest = action({
  args: {
    creatorName: v.string(),
    creatorEmail: v.optional(v.string()),
    month: v.number(),
    year: v.number(),
    earnings: v.object({
      totalEarnings: v.number(),
      giftEarnings: v.number(),
      subscriptionEarnings: v.number(),
      platformFee: v.number(),
      netEarnings: v.number(),
      giftCount: v.number(),
      subscriptionCount: v.number(),
      currency: v.string(),
    }),
  },
  handler: async (
    ctx,
    {
      creatorName,
      creatorEmail,
      month,
      year,
      earnings,
    }
  ) => {
    if (!isEmailEnabled()) {
      console.log("📭 Email disabled; skipping payout digest");
      return;
    }

    if (!creatorEmail) {
      console.log(`📭 No email for creator ${creatorName}; skipping payout digest`);
      return;
    }

    const fromEmail =
      process.env.SENDER_EMAIL || process.env.SUPPORT_EMAIL || DEFAULT_FROM_EMAIL;

    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount / 100);
    };

    const subject = `💰 Your ${monthName} ${year} Earnings Summary - ${COMPANY_NAME}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>${subject}</title>
      </head>
      <body style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#333;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;border-radius:12px;margin-bottom:24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:28px;font-weight:bold;">💰 Monthly Earnings Summary</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0 0;font-size:16px;">${monthName} ${year}</p>
        </div>
        
        <div style="background:#f8fafc;padding:24px;border-radius:8px;margin-bottom:24px;">
          <h2 style="margin:0 0 16px 0;font-size:20px;color:#1f2937;">Hi ${creatorName},</h2>
          <p style="margin:0 0 16px 0;font-size:16px;color:#4b5563;">Here's your earnings summary for ${monthName} ${year}. Your payout request has been created and will be processed manually.</p>
        </div>

        <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin-bottom:24px;">
          <h3 style="margin:0 0 20px 0;font-size:18px;color:#1f2937;">📊 Earnings Breakdown</h3>
          
          <div style="display:grid;gap:16px;">
            <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6;">
              <span style="font-weight:500;color:#374151;">Gift Sales</span>
              <span style="font-weight:600;color:#059669;">${formatCurrency(earnings.giftEarnings, earnings.currency)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6;">
              <span style="font-weight:500;color:#374151;">Subscriptions</span>
              <span style="font-weight:600;color:#059669;">${formatCurrency(earnings.subscriptionEarnings, earnings.currency)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6;">
              <span style="font-weight:500;color:#374151;">Platform Fee (5%)</span>
              <span style="font-weight:600;color:#dc2626;">-${formatCurrency(earnings.platformFee, earnings.currency)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:16px 0;background:#f8fafc;border-radius:6px;margin-top:8px;">
              <span style="font-weight:700;color:#1f2937;font-size:18px;">Net Earnings</span>
              <span style="font-weight:700;color:#059669;font-size:18px;">${formatCurrency(earnings.netEarnings, earnings.currency)}</span>
            </div>
          </div>
        </div>

        <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin-bottom:24px;">
          <h3 style="margin:0 0 16px 0;font-size:18px;color:#1f2937;">📈 Activity Summary</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="text-align:center;padding:16px;background:#f8fafc;border-radius:6px;">
              <div style="font-size:24px;font-weight:700;color:#059669;">${earnings.giftCount}</div>
              <div style="font-size:14px;color:#6b7280;">Gifts Sold</div>
            </div>
            <div style="text-align:center;padding:16px;background:#f8fafc;border-radius:6px;">
              <div style="font-size:24px;font-weight:700;color:#059669;">${earnings.subscriptionCount}</div>
              <div style="font-size:14px;color:#6b7280;">Active Subscribers</div>
            </div>
          </div>
        </div>

        <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:20px;margin-bottom:24px;">
          <h3 style="margin:0 0 12px 0;font-size:16px;color:#92400e;">💡 Next Steps</h3>
          <p style="margin:0;font-size:14px;color:#92400e;">Your payout request has been created and is pending manual processing. You'll receive another email once your payout has been sent.</p>
        </div>

        <div style="text-align:center;padding:24px;background:#f8fafc;border-radius:8px;">
          <p style="margin:0 0 12px 0;font-size:14px;color:#6b7280;">Questions about your earnings?</p>
          <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@buymeadrink.com'}" style="color:#059669;text-decoration:none;font-weight:500;">Contact Support</a>
        </div>

        <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
        </div>
      </body>
    </html>`;

    const text = `
Monthly Earnings Summary - ${monthName} ${year}

Hi ${creatorName},

Here's your earnings summary for ${monthName} ${year}:

Earnings Breakdown:
- Gift Sales: ${formatCurrency(earnings.giftEarnings, earnings.currency)}
- Subscriptions: ${formatCurrency(earnings.subscriptionEarnings, earnings.currency)}
- Platform Fee (5%): -${formatCurrency(earnings.platformFee, earnings.currency)}
- Net Earnings: ${formatCurrency(earnings.netEarnings, earnings.currency)}

Activity Summary:
- Gifts Sold: ${earnings.giftCount}
- Active Subscribers: ${earnings.subscriptionCount}

Your payout request has been created and is pending manual processing.

Questions? Contact us at ${process.env.SUPPORT_EMAIL || 'support@buymeadrink.com'}

© ${new Date().getFullYear()} ${COMPANY_NAME}
    `;

    try {
      await resend.sendEmail(
        ctx,
        `${COMPANY_NAME} <${fromEmail}>`,
        creatorEmail,
        subject,
        html,
        text
      );
      console.log(`✅ Sent payout digest to ${creatorName} (${creatorEmail})`);
    } catch (error) {
      console.error(`❌ Failed to send payout digest to ${creatorName}:`, error);
    }
  },
});
