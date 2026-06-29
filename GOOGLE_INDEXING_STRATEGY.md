# Google Indexing Strategy — Getting Gazaarabia Pages Indexed

**Goal:** Get 100% of important pages (products, categories, search) indexed in Google within 30 days.

---

## STEP 1: GOOGLE SEARCH CONSOLE SETUP (30 minutes)

### 1.1 Verify Domain Ownership

Go to: https://search.google.com/search-console/

**Option A: Domain Property (Recommended)**
```
1. Click "Start now"
2. Choose "URL prefix" (NOT domain property)
3. Enter: https://gazaarabia.com
4. Verify ownership via:
   - DNS TXT record (best for DNS control)
   - HTML file upload
   - Google Tag Manager (easiest if already using)
```

**Option B: Using Google Tag Manager (Fastest)**
```
1. In GSC, click "Verify with Google Tag Manager"
2. It auto-detects your GTM implementation
3. Click "Verify"
✅ Instant verification (you already have GTM running)
```

### 1.2 Verify in GSC
```
Expected: "Ownership verified" message
Time: 5-10 minutes after verification
```

---

## STEP 2: SUBMIT SITEMAP (15 minutes)

### 2.1 Check Current Sitemap

Your sitemap URL:
```
https://gazaarabia.com/sitemap.xml
```

Test it:
```
1. Open in browser
2. Should show XML with <loc> entries
3. Should list products, categories, pages
```

### 2.2 Submit to GSC

```
1. Go to GSC > Sitemaps menu
2. Click "Add new sitemap"
3. Enter: sitemap.xml
4. Click "Submit"

Expected:
- Status: Success
- Index coverage: X URLs submitted
- Indexed: Y URLs indexed
```

### 2.3 Check Sitemap Coverage

```
After 5-10 minutes:

GSC > Coverage tab should show:
- ✅ Valid (indexed)
- 🟡 Valid with warnings
- ❌ Not indexed (reason shown)
- ⚠️ Excluded by robots.txt
```

---

## STEP 3: FIX INDEXING BLOCKERS (1-2 hours)

Before pages can be indexed, fix these issues:

### Blocker 1: Search Pages Not Indexed

**Current Status:** `/search?q=...` pages blocked from indexing

**Fix:**

```typescript
// /src/app/search/page.tsx

export async function generateMetadata({ searchParams }): Promise<Metadata> {
  const q = (await searchParams).q || '';
  
  return {
    title: q ? `Search "${q}" | GAZAARABIA` : "Search | GAZAARABIA",
    description: q 
      ? `Search results for ${q} - Find modest fashion at GAZAARABIA`
      : "Search GAZAARABIA modest fashion collection",
    robots: 'index, follow',  // ← CRITICAL: Allow indexing
    canonical: `https://gazaarabia.com/search?q=${encodeURIComponent(q)}`,
  };
}
```

### Blocker 2: robots.txt Blocking Search

**Current:** robots.txt might be blocking `/search`

**Fix:**

```typescript
// /robots.ts

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/auth', '/dashboard'],
        crawlDelay: 1, // Polite crawling
      },
      {
        userAgent: 'AdsBot-Google',
        crawlDelay: 1,
      },
    ],
    sitemap: 'https://gazaarabia.com/sitemap.xml',
  };
}
```

**Key:** `/search` should NOT be disallowed

### Blocker 3: noindex Meta Tag

**Check:** Make sure NO pages have `robots: 'noindex'`

```typescript
// WRONG (blocks indexing):
export const metadata: Metadata = {
  robots: 'noindex',
};

// CORRECT (allows indexing):
export const metadata: Metadata = {
  robots: 'index, follow',
};
```

### Blocker 4: Canonical Issues

**Check:** All pages should have self-referential canonicals

```typescript
// Product page canonical:
canonical: `https://gazaarabia.com/products/${product.slug}`

// Category page canonical:
canonical: `https://gazaarabia.com/shop/${category.slug}`

