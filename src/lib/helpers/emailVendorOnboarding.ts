import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const logoUrl = "https://drive.google.com/uc?export=view&id=12-EA3sW2FQVQU77-roeITSncjskWChiT";

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try { return { success: true }; } catch (error) { return { success: false }; }
}

// FLOW 12: VENDOR ONBOARDING (5 emails)

export async function sendVendorOnboardingEmail1({
  to, vendorName, commission
}: { to: string; vendorName: string; commission: number }) {
  const subject = "Welcome to GAZAARABIA — your dashboard is ready";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Welcome to GAZAARABIA. Your Seller Account has been approved.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">You are now part of a Muslim fashion marketplace where every sale supports Palestine, Sudan, Yemen, Kashmir and our Ummah worldwide.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Here is how to get started:</p>
        <ul style="font-size:15px;color:#374151;line-height:1.8;margin:20px 0;padding-left:20px;"><li><strong>Step 1:</strong> Log in to your Seller Dashboard at gazaarabia.com/seller</li><li><strong>Step 2:</strong> Complete your store profile — name, bio, logo, banner</li><li><strong>Step 3:</strong> Create your first product listing</li></ul>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Your commission rate:</strong> ${commission}%</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Payout schedule:</strong> Monthly — on or before the 15th of each calendar month</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Any questions? Email info@gazaarabia.com — we respond within 24 hours.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">Jazakallah khayran for joining us.<br>The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: null, email: to, subject, message: `Vendor onboarding 1/5 sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

export async function sendVendorOnboardingEmail2({
  to, vendorName
}: { to: string; vendorName: string }) {
  const subject = "How to create a listing that actually sells";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">A great product listing is the difference between a sale and a scroll-past. Every GAZAARABIA listing must include:</p>
        <ol style="font-size:15px;color:#374151;line-height:1.8;margin:20px 0;padding-left:20px;"><li><strong>Product title:</strong> 60–90 characters, includes the primary keyword</li><li><strong>Description:</strong> accurate fabric content, opacity confirmation, care instructions, sizing</li><li><strong>Fabric:</strong> always state the exact fabric — Nida, Zoom, Crepe, Linen. Never just "polyester"</li><li><strong>Sizing:</strong> always include a height-to-length guide or measurements in centimetres</li><li><strong>Photography:</strong> minimum 2 original images — full-length model shot + fabric close-up</li><li><strong>Price:</strong> all charges upfront — no hidden fees at checkout (required by UK law)</li><li><strong>Delivery:</strong> state your dispatch timeframe clearly</li><li><strong>Opacity:</strong> if you describe a product as fully opaque — it must be. GAZAARABIA tests listings.</li></ol>
        <p style="font-size:15px;line-height:1.7;color:#111827;">Photography guidelines: gazaarabia.com/seller/photography-guide<br>The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: null, email: to, subject, message: `Vendor onboarding 2/5 sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

export async function sendVendorOnboardingEmail3({
  to, vendorName, commission
}: { to: string; vendorName: string; commission: number }) {
  const subject = "Your commission, payouts and Palestine mission";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">We want to be completely transparent about how the finances work at GAZAARABIA.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Your commission rate:</strong> ${commission}% of the total order value per confirmed sale. Deducted automatically from your payout — no invoices needed from you.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Palestine Donation:</strong> a fixed percentage of every sale on GAZAARABIA goes to our Mission Fund — donated monthly to verified humanitarian organisations. This is a binding part of every vendor agreement and reflects the core mission of the platform.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Monthly payouts:</strong> processed on or before the 15th of each calendar month. View all earnings in real time in your Seller Dashboard.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">Questions about your earnings or payout? Email info@gazaarabia.com with your Seller ID.<br>The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: null, email: to, subject, message: `Vendor onboarding 3/5 sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

export async function sendVendorOnboardingEmail4({
  to, vendorName
}: { to: string; vendorName: string }) {
  const subject = "Your first order — here's what to expect";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">When your first order comes in, here is exactly what happens:</p>
        <ol style="font-size:15px;color:#374151;line-height:1.8;margin:20px 0;padding-left:20px;"><li>You receive an Order Notification email and a notification in your Seller Dashboard.</li><li>Accept or decline within 24 hours. No response in 24 hours = automatic cancellation.</li><li>Dispatch within your stated handling time (3 Business Days if not specified).</li><li>Upload the tracking number to your Seller Dashboard within 24 hours of dispatch.</li><li>The customer receives an automatic dispatch notification.</li></ol>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Packaging:</strong> use packaging that protects the product in transit. Products damaged due to poor packaging are your responsibility.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;"><strong>Returns:</strong> if a customer requests a return, GAZAARABIA will contact you. Respond within 2 Business Days.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">The GAZAARABIA Team</p>
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: null, email: to, subject, message: `Vendor onboarding 4/5 sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}

export async function sendVendorOnboardingEmail5({
  to, vendorName, hasMadeSale
}: { to: string; vendorName: string; hasMadeSale: boolean }) {
  const subject = "Two weeks in — how is it going? ðµð¸";
  const html = `
  <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f7f7f7;padding:50px 0;color:#111827;">
    <table align="center" cellpadding="0" cellspacing="0" width="640" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="text-align:center;padding:30px 0;border-bottom:4px solid #009639;"><img src="${logoUrl}" alt="Gazaarabia" width="200" style="max-width:220px;"></td></tr>
      <tr><td style="padding:45px 50px;">
        ${hasMadeSale ? `
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Alhamdulillah — you made your first sale on GAZAARABIA!</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Every sale you make through our platform sends a portion of the profit to humanitarian aid for Muslims in Palestine, Sudan, Yemen, Kashmir and Syria. You are not just running a business — you are contributing to something bigger.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">Your earnings are in your Seller Dashboard. Your first payout will be processed on or before the 15th of next month.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">Keep listing. Keep selling. We are with you.<br>The GAZAARABIA Team</p>
        ` : `
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">As-salamu alaykum,</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">It has been two weeks since you joined GAZAARABIA and we noticed you have not created a listing yet.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:20px;color:#111827;">We know setting up can feel overwhelming. Here is a shortcut: start with just one product. One listing. That is it.</p>
        <p style="font-size:15px;line-height:1.7;color:#111827;">Email info@gazaarabia.com — we will walk you through it personally.<br>The GAZAARABIA Team</p>
        `}
      </td></tr>
      <tr><td style="background:#111827;text-align:center;padding:28px 20px;"><p style="color:#ffffff;font-size:13px;margin:0;line-height:1.5;">&copy; ${new Date().getFullYear()} <strong>Gazaarabia</strong><br><span style="color:#9ca3af;">Where Modesty Meets Luxury</span></p></td></tr>
    </table>
  </div>`;
  const emailResult = await sendEmail({ to, subject, html });
  try { await prisma.notifications.create({ data: { userId: null, email: to, subject, message: `Vendor onboarding 5/5 sent — ${emailResult.success ? "success" : "failed"}`, type: "email", status: emailResult.success ? "sent" : "failed" } }); } catch (error) { console.error(error); }
  return emailResult;
}
