// Address + phone normalization for Shopify orderCreate (API 2025-01).
// Shopify's MailingAddressInput uses ISO codes (countryCode, provinceCode) — NEVER
// raw country names. This module converts Gazaarabia's free-text values to the
// canonical Shopify values, and normalizes phones to E.164. Self-contained (no deps).

// ISO 3166-1 alpha-2. Names are derived at load via Intl.DisplayNames, so we only
// keep the compact code list here.
const ISO2_LIST = [
  "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ",
  "CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ",
  "DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET",
  "FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY",
  "HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT",
  "JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ",
  "LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
  "MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ",
  "NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM",
  "PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA",
  "RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ",
  "TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ",
  "UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","YE","YT","ZA","ZM","ZW",
];
const ISO2 = new Set(ISO2_LIST);

// Normalize a country name for lookup: lowercase, strip periods, collapse spaces.
// Handles "St. Lucia" vs "st lucia" and similar punctuation/spacing variants.
function normalizeCountryKey(s: string): string {
  return s.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}

// name (normalized) → ISO2, built from the runtime locale data. Each canonical
// name is also stored with its "st " ↔ "saint " variant so users typing either
// form match (St. Lucia / Saint Lucia, St. Kitts / Saint Kitts, …).
const NAME_TO_CODE = new Map<string, string>();
try {
  const dn = new Intl.DisplayNames(["en"], { type: "region" });
  for (const code of ISO2_LIST) {
    const name = dn.of(code);
    if (!name) continue;
    const key = normalizeCountryKey(name);
    NAME_TO_CODE.set(key, code);
    if (key.startsWith("st ")) NAME_TO_CODE.set("saint " + key.slice(3), code);
    else if (key.startsWith("saint ")) NAME_TO_CODE.set("st " + key.slice(6), code);
  }
} catch {
  /* Intl region data unavailable — ALIASES below still cover common cases. */
}

// Common colloquial / alternate spellings not matched by the canonical name.
// Keys are pre-normalized (lowercase, no periods, single spaces).
const ALIASES: Record<string, string> = {
  uk: "GB", "great britain": "GB", "united kingdom of great britain and northern ireland": "GB", england: "GB", scotland: "GB", wales: "GB", "northern ireland": "GB",
  usa: "US", us: "US", america: "US", "united states of america": "US",
  uae: "AE",
  "south korea": "KR", "north korea": "KP", russia: "RU", "czech republic": "CZ", "ivory coast": "CI",
  vietnam: "VN", laos: "LA", syria: "SY", iran: "IR", bosnia: "BA", "cape verde": "CV", "east timor": "TL",
  bangladesh: "BD", burma: "MM", "the netherlands": "NL", holland: "NL", "hong kong": "HK",
  // Canonical Intl names differ from what users commonly type (runtime-verified gaps):
  turkey: "TR", turkiye: "TR", // Intl: "Türkiye"
  myanmar: "MM", //               Intl: "Myanmar (Burma)"
  palestine: "PS", //             Intl: "Palestinian Territories"
  macedonia: "MK", //             Intl: "North Macedonia"
  swaziland: "SZ", //             Intl: "Eswatini"
};

/** Convert a free-text country (name OR 2-letter code) to Shopify ISO2, or null. */
export function toCountryCode(input?: string | null): string | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;
  if (/^[A-Za-z]{2}$/.test(s) && ISO2.has(s.toUpperCase())) return s.toUpperCase();
  const key = normalizeCountryKey(s);
  return NAME_TO_CODE.get(key) ?? ALIASES[key] ?? null;
}

// ISO2 → international dial code (for best-effort E.164 from national numbers).
const DIAL: Record<string, string> = {
  AE: "971", AF: "93", AL: "355", AM: "374", AO: "244", AR: "54", AT: "43", AU: "61", AZ: "994",
  BA: "387", BD: "880", BE: "32", BF: "226", BG: "359", BH: "973", BI: "257", BJ: "229", BN: "673", BO: "591", BR: "55", BW: "267", BY: "375", BZ: "501",
  CA: "1", CD: "243", CG: "242", CH: "41", CI: "225", CL: "56", CM: "237", CN: "86", CO: "57", CR: "506", CU: "53", CY: "357", CZ: "420",
  DE: "49", DJ: "253", DK: "45", DO: "1", DZ: "213", EC: "593", EE: "372", EG: "20", ES: "34", ET: "251",
  FI: "358", FJ: "679", FR: "33", GA: "241", GB: "44", GE: "995", GH: "233", GM: "220", GN: "224", GR: "30", GT: "502", GY: "592",
  HK: "852", HN: "504", HR: "385", HT: "509", HU: "36", ID: "62", IE: "353", IL: "972", IN: "91", IQ: "964", IR: "98", IS: "354", IT: "39",
  JM: "1", JO: "962", JP: "81", KE: "254", KG: "996", KH: "855", KR: "82", KW: "965", KZ: "7",
  LA: "856", LB: "961", LK: "94", LR: "231", LT: "370", LU: "352", LV: "371", LY: "218",
  MA: "212", MD: "373", ME: "382", MG: "261", MK: "389", ML: "223", MM: "95", MN: "976", MO: "853", MR: "222", MT: "356", MU: "230", MV: "960", MW: "265", MX: "52", MY: "60", MZ: "258",
  NA: "264", NE: "227", NG: "234", NI: "505", NL: "31", NO: "47", NP: "977", NZ: "64", OM: "968",
  PA: "507", PE: "51", PG: "675", PH: "63", PK: "92", PL: "48", PR: "1", PS: "970", PT: "351", PY: "595", QA: "974",
  RO: "40", RS: "381", RU: "7", RW: "250", SA: "966", SC: "248", SD: "249", SE: "46", SG: "65", SI: "386", SK: "421", SL: "232", SN: "221", SO: "252", SR: "597", SS: "211", SV: "503", SY: "963", SZ: "268",
  TD: "235", TG: "228", TH: "66", TJ: "992", TL: "670", TM: "993", TN: "216", TR: "90", TT: "1", TW: "886", TZ: "255",
  UA: "380", UG: "256", US: "1", UY: "598", UZ: "998", VE: "58", VN: "84", YE: "967", ZA: "27", ZM: "260", ZW: "263",
};

/**
 * Best-effort E.164. Returns a valid +CC number or undefined — NEVER an invalid
 * value. `countryCode` (ISO2) supplies the dial code for national-format numbers.
 */
export function toE164Phone(raw?: string | null, countryCode?: string | null): string | undefined {
  if (!raw) return undefined;
  const s = String(raw).trim().replace(/[\s\-().]/g, "");
  if (/^\+[1-9]\d{7,14}$/.test(s)) return s; // already E.164
  if (s.startsWith("00")) {
    const c = "+" + s.slice(2);
    return /^\+[1-9]\d{7,14}$/.test(c) ? c : undefined;
  }
  const dial = countryCode ? DIAL[countryCode.toUpperCase()] : undefined;
  if (dial && /^\d+$/.test(s)) {
    const national = s.replace(/^0+/, ""); // strip national trunk prefix
    const cand = "+" + dial + national;
    if (/^\+[1-9]\d{7,14}$/.test(cand)) return cand;
  }
  return undefined; // cannot form a valid E.164 → omit rather than send garbage
}

/** Province/state is a passthrough: uppercase a code if provided, else undefined. */
export function toProvinceCode(input?: string | null): string | undefined {
  if (!input) return undefined;
  const s = String(input).trim().toUpperCase();
  return /^[A-Z0-9]{1,3}$/.test(s) ? s : undefined;
}

export function isValidEmail(email?: string | null): boolean {
  return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
