
# साहित्यिक शब्द लोक
### Adarsh Raj Shayar (ARS)
**Tagline:** शब्दों से संवेदना तक…

## 1. Project के बारे में

साहित्यिक शब्द लोक एक हिंदी साहित्यिक वेबसाइट है, जहाँ लेखक अपनी मौलिक शायरी, कविता और कहानियाँ जमा कर सकते हैं। स्वीकृत रचनाएँ वेबसाइट पर प्रकाशित की जा सकती हैं।

## 2. मुख्य सुविधाएँ

- हिंदी शायरी, कविता और कहानी
- Reader और Author अकाउंट
- Email OTP Login
- Author Dashboard
- Admin और Publisher Panel
- रचनाओं की समीक्षा और प्रकाशन
- Publication Certificate
- Certificate ID और Verification
- ARS Book सेक्शन
- YouTube लिंक और वेबसाइट संपर्क

## 3. इस्तेमाल की गई तकनीक

- HTML
- CSS
- JavaScript
- GitHub Pages
- Supabase Authentication
- Supabase PostgreSQL Database
- Supabase Row Level Security

## 4. GitHub Pages पर वेबसाइट चलाना

1. GitHub पर अपना Repository खोलें।
2. Settings पर जाएँ।
3. Pages खोलें।
4. Build and deployment में Deploy from a branch चुनें।
5. Branch में `main` और folder में `/ (root)` चुनें।
6. Save करें।
7. GitHub Pages का प्रकाशित URL खोलें।

मुख्य वेबसाइट फाइल `index.html` है।

## 5. Supabase Backend Setup

1. https://supabase.com पर अकाउंट बनाएँ।
2. नया Project बनाएँ।
3. Project URL और Publishable/anon key प्राप्त करें।
4. `supabase-config.js` खोलें।
5. `YOUR_SUPABASE_PROJECT_URL` की जगह Project URL डालें।
6. `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY` की जगह public key डालें।
7. `database.sql` की पूरी SQL Supabase Dashboard के SQL Editor में चलाएँ।

**सुरक्षा:** कभी भी `service_role` या secret key को GitHub पर अपलोड न करें।

## 6. Email OTP सेटअप

Supabase Dashboard में:

1. Authentication खोलें।
2. Providers में Email चुनें।
3. Email provider सक्षम रखें।
4. OTP / Email template की सेटिंग जाँचें।
5. Authentication URL Configuration में अपनी GitHub Pages वेबसाइट का URL जोड़ें।
6. Redirect URLs में अपनी वेबसाइट का URL जोड़ें।

Email OTP भेजने की सुविधा Supabase की Email configuration और उसकी limits पर निर्भर करेगी।

## 7. पहला Admin अकाउंट

1. वेबसाइट पर अपना अकाउंट बनाएँ।
2. Supabase Dashboard खोलें।
3. Authentication → Users में जाएँ।
4. अपने अकाउंट का UUID कॉपी करें।
5. SQL Editor में यह command चलाएँ:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR-USER-UUID';
```

`YOUR-USER-UUID` को अपने वास्तविक UUID से बदलें।

इसके बाद Admin Panel खोलें।

## 8. Publisher बनाना

Admin Panel से किसी सदस्य का Role `publisher` किया जा सकता है।

Publisher को रचनाओं की समीक्षा और प्रकाशन की अनुमति होगी। Database की RLS policies भी इसकी जाँच करेंगी।

## 9. Starter Content

`seed-content.js` में कुछ मौलिक नमूना रचनाएँ हैं।

Admin Login के बाद Admin पेज में यह button जोड़कर sample content डाला जा सकता है:

```html
<button id="seed-content-btn">
  Sample Content जोड़ें
</button>
```

यह शुरुआती नमूना सामग्री है, पूरी प्रस्तावित साहित्यिक लाइब्रेरी नहीं।

## 10. Certificate System

जब कोई pending submission प्रकाशित होगा, Database Trigger उसके लिए Certificate Record बनाएगा।

Certificate Verification Database के रिकॉर्ड से होगी।

प्रमाणपत्र को सरकारी प्रमाणपत्र या सरकारी मान्यता के रूप में प्रस्तुत नहीं किया जाना चाहिए।

## 11. जरूरी सुरक्षा बातें

- Supabase RLS हमेशा Enabled रखें।
- Admin और Publisher की भूमिका केवल अधिकृत Admin बदले।
- Secret keys को सार्वजनिक JavaScript में न रखें।
- GitHub Repository में कोई Password या निजी जानकारी न डालें।
- वास्तविक उपयोग से पहले Login, submission, publishing और certificate verification का परीक्षण करें।
- Supabase और GitHub Pages की free-plan limits लागू होंगी।

## 12. Project पहचान

**Website:** साहित्यिक शब्द लोक  
**Brand:** Adarsh Raj Shayar / ARS  
**Founder:** Adarsh Raj Shayar  
**YouTube:** https://www.youtube.com/@Adarshshyari

**शब्दों से संवेदना तक…**
