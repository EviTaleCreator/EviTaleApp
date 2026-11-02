# Evi Tale Creator

Lietuviška pasakų lentyna ir slaptažodžiu apsaugotas turinio redaktorius. Vieša svetainė rodo tik paskelbtas pasakas; juodraščiai prieinami tik prisijungus. Turinys išsaugomas serveryje, o ne naršyklėje ar automatiškai GitHub saugykloje.

## Paleidimas savo kompiuteryje

Reikia Node.js 22 arba 24.

1. `npm ci`
2. Nukopijuokite `.env.example` į `.env`. Savo kompiuterio teksto redaktoriumi įrašykite unikalų `ADMIN_PASSWORD` (bent 12 simbolių). `.env` yra ignoruojamas Git. Slaptažodžio nekelkite į GitHub ir nesiųskite pokalbyje.
3. `npm run dev -- --port 5173`
4. Vietinėje naršyklėje atidarykite svetainę per 5173 prievadą; redaktorius yra `/admin/`. Prisijunkite nustatytu slaptažodžiu.

Jei slaptažodis nenustatytas, vieša lentyna veikia, bet prisijungimas į redaktorių lieka užrakintas. Slaptažodžio pakeitimui ir naujam `.env` pritaikyti paleiskite serverį iš naujo. Sesijos galioja iki 8 valandų ir nutraukiamos perkrovus serverį.

## Kaip naudotis redaktoriumi

- Svetainės apačioje rinkitės **Turinio redaktorius** arba atidarykite `/admin/`.
- Rinkitės esamą pasaką arba **Nauja pasaka**.
- Įrašykite pavadinimą, temą, aprašymą, tekstą ir, jei norite, pastabas suaugusiesiems. Pastraipas atskirkite tuščia eilute; skaitymo trukmė apskaičiuojama automatiškai.
- Įkelkite PNG, JPG arba WebP iki 8 MB ir pridėkite vaizdo aprašymą. SVG nepriimamas.
- **Peržiūrėti** parodo dar neišsaugotą tekstą. **Išsaugoti pakeitimus** išsaugo serveryje.
- **Juodraštis** slepiamas nuo lankytojų. **Paskelbta** parodo pasaką viešoje lentynoje po išsaugojimo. Norint paslėpti pasaką, grąžinkite į juodraštį ir išsaugokite.
- **Atsisiųsti turinio kopiją** eksportuoja tekstus JSON formatu. Ši kopija neapima iliustracijų; visai atsarginei kopijai saugokite visą duomenų katalogą.
- Trinant prašoma patvirtinimo. Redaktorius įspėja apie neišsaugotus pakeitimus ir atmeta konfliktuojančius pakeitimus iš kito lango.

## Viešas hostingas

Tai Node.js programa, ne vien statiniai failai. Vien GitHub Pages ar statinio Vercel diegimo šiam redaktoriui nepakanka. Reikia Node.js hostingo su **išliekančiu disku** ir HTTPS, pavyzdžiui, tinkamai sukonfigūruoto Render/Railway serverio ar VPS.

- Diegimo komanda: `npm ci && npm run build`.
- Paleidimo komanda: `npm start`.
- Hostingo saugiuose aplinkos nustatymuose pridėkite `ADMIN_PASSWORD`.
- `DATA_DIR` turi nurodyti išliekančiame diske esantį katalogą, pvz. `/data/evitale`. Prijunkite diską prieš pirmą naudojimą. Duomenys negali būti laikomi vien laikinoje aplikacijos failų sistemoje.
- `PORT` pateikia hostingas (numatyta 3001). Naudokite HTTPS ir vieną serverio egzempliorių; failinė saugykla neskirta keliems serveriams ar bendradarbiavimui realiu laiku.
- Įjungus išorinį reverse proxy, jis turi išsaugoti pradinį `Host` ir perduoti `X-Forwarded-Proto: https`, kad sesijos slapukas būtų pažymėtas `Secure`.

Pirmą kartą serveris nukopijuoja `content/stories.json` į `DATA_DIR/stories.json`. Vėliau redaktorius rašo tik į duomenų katalogą, o atnaujinant programos kodą esamas turinys neperrašomas. Iliustracijos saugomos `DATA_DIR/uploads/`. Reguliariai kopijuokite visą `DATA_DIR` į saugią atsarginių kopijų vietą. Ištrintų ar pakeistų iliustracijų failai automatiškai netrinami, kad nebūtų prarastas dar naudojamas turinys; viešai tiekiami tik paskelbtų pasakų naudojami failai.

## Patikros ir struktūra

```sh
npm run build
npm test
```

- `server.mjs`: prisijungimas, sesijos, turinio API, vaizdų įkėlimas ir produkcinio puslapio pateikimas.
- `admin/`: turinio redaktorius; `content/stories.json`: tik pradinės pasakos.
- `src.js`, `style.css`: viešoji svetainė; `shared.js`: tekstų HTML ekranavimas.
- `tests/server.test.mjs`: realaus serverio integracijos patikros su laikina saugykla.
- `docs/`: svetainės ir redaktoriaus ekrano nuotraukos.

Dabartiniai tekstai yra pavyzdiniai. Pagrindinio ekrano iliustracija sugeneruota AI; pasakų viršeliuose, kol neįkeltas vaizdas, naudojami CSS piešiniai. Mėgstamos pasakos saugomos lankytojo naršyklėje. Įgarsinimas, mokėjimai ir vaiko paskyros dar neįgyvendinti. Prieš viešą publikavimą peržiūrėkite tekstus ir naudojamų iliustracijų teises.