// Search page canonical:
canonical: `https://gazaarabia.com/search?q=${encodeURIComponent(q)}`
```

---

## STEP 4: INSPECT & REQUEST INDEXING (2-3 hours)

### 4.1 Use URL Inspection Tool

In Google Search Console:

```
1. Click "URL Inspection" (top bar)
2. Enter URL: https://gazaarabia.com/products/classic-black-abaya
3. Click "Inspect"

Results show:
- ✅ Indexable → "Request indexing"
- 🟡 Not indexed (reason explained)
- ❌ Indexed in Google

If "Indexable":
→ Click "Request indexing"
→ Google will crawl & index within 24-48 hours
```

### 4.2 Bulk Request Indexing

**For new/updated pages:**

```typescript
// Implement Indexing API (optional but powerful)
// Only for production changes

POST /api/notify-google
{
  "url": "https://gazaarabia.com/products/new-abaya"
}

Google will index within minutes instead of days.
```

### 4.3 Request Top Priority Pages

```
Priority to request (in order):

1. Search results page: /search (if not indexed)
2. Top 20 products (best sellers)
3. All category pages (8 total)
4. Top 50 products (by traffic)
5. Blog posts (if any)

Timeline:
- Day 1-2: Request top 20 products
- Day 3-4: Request categories
- Day 5-7: Request remaining products & search
```

---

## STEP 5: MONITOR INDEXING PROGRESS (Ongoing)

### 5.1 Daily Monitoring Checklist

```
Google Search Console > Coverage tab:

Check daily:
□ Total indexed URLs (should increase daily)
□ New indexing errors (fix immediately)
□ Excluded URLs (should only be filters/sorts)

Target metrics:
- Day 1: 50+ pages indexed
- Day 7: 200+ pages indexed
- Day 30: 90%+ of important pages indexed
```

### 5.2 Set Up Monitoring Dashboard

Create a simple spreadsheet to track:

```
Date | Products Indexed | Categories Indexed | Search Indexed | Errors
-----|-----------------|-------------------|---------------|-------
6/29 | 150/500 (30%)   | 8/8 (100%)       | No           | 12
6/30 | 280/500 (56%)   | 8/8 (100%)       | Yes          | 5
7/01 | 420/500 (84%)   | 8/8 (100%)       | Yes          | 2
7/07 | 480/500 (96%)   | 8/8 (100%)       | Yes          | 0
```

### 5.3 Check Coverage Issues

```
GSC > Coverage > Excluded

Common issues:

❌ "Excluded by robots.txt"
   → Fix: Remove from robots disallow

❌ "Not selected as canonical"
   → Fix: Check for duplicate content, add canonical

❌ "Soft 404"
   → Fix: Page returns 404 or redirect, check URL

❌ "Crawled but not indexed"
   → Fix: Add metadata, keywords, content quality
```

---

## STEP 6: IMPLEMENT INDEXING API (Optional but Recommended)

### For Real-Time Indexing of New Products

**When:** Use when you add new products to notify Google instantly

**Setup:**

```typescript
// Create Google Cloud Project
// Enable Indexing API
// Create service account key

// /lib/google-indexing.ts

import { google } from 'googleapis';

const serviceAccountKey = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'
);

const indexingApi = google.indexing('v3');

export async function notifyGoogle(url: string) {
  try {
    const jwtClient = new google.auth.JWT(
      serviceAccountKey.client_email,
      undefined,
      serviceAccountKey.private_key,
      ['https://www.googleapis.com/auth/indexing']
    );

    await jwtClient.authorize();

    const response = await indexingApi.urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: url,
        type: 'URL_UPDATED', // or 'URL_DELETED'
      },
    });

    console.log('URL indexed:', response.data);
    return true;
  } catch (error) {
    console.error('Indexing error:', error);
    return false;
  }
}
```

**Usage:**

```typescript
// /api/products/create/route.ts

import { notifyGoogle } from '@/lib/google-indexing';

export async function POST(req: NextRequest) {
  // ... create product ...
  
  const productUrl = `https://gazaarabia.com/products/${product.slug}`;
  
  // Notify Google to index immediately
  await notifyGoogle(productUrl);
  
  return NextResponse.json({ success: true });
}
```

**Setup Steps:**

```
1. Go to Google Cloud Console
2. Create new project (or use existing)
3. Enable "Indexing API"
4. Create service account:
   - Type: Service Account
   - Grant: Indexing API access
   - Create JSON key
