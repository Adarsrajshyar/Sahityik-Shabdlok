# Deployment और वास्तविक backend setup

## A. Frontend को GitHub पर अपलोड करना

1. ZIP को extract करें।
2. अपने GitHub खाते में `Sahityik-ShabdLok` repository खोलें।
3. Add file → Upload files चुनें।
4. `index.html`, `styles.css`, `app.js`, README और बाकी folders upload करें। ZIP file को repository में रख देना पर्याप्त नहीं—उसकी contents upload करनी हैं।
5. Commit changes करें।
6. Repository → Settings → Pages में deployment source चुनें (आमतौर पर `Deploy from a branch`, branch `main`, folder `/ (root)`)।
7. Pages द्वारा दिए गए URL को खोलकर mobile और desktop दोनों पर जाँचें।

## B. Supabase project

1. Supabase में नया project बनाएं और database password सुरक्षित रखें।
2. SQL Editor में `supabase/schema.sql` को ध्यान से review करके चलाएँ।
3. Authentication providers में Phone और Email OTP configure करें। SMS के लिए supported provider और खर्च/limits जाँचें।
4. RLS policies की जाँच करें; service-role key को browser JavaScript या GitHub में न रखें।
5. Admin/Publisher role सिर्फ trusted server-side process या manually verified SQL operation से दें। सार्वजनिक form से role चुने जाने की अनुमति न दें।

## C. वास्तविक फीचर्स जोड़ने की सूची

- Phone OTP और email OTP: Supabase Auth SDK से
- Profile dashboard: केवल logged-in user अपनी private details edit करे
- Submission form: title, type, category, original work, author consent, status
- Admin/Publisher dashboard: pending review, approve, request revision, reject, publish
- Certificate system: unique certificate ID, issue log, PDF generation और public verification page
- Moderation: spam prevention, rate limits, report/takedown workflow
- Privacy: public profile में phone/email न दिखाएँ; data retention और deletion process तय करें
- Backups, error monitoring और deployment testing

## D. जरूरी परीक्षण

- गलत/expired OTP
- कई बार OTP माँगना और rate limiting
- सामान्य सदस्य द्वारा Admin URL/API access की कोशिश
- एक सदस्य द्वारा दूसरे सदस्य की private submission पढ़ने की कोशिश
- approval से पहले रचना public न दिखे
- केवल approved/published contribution पर contribution certificate बने
- certificate number की uniqueness और verification
- mobile layout, keyboard navigation और form validation

## GitHub Pages की सीमा

GitHub Pages static frontend host करता है। यह अपने आप सुरक्षित authentication, private database, approval workflow या certificate generation backend नहीं देता। इन सुविधाओं के लिए backend service (जैसे Supabase) और सुरक्षित configuration जरूरी है।
