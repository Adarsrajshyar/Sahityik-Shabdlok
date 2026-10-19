# साहित्यिक शब्दलोक — ARS आदर्श साहित्य

यह React + Vite starter website है। इसमें responsive design, हिंदी साहित्य categories, search, copy/share/like/save, theme toggle, अलग ARS Book page, Founder page, demo Join/contact/submission forms, dashboard और certificate verification placeholder शामिल हैं।

## GitHub पर अपलोड
1. ZIP डाउनलोड करें और Windows में right-click → Extract All करें।
2. GitHub पर `Sahityik-Shabdlok` repository खोलें।
3. Add file → Upload files चुनें। Extract किए हुए folder के अंदर की सारी files/folders drag-drop करें; ZIP को सीधे डालना पर्याप्त नहीं है।
4. Commit changes दबाएँ।

## Vercel पर publish
1. Vercel में GitHub से sign in करें और Add New → Project चुनें।
2. `Sahityik-Shabdlok` import करें। Build command `npm run build`, output directory `dist` रखें।
3. Deploy करें।

## Local preview (वैकल्पिक)
Node.js LTS install करके project folder में `npm install` फिर `npm run dev` चलाएँ।

## ज़रूरी ईमानदार सीमाएँ
- अभी forms, login/admin/publisher और certificate verification demo placeholders हैं। Forms browser के localStorage में ही demo के रूप में save होते हैं, किसी admin या email तक नहीं जाते।
- असली OTP/login, multi-user submissions, roles, approvals, notifications और valid certificate IDs के लिए Supabase Auth/database, Row Level Security (RLS), server-side validation और EmailJS/server email setup करना होगा। Frontend-only role checks सुरक्षित नहीं हैं।
- कभी भी Supabase service-role key या email secret GitHub में upload न करें। `.env.example` में केवल खाली placeholders हैं।
- Founder photo बाद में `public/assets/founder-photo/founder.jpg` में रखें। सार्वजनिक repo में वही फोटो डालें जिसे public करना ठीक हो।
- ARS Book page अलग `src/pages/ARSBook.jsx` में है और book data `src/data/arsBookData.js` में बाद में जोड़ा जा सकता है।
- `public/sitemap.xml` और `public/robots.txt` में `YOUR-DOMAIN.example` को deploy के बाद अपने वास्तविक domain से बदलें। Google ranking की गारंटी नहीं होती।
