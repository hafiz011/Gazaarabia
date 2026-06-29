import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const logoUrl = "https://drive.google.com/uc?export=view&id=12-EA3sW2FQVQU77-roeITSncjskWChiT";

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try { return { success: true }; } catch (error) { return { success: false }; }
}

// FLOW 9: SEASONAL (4 emails)

export async function sendSeasonalRamadanEmail({
  to, name, userId
}: { to: string; name?: string | null; userId?: number | null }) {
  const subject = "Ramadan Mubarak — early access is open ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum wa Rahmatullahi wa Barakatuh,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Ramadan Mubarak from the GAZAARABIA team.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">This Ramadan, every purchase at GAZAARABIA carries meaning beyond the transaction. Our brothers and sisters in Palestine, Sudan, Yemen, Kashmir and Syria are among us — their need does not pause for any season. Your shopping this Ramadan sends real support to them.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Order at least 3 weeks before Eid al-Fitr for guaranteed standard UK delivery. Express delivery available for late orders.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">May Allah accept your fasts, your prayers and your generosity this Ramadan. Ameen.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Ramadan email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

export async function sendSeasonalEidCountdownEmail({
  to, name, userId, deadline
}: { to: string; name?: string | null; userId?: number | null; deadline: string }) {
  const subject = "3 weeks to Eid — order now for delivery ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Eid al-Fitr is 3 weeks away.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Order by ${deadline}</strong> for guaranteed standard UK delivery before Eid.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Order after ${deadline}</strong> — choose express delivery.</p>
        <ul style="font-size:15px;color:#374151;line-height:1.8;margin:20px 0;padding-left:20px;"><li>Family Matching Sets — father & son thobes, mother & daughter abayas, coordinated kids outfits.</li><li>Women's Eid Abayas — embroidered, embellished and luxury occasion styles.</li><li>Men's Eid Thobes — Emirati, Omani and embroidered styles.</li></ul>
        <p style="font-size:15px;line-height:1.7;color:#111827;">Every Eid order supports Palestine, Sudan, Yemen, Kashmir and Syria.<br>The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Eid countdown email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

export async function sendSeasonalEidMubarakEmail({
  to, name, userId, donatedAmount
}: { to: string; name?: string | null; userId?: number | null; donatedAmount: number }) {
  const subject = "Eid Mubarak — May Allah accept ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Eid Mubarak!</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Taqabbal Allahu minna wa minkum.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Together, the GAZAARABIA community has donated £${donatedAmount.toFixed(2)} to humanitarian aid for Muslims in Palestine, Sudan, Yemen, Kashmir and Syria since we launched.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">That is the power of shopping with purpose. Jazakallah khayran to every person who ordered this year.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">If you are still looking for your Eid outfit, we have last-minute pieces with express delivery.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">From our family to yours — Eid Mubarak. May this day bring joy, peace and barakah.<br>The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Eid Mubarak email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

export async function sendSeasonalHajjEmail({
  to, name, userId
}: { to: string; name?: string | null; userId?: number | null }) {
  const subject = "Your Umrah packing list — all in one place ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Hajj and Umrah season is approaching. We wanted to make your packing as easy as possible.</p>
        <ul style="font-size:15px;color:#374151;line-height:1.8;margin:20px 0;padding-left:20px;"><li>Ihram Set</li><li>White Nida Umrah Thobe</li><li>Premium Tasbih</li><li>Wudu Socks</li><li>Travel Prayer Mat</li><li>Oud Perfume</li></ul>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Free standard UK delivery on orders over £50. Dispatched within 1 working day.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Every item supports Palestine, Sudan, Yemen and our Ummah worldwide.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">May Allah accept your Hajj or Umrah. Ameen.<br>The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Hajj email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

// FLOW 10: BACK IN STOCK

export async function sendBackInStockEmail({
  to, name, productTitle, productUrl, userId
}: { to: string; name?: string | null; productTitle: string; productUrl: string; userId?: number | null }) {
  const subject = `${productTitle} is back in stock ðµð¸`;
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">The piece you wanted is back.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>${productTitle}</strong></p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">This sold out quickly last time. We wanted to make sure you heard first.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Free standard UK delivery on orders over £50. 14-day returns if anything is not right.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">A portion of every GAZAARABIA order goes to humanitarian aid for Muslims in Palestine, Sudan, Yemen and our Ummah.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
        <div style="text-align:center;margin:35px 0;"><a href="${productUrl}" style="display:inline-block;padding:12px 28px;background:#E82C3F;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:500;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,0.12);letter-spacing:0.4px;">Shop Before It Sells Out →</a></div>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Back in stock email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

// FLOW 11: VIP EARLY ACCESS

export async function sendVIPEarlyAccessEmail({
  to, name, userId, collectionName
}: { to: string; name?: string | null; userId?: number | null; collectionName: string }) {
  const subject = "You're VIP — early access is open ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">We have been keeping track.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">You have ordered from GAZAARABIA multiple times and every single order has contributed to our mission. You are not just a customer — you are part of what makes GAZAARABIA possible.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">So before we open <strong>${collectionName}</strong> to everyone else — you get 48 hours of early access.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Early access closes in 48 hours.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">Jazakallah khayran for being part of this community. Genuinely.<br>The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `VIP early access email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

// FLOW 13: ORDER CANCELLATION

export async function sendOrderCancellationEmail({
  to, orderId, reason, userId
}: { to: string; orderId: number; reason?: string; userId?: number }) {
  const subject = `Your order has been cancelled — #${orderId}`;
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Your GAZAARABIA order <strong>#${orderId}</strong> has been cancelled.</p>
        ${reason ? `<p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Reason:</strong> ${reason}</p>` : ""}
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Refund: if payment was taken, your refund will be returned to your original payment method within 5 working days. We send the refund immediately — the exact timing depends on your bank.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Did you not cancel this order? Email info@gazaarabia.com with your order number immediately and we will investigate.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">We are sorry this order did not work out. Our full collection is available at gazaarabia.com.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Order cancellation email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

// FLOW 14: REFUND CONFIRMATION

export async function sendRefundConfirmationEmail({
  to, orderId, refundAmount, paymentMethod, userId
}: { to: string; orderId: number; refundAmount: number; paymentMethod: string; userId?: number }) {
  const subject = "Your refund has been processed ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Your refund for order <strong>#${orderId}</strong> has been processed.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Refund amount:</strong> £${refundAmount.toFixed(2)}</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Refunded to:</strong> ${paymentMethod}</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Your refund should appear in your account within 3–5 working days. The exact timing depends on your bank — we have sent the refund immediately from our end.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Refund not appeared after 5 working days? Email info@gazaarabia.com with your order number and we will provide proof of the refund for your bank.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">We hope to find you the right piece next time. Jazakallah khayran for your patience.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: userId || null, email: to, subject, message: `Refund confirmation email sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}
