export function generateReferralCode() {
    const prefix = "GA-";
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return prefix + random;
}
