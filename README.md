# NEERAKSHAK – React (Vite) version

Original HTML project ka React/JSX version. Design, animations aur behaviour wahi hain, sirf structure React ka hai.

## Chalane ka tareeka
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run preview
```
Note: ab `.html` file double-click se nahi khulegi, `npm run dev` chalana padega.

## Routes (purani file -> naya route)
| Purani file | Route |
|---|---|
| 1index.html | `/` |
| 2admin.html | `/admin` |
| 3authority.html | `/authority` |
| 4godown.html | `/godown` |
| 5groundofficer.html | `/ground-officer` |
| 6monitoring.html | `/monitoring` |
| login.html | `/login` |

Purane naam (jaise `/2admin.html`) bhi kaam karte hain aur apne aap naye route par pahunch jaate hain.

## Folder structure
```
public/                 images + seed.js (demo data yahin edit/clear karo)
src/App.jsx             routes
src/main.jsx            entry
src/pages/<page>/
    <Page>.jsx          markup (HTML -> JSX)
    <page>.css          us page ki original CSS, bina badle
    <page>.legacy.js    us page ki original JS logic, bina badle
```

## Kya badla, kya nahi
- CSS aur JS logic original ke hisaab se same hain. JS me sirf `DOMContentLoaded` aur `.html` links badle gaye hain.
- HTML ke `class`, `style`, `onclick` jaise attributes JSX ke format me convert hue hain.
- Is version me JS abhi bhi seedha DOM se kaam karta hai (`getElementById`, `innerHTML`). Aage ise dheere-dheere React state/components me todna ho to page-by-page kar sakte ho.
