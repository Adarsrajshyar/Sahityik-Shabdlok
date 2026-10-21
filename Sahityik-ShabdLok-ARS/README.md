# साहित्य शब्दलोक — ARS आदर्श साहित्य

यह ZIP, ARS साहित्य शब्दलोक के लिए एक responsive frontend starter है। इसमें क्रीम + मैरून + गोल्ड थीम, दो बैनर-शैली वाले सेक्शन, साहित्य श्रेणियाँ, ARS Book, Founder Story, YouTube/Instagram लिंक, लॉगिन modal का डेमो और Supabase के लिए शुरुआती database schema शामिल हैं।

## पहले यह बात ध्यान में रखें

**यह अभी पूर्ण live backend नहीं है।** वेबसाइट का frontend चल जाएगा, लेकिन OTP लॉगिन, निजी प्रोफाइल, वास्तविक submissions, Admin/Publisher approval और PDF certificate issuance चालू करने के लिए Supabase project, Auth configuration, database SQL, security policies और testing की आवश्यकता है। डेमो में OTP भेजने का झूठा दावा नहीं किया जाता।

## फाइलें

- `index.html` — मुख्य वेबसाइट
- `styles.css` — responsive design और visual theme
- `app.js` — navigation, modal और demo interactions
- `supabase/schema.sql` — शुरुआती tables, RLS policies और सुरक्षित access का आधार
- `DEPLOYMENT.md` — GitHub Pages और backend setup checklist
- `CERTIFICATE-SPEC.md` — दो certificate types की specification

## लोकल पर देखें

1. ZIP extract करें।
2. `index.html` को browser में खोलें। बेहतर local testing के लिए VS Code का Live Server उपयोग कर सकते हैं।
3. लॉगिन / Join ARS पर क्लिक करें। यह demo modal है; OTP अभी नहीं भेजता।

## GitHub Pages

GitHub repository `Sahityik-ShabdLok` में files upload करें। यदि repository project page के रूप में प्रकाशित हो रही है, तो Settings → Pages में branch/folder चुनें। विस्तार के लिए `DEPLOYMENT.md` देखें।

## वास्तविक सिस्टम बनाने का अगला चरण

1. Supabase project बनाएँ।
2. `supabase/schema.sql` को SQL Editor में समीक्षा करके चलाएँ।
3. Authentication में phone/email providers सेट करें; SMS provider की लागत/सीमाएँ जाँचें।
4. Admin और Publisher को server-side trusted process से role दें; public signup को कभी भी अपने-आप Admin role न दें।
5. frontend को Supabase Auth/Database से जोड़ें; secrets केवल server-side रखें।
6. submissions, approvals, publication, certificate PDF और public verification route का end-to-end परीक्षण करें।

**सुरक्षा:** इस starter में कोई वास्तविक secret/API key शामिल नहीं है। Supabase `service_role` key या OTP किसी public frontend file में कभी न रखें।