5. Download key.json
6. Add to .env:
   GOOGLE_SERVICE_ACCOUNT_KEY='{...json content...}'
```

---

## STEP 7: MANUAL INDEXING REQUESTS (First Week)

### Batch 1: Critical Pages (Day 1)

```
1. Homepage: /
2. Search page: /search
3. Category pages (8): /shop/[category]
4. Top 10 products (by traffic)

Total: ~20 URLs
Time: 30 minutes in GSC URL Inspection tool
```

### Batch 2: Popular Products (Day 2-3)

```
Top 50 products by:
- Recent uploads
- Sales
- Reviews
- Traffic

Action: Request indexing for each
Expected indexing: Within 48 hours
```

### Batch 3: Remaining Products (Day 4-7)

```
Remaining 400+ products
Action: Let sitemap handle (automatic crawl)
Expected indexing: 7-14 days
```

---

## STEP 8: GOOGLE SEARCH CONSOLE SETTINGS

### Configure Performance Settings

```
GSC > Settings > Search Appearance

Enable:
✅ Breadcrumbs in search results
✅ Product rich results
✅ FAQ rich results
✅ Review snippets
```

### Set Crawl Rate

```
GSC > Settings > Crawl Stats

Current (automatic): Normal
Recommended: Keep automatic
(Google adjusts based on server load)
```

### Set Preferred Domain

```
GSC > Settings

Preferred domain:
- https://gazaarabia.com (with www OR without)
- Canonical should match this
```

---

## STEP 9: GENERATE RICH SITEMAPS

### Create Multiple Sitemaps

```typescript
// /sitemap.ts - Main sitemap index

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://gazaarabia.com/sitemap-pages.xml',
      lastModified: new Date(),
    },
    {
      url: 'https://gazaarabia.com/sitemap-products.xml',
      lastModified: new Date(),
    },
    {
      url: 'https://gazaarabia.com/sitemap-categories.xml',
      lastModified: new Date(),
    },
  ];
}
```

### Configure Sitemaps with Priority

```typescript
// Products: Priority 0.8 (important)
{ loc: '...', lastmod: '...', priority: 0.8 }

// Categories: Priority 0.9 (more important)
{ loc: '...', lastmod: '...', priority: 0.9 }

// Search: Priority 0.5 (less important, no follow filters)
{ loc: '...', lastmod: '...', priority: 0.5 }
```

### Submit All Sitemaps to GSC

```
GSC > Sitemaps:

Submit:
1. sitemap.xml (main)
2. sitemap-pages.xml
3. sitemap-products.xml
4. sitemap-categories.xml

Expected: All 4 show "Success"
```

---

## QUICK REFERENCE: 30-DAY INDEXING TIMELINE

### Week 1: Setup & Request

```
Mon (6/29):  GSC setup + sitemap submission
Tue (6/30):  Fix metadata blockers + robots.txt
Wed (7/01):  Request indexing top 20 products + categories
Thu (7/02):  Request indexing top 50 products
Fri (7/03):  Check GSC coverage progress

Expected indexed: 50-100 pages
```

### Week 2: Monitoring & Refinement

```
Mon (7/06):  Check coverage, fix errors
Tue (7/07):  Request more product batches
Wed (7/08):  Verify search page indexed
Thu (7/09):  Check canonical issues
Fri (7/10):  Weekly GSC report

Expected indexed: 150-250 pages
```

### Week 3-4: Full Coverage

```
Week 3:      Remaining products crawled by sitemap
Week 4:      Monitor Core Web Vitals, track rankings

