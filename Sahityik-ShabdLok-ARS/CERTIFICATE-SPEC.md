# ARS Certificate Specification

## 1. ARS सदस्यता / सहभागिता प्रमाणपत्र

डैशबोर्ड में तब उपलब्ध होगा जब ARS की सदस्यता/सहभागिता की निर्धारित शर्तें पूरी हों और रिकॉर्ड अधिकृत प्रक्रिया से जारी किया गया हो।

Fields:
- Certificate title: ARS सदस्यता / सहभागिता प्रमाणपत्र
- Member display name
- Certificate ID (unique)
- Issue date
- Short description of the participation category
- Authorized issuer name/designation/signature
- Verification URL or QR code

## 2. रचना योगदान / प्रकाशन प्रमाणपत्र

केवल किसी रचना के review, approval और actual publication के बाद जारी होगा।

Fields:
- Certificate title: रचना योगदान / प्रकाशन प्रमाणपत्र
- Author display name
- Work title and category
- Publication date
- Certificate ID (unique)
- Authorized issuer name/designation/signature
- Verification URL or QR code

## Design rules

- Cream background `#FBF6EB`, maroon `#6E2338`, gold `#B8954B`
- Founder page में फोटो या हस्ताक्षर नहीं
- अधिकृत हस्ताक्षर केवल certificate पर, अनुमति मिलने के बाद
- यदि विजेता/लेखक के हस्ताक्षर दिखाने हों तो वह अलग वैकल्पिक field हो
- Certificate को सरकारी या शैक्षणिक योग्यता के रूप में प्रस्तुत न करें
- हर certificate को public verification endpoint पर status (valid/revoked) से verify किया जा सके
