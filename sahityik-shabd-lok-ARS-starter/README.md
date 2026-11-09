# साहित्यिक शब्द लोक — ARS

हिंदी शायरी, कविता, कहानी और लेखक समुदाय के लिए responsive publishing website.

## Files
सभी HTML/CSS/JS/SQL files एक ही GitHub repository root में रखें। `shared.js` भी जरूरी है।

## 1. GitHub Pages
Repository → Settings → Pages → Deploy from a branch → `main` → `/(root)` → Save.
URL: `https://USERNAME.github.io/REPOSITORY/`

## 2. Supabase backend (free tier limits apply)
1. Supabase पर नया project बनाएँ.
2. SQL Editor में `database.sql` का पूरा SQL चलाएँ.
3. Project Settings → API से Project URL और anon/publishable key लें.
4. `supabase-config.js` में placeholders बदलें. Service Role/Secret key कभी न डालें.
5. Authentication → URL Configuration में Site URL और Redirect URLs में GitHub Pages URL जोड़ें.
6. Email confirmation सेटिंग अपनी जरूरत के अनुसार रखें.
7. वेबसाइट पर अपना Admin email इस्तेमाल करके Register करें.
8. SQL Editor में नीचे की query चलाएँ (ईमेल बदलें):
   `update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR-ADMIN-EMAIL');`
9. Admin dashboard से staff roles assign करने की सुविधा इस starter में सीमित है; Publisher को trusted SQL/admin workflow से promote करें:
   `update public.profiles set role='publisher' where id=(select id from auth.users where email='PUBLISHER-EMAIL');`
10. फिर logout/login करें.

## 3. Important limits / security
- GitHub Pages केवल static frontend host करता है; Supabase अलग backend provider है.
- Free tier में quotas, pausing, storage and email limits बदल सकते हैं. ₹0 शुरुआत संभव है, permanent unlimited free guarantee नहीं.
- Never put service_role/secret keys in frontend.
- RLS is enabled. Test with separate reader/author/publisher/admin accounts before public launch.
- Certificate issuing UI and QR generation are not yet implemented as an admin workflow in this starter. Certificate verification checks records already inserted into `certificates`; generate IDs and issue records only through a trusted admin process.
- Admin user management and moderation audit trail need additional hardening before production use.
- Add a real contact email and review privacy/terms before collecting real user data.
- Instagram is intentionally left optional; Admin can add link in future (settings table exists).
- YouTube: https://www.youtube.com/@Adarshshyari

## 4. Current functionality
- Responsive public site, navigation, public content listing from `works`.
- Supabase email/password signup/login/reset.
- Author submissions; Publisher/Admin review and publishing.
- Author dashboard for own submissions and issued certificate records.
- Public certificate verification.
- Admin settings fields for YouTube, Instagram, group URL and contact email.

This is a starter implementation, not a security audit or production certification.