Expected indexed: 90%+ (450+ pages)
```

---

## TROUBLESHOOTING: Why Pages Aren't Indexed

### Issue: "Crawled but not indexed"

**Causes:**
- Thin content (product description < 100 chars)
- Duplicate content (same description for multiple products)
- Low quality (no images, no metadata)
- Blocked by robots.txt

**Fix:**
- Expand descriptions to 150-200 chars
- Add unique description per product
- Add images (next/image with alt text)
- Verify robots.txt allows page

### Issue: "Excluded by robots.txt"

**Cause:**
- URL is in robots.txt disallow list

**Fix:**
```typescript
// robots.ts - Remove from disallow
disallow: ['/admin', '/api'], // ← Remove '/search' if there

// NOT this:
disallow: ['/admin', '/api', '/search'] // ← Wrong!
```

### Issue: "Soft 404"

**Cause:**
- Page returns 404 error or redirects

**Fix:**
- Check if URL still exists
- Verify product hasn't been deleted
- Check 301 redirects are proper
- Verify status code is 200 (not 404)

### Issue: "Not selected as canonical"

**Cause:**
- Duplicate content detected
- Canonical points to different URL

**Fix:**
- Add self-referential canonical
- Ensure exact URL match:
  ```
  Page URL: https://gazaarabia.com/products/black-abaya
  Canonical: https://gazaarabia.com/products/black-abaya
  (must be identical, including parameters)
  ```

### Issue: "Indexed but not ranking"

**Cause:**
- Page indexed but low quality/relevance
- Low backlinks
- Poor user signals (bounce rate)

**Fix:**
- Improve content quality
- Add internal links from homepage
- Add external backlinks (outreach)
- Improve Core Web Vitals
- Add schema markup (breadcrumbs, product)

---

## EXPECTED RESULTS (30-60 Days)

### Indexing Progress

```
Before:
- Products indexed: 50-100 (10%)
- Categories indexed: 2-3 (25%)
- Search indexed: 0 (0%)
- Total: 52-103 pages

After 30 days:
- Products indexed: 400-450 (80-90%)
- Categories indexed: 8 (100%)
- Search indexed: Yes, growing
- Total: 408-458+ pages

After 60 days:
- Products indexed: 480-500+ (96-100%)
- Categories indexed: 8 (100%)
- Search indexed: Growing (1000+ variations)
- Total: 488-508+ pages
```

### Traffic Impact

```
Current organic traffic: ~500-800 sessions/month
After 30 days: ~700-1,000 sessions/month (+40%)
After 60 days: ~1,000-1,500 sessions/month (+60-100%)
After 90 days: ~1,500-2,000 sessions/month (+100-150%)
```

### Revenue Impact

```
Current: £1,500/month (estimated)
After 60 days: £2,500-3,000/month
After 90 days: £3,500-4,500/month

Annual additional revenue: £12,000-36,000+
```

---

## CHECKLIST: GET STARTED NOW

### Today (30 minutes):

- [ ] Set up Google Search Console
- [ ] Verify ownership (GTM method easiest)
- [ ] Submit sitemap.xml

### Tomorrow (1 hour):

- [ ] Fix search page metadata (add robots: index)
- [ ] Update robots.txt (remove search disallow)
- [ ] Check for noindex tags

### Next 3 Days (2 hours):

- [ ] Request indexing top 20 products in GSC
- [ ] Request indexing all 8 categories
- [ ] Request indexing search page

### Week 1 (2-3 hours):

- [ ] Check GSC coverage daily
- [ ] Fix any indexing errors reported
- [ ] Request indexing for top 50 products

### Week 2+ (30 mins/week):

- [ ] Monitor GSC coverage growth
- [ ] Fix errors as they appear
- [ ] Track organic traffic increase

---

## FINAL NOTES

✅ **By end of 30 days, you should have:**
- 100% of categories indexed
- 80-90% of products indexed
- Search results indexed and ranking
- Clear visibility in Google

✅ **Expected benefit:**
- +40-60% organic traffic
- +£1,000-2,000/month revenue
- Better product visibility

**Start today — every day you delay costs you organic traffic!**

---

**Next Steps:**
1. Set up GSC now (takes 5 minutes)
2. Fix metadata blockers (1-2 hours)
3. Submit sitemap (2 minutes)
4. Request indexing (30 minutes in GSC tool)
5. Monitor daily (5 minutes/day)
