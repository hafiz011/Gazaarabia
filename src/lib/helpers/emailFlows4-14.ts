import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const logoUrl = "https://drive.google.com/uc?export=view&id=12-EA3sW2FQVQU77-roeITSncjskWChiT";

// Helper to send email
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// FLOW 4: POST-PURCHASE (3 additional emails - Email 3: Care Guide, Email 4: Impact)

export async function sendPostPurchaseEmail3CareGuide({
  to, name, userId
}: { to: string; name?: string | null; userId?: number | null }) {
  const subject = "Keep your order looking perfect — read this ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Your GAZAARABIA order has arrived. We hope it is everything you expected.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>If your order is Nida:</strong></p>
        <ul style="font-size:15px;color:#374151;line-height:1.8;margin:0;padding-left:20px;"><li>Machine wash 30°C, gentle cycle</li><li>Never tumble dry — hang in the shade</li><li>Iron on low-medium heat using a pressing cloth</li></ul>
        <p style="font-size:15px;line-height:1.7;margin:20px 0;color:#111827;"><strong>If your order is Zoom (Crinkle Nida):</strong></p>
        <ul style="font-size:15px;color:#374151;line-height:1.8;margin:0;padding-left:20px;"><li>Machine wash 30°C, turn inside-out first</li><li>Hang to dry — rarely needs ironing</li><li>Never use high heat — damages the spandex content</li></ul>
        <p style="font-size:15px;line-height:1.7;margin:20px 0;color:#111827;"><strong>If your order is embroidered or embellished:</strong></p>
        <ul style="font-size:15px;color:#374151;line-height:1.8;margin:0;padding-left:20px;"><li>Hand wash in cool water or dry clean — check the garment label</li><li>Never machine wash embroidered pieces</li></ul>
        <p style="font-size:15px;line-height:1.7;margin:20px 0;color:#111827;">Something not right? Email info@gazaarabia.com within 14 days. We will fix it immediately.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Post-purchase care guide sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

export async function sendPostPurchaseEmail4Impact({
  to, name, userId
}: { to: string; name?: string | null; userId?: number | null }) {
  const subject = "You supported Palestine last week ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">It has been a week since your GAZAARABIA order arrived.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">A portion of the profit from your purchase went directly to humanitarian aid for Muslims in Palestine, Sudan, Yemen, Kashmir and Syria. Reported every quarter at gazaarabia.com/impact.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">If you want to extend that impact:</p>
        <ul style="font-size:15px;color:#374151;line-height:1.8;margin:20px 0;padding-left:20px;"><li>Share GAZAARABIA with a friend — when they order, both of you earn a reward.</li><li>Post your order on Instagram or TikTok and tag @gazaarabia. We share community posts.</li><li>Leave a review below — it helps other Muslims shop with confidence.</li></ul>
        <p style="font-size:15px;line-height:1.7;margin:20px 0;color:#111827;">Jazakallah khayran for being part of this.<br>The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Post-purchase impact email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

// FLOW 5: CROSS-SELL

export async function sendCrossSellEmail({
  to, name, userId
}: { to: string; name?: string | null; userId?: number | null }) {
  const subject = "Complete the look ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">We hope you are loving your order.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Here are a few pieces our community pairs with it:</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Free standard UK delivery on orders over £50. 14-day returns on everything.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Cross-sell email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

// FLOW 6: REVIEW REQUEST

export async function sendReviewRequestEmail({
  to, name, userId, productUrl
}: { to: string; name?: string | null; userId?: number | null; productUrl: string }) {
  const subject = "How was your order? (2 minutes) ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Your GAZAARABIA order arrived 10 days ago. We hope you love it.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Could you take 2 minutes to leave an honest review?</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">When a Muslim sister is deciding whether to trust an abaya description online, or a Muslim brother needs a thobe that genuinely fits — your review is what gives them the confidence to order. Was the fabric opaque? Was the length accurate for your height? Did it arrive as described?</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Your honest words — good or critical — make GAZAARABIA better for every Muslim who shops here.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">Jazakallah khayran.<br>The GAZAARABIA Team</p>
        <div style="text-align:center;margin:35px 0;"><a href="${productUrl}" style="display:inline-block;padding:12px 28px;background:#E82C3F;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:500;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.12);letter-spacing:0.4px;">Leave My Review (2 mins) →</a></div>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Review request email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

// FLOW 7: WIN-BACK (2 emails)

export async function sendWinBackEmail1({
  to, name, userId
}: { to: string; name?: string | null; userId?: number | null }) {
  const subject = "New arrivals since your last order ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">It has been a little while. We wanted to show you what has arrived at GAZAARABIA since your last order.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">New guides on the blog since your last visit:</p>
        <ul style="font-size:15px;color:#374151;line-height:1.8;margin:0;padding-left:20px;"><li>What is Zoom Fabric? — gazaarabia.com/blog/what-is-zoom-fabric</li><li>Men's Thobes UK Guide — gazaarabia.com/blog/mens-thobes-uk-guide</li></ul>
        <p style="font-size:15px;line-height:1.7;margin:20px 0;color:#111827;">As always, every order supports Palestine, Sudan, Yemen, Kashmir and our Ummah.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Win-back email 1/2 sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

export async function sendWinBackEmail2({
  to, name, userId
}: { to: string; name?: string | null; userId?: number | null }) {
  const subject = "A gift for you: 15% off, no conditions ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">We have not seen you for a little while — so we wanted to send you something.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Here is 15% off your next order, no conditions:</p>
        <div style="text-align:center;margin:25px 0;padding:20px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;"><p style="margin:0;font-size:24px;font-weight:700;color:#E82C3F;letter-spacing:2px;">UMMAH15</p><p style="margin:8px 0 0 0;font-size:13px;color:#6b7280;">Valid for 7 days.</p></div>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Use it on anything — abayas, thobes, hijabs, kaftans, Moroccan fashion, Islamic gifts. Free standard delivery on orders over £50.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">A portion of every order supports Palestine, Sudan, Yemen, Kashmir and Syria. Every order. Every month.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Any questions? Reply to this email. We respond within 24 hours.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Win-back email 2/2 sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

// FLOW 8: SUNSET / LIST CLEAN

export async function sendSunsetEmail({
  to, name, userId, resubscribeUrl
}: { to: string; name?: string | null; userId?: number | null; resubscribeUrl: string }) {
  const subject = "Should we say goodbye? ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">We have not heard from you in a while.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">We do not want to fill your inbox if GAZAARABIA is no longer for you — so we are asking directly.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">If you still want to hear from us — new arrivals, Eid drops, Palestine impact updates — click the button below. You will stay on our list.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">If you do not click within 7 days, we will remove you from our marketing list. You can always re-subscribe at any time at gazaarabia.com.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Either way — jazakallah khayran for being part of our community at any point. It meant something.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
        <div style="text-align:center;margin:35px 0;"><a href="${resubscribeUrl}" style="display:inline-block;padding:12px 28px;background:#009639;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:500;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.12);letter-spacing:0.4px;">Keep me on the list →</a></div>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Sunset email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}
