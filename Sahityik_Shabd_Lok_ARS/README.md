# साहित्यिक शब्द लोक — ARS

यह GitHub Pages + Supabase आधारित हिंदी साहित्यिक वेबसाइट का starter project है।

## फाइलें
- `index.html` — वेबसाइट का ढाँचा और सभी मुख्य सेक्शन
- `style.css` — Green / Cream / Antique Gold responsive design
- `script.js` — UI, Supabase authentication, author submission और review dashboard
- `supabase_setup.sql` — database tables और Row Level Security policies

## 1. GitHub Pages पर वेबसाइट प्रकाशित करें
1. GitHub पर नया repository बनाएँ, उदाहरण: `sahityik-shabd-lok`.
2. इन सभी फाइलों को repository के root में upload करें.
3. Repository → Settings → Pages खोलें.
4. Build and deployment में `Deploy from a branch` चुनें.
5. Branch `main` और folder `/ (root)` चुनकर Save करें.
6. GitHub द्वारा दिया गया Pages URL खुलने में कुछ मिनट लग सकते हैं.

## 2. Supabase backend जोड़ें
1. Supabase पर नया project बनाएँ.
2. Project → SQL Editor → New query में `supabase_setup.sql` का पूरा SQL चलाएँ.
3. Project Settings → API से Project URL और `anon` / publishable key कॉपी करें.
4. `script.js` के सबसे ऊपर `SUPABASE_URL` और `SUPABASE_ANON_KEY` में अपने मान रखें.
5. Supabase Authentication → URL Configuration में अपनी GitHub Pages URL को Site URL और Redirect URLs में जोड़ें.
6. Email confirmation चालू हो तो users को अपने ईमेल से पुष्टि करनी होगी.

## 3. Admin और Publisher सेट करें
1. वेबसाइट पर अपना account बनाएँ.
2. Supabase → Authentication → Users में अपना user UUID कॉपी करें.
3. SQL Editor में यह चलाएँ:
   `update public.profiles set role='admin' where id='YOUR_AUTH_USER_UUID';`
4. Publisher बनाने के लिए उसी तरह role को `publisher` करें.
5. केवल भरोसेमंद व्यक्तियों को Publisher दें.

## 4. Certificates और QR
इस संस्करण में certificate records के लिए सुरक्षित database table तैयार है, लेकिन certificate PDF issuing UI और public QR verification page अभी शामिल नहीं हैं। QR verification को production में चालू करने के लिए अगला development चरण चाहिए। किसी certificate को सरकारी/शैक्षणिक मान्यता वाला न बताएं।

## 5. महत्वपूर्ण सीमाएँ
- यह एक working starter release है, पूर्ण audited production system नहीं.
- Frontend में केवल Supabase anon/publishable key रखें; `service_role` key कभी नहीं.
- Admin/Publisher promotion केवल Supabase SQL से करें.
- Supabase और GitHub के free plans की usage limits हो सकती हैं; unlimited/lifetime-free hosting का वादा नहीं.
- Google Fonts और Supabase JS CDN के लिए internet connection चाहिए.
- Footer में `contact@example.com` को अपने वास्तविक contact email से बदलें.
- YouTube/Instagram links तभी जोड़ें जब आपके सही profile URLs उपलब्ध हों.
- Certificate PDF creation, QR generation/verification UI, account moderation, rate limiting, backups, privacy policy और terms page को public launch से पहले जोड़ना चाहिए.

## 6. Local preview
इन फाइलों को एक ही folder में रखें और `index.html` खोलें. Supabase config के बिना site demo mode में खुलेगी; login/submission database features काम नहीं करेंगे.
