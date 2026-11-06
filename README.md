
# साहित्यिक शब्द लोक

**ARS – Adarsh Raj Shayar**

> शब्दों से संवेदना तक…

## परियोजना परिचय

साहित्यिक शब्द लोक एक हिंदी साहित्यिक वेबसाइट परियोजना है।
इसका उद्देश्य शायरी, कविता, कहानी और लेखकों के समुदाय को एक मंच देना है।

## वेबसाइट की तकनीक

- HTML
- CSS
- JavaScript
- GitHub Pages (Frontend Hosting)
- Supabase (भविष्य में Database और Authentication के लिए)

## मुख्य सुविधाएँ

1. मुखपृष्ठ
2. हमारे बारे में
3. शायरी संग्रह
4. कविता संसार
5. कहानी संसार
6. ARS पुस्तकालय
7. लेखक समुदाय
8. Login और Registration
9. रचना जमा करने का पृष्ठ
10. Author Dashboard
11. Publisher Dashboard
12. Admin Dashboard
13. प्रमाणपत्र पृष्ठ
14. प्रमाणपत्र सत्यापन
15. संपर्क पृष्ठ
16. गोपनीयता नीति
17. नियम एवं शर्तें

## वेबसाइट की फाइलें

सभी फाइलें एक ही मुख्य repository में रखें।

- index.html
- style.css
- main.js
- about.html
- shayari.html
- poetry.html
- stories.html
- ars-book.html
- community.html
- login.html
- contact.html
- certificate.html
- admin.html
- publisher.html
- author-dashboard.html
- submit.html
- verify.html
- privacy.html
- terms.html
- README.md

## GitHub Pages पर वेबसाइट प्रकाशित करना

1. GitHub पर एक नया repository बनाएँ।
2. ऊपर दी गई सभी फाइलें repository के मुख्य भाग में upload करें।
3. Repository में Settings खोलें।
4. Pages विकल्प पर जाएँ।
5. Deploy from a branch चुनें।
6. Branch में main और folder में /(root) चुनें।
7. Save करें।
8. GitHub Pages द्वारा दिए गए वेबसाइट लिंक को खोलें।

## Backend की स्थिति

वर्तमान कोड मुख्यतः Frontend है।

निम्न सुविधाओं के लिए Backend और Database जोड़ना आवश्यक है:

- वास्तविक Login और Registration
- सुरक्षित User Roles
- Author और Publisher permissions
- रचना जमा करना और Database में सुरक्षित रखना
- Admin द्वारा उपयोगकर्ता प्रबंधन
- प्रमाणपत्र जारी करना
- QR आधारित प्रमाणपत्र सत्यापन
- रचनाओं की समीक्षा और प्रकाशन

## Supabase कनेक्शन

Supabase को बाद में Authentication और Database के लिए जोड़ा जा सकता है।

सुरक्षा निर्देश:

- केवल आवश्यक Public Anon/Publishable Key को Frontend में उपयोग करें।
- Service Role Key या Secret Key कभी भी सार्वजनिक JavaScript फाइल में न रखें।
- Database में Row Level Security (RLS) लागू करें।
- Admin और Publisher के अधिकार केवल सुरक्षित Backend नियमों से नियंत्रित करें।

## सोशल मीडिया

YouTube:
https://www.youtube.com/@Adarshshyari

## संस्थापक

**आदर्श राज**

Founder – ARS

© ARS – साहित्यिक शब्द लोक
