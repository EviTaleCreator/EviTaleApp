# Evi Tale Creator · GitHub Pages

Pasakų svetainė veikia tik su GitHub Pages: nereikia atskiro serverio, duomenų bazės, slaptažodžių ar mokamo hostingo. GitHub Actions surenka statinius failus ir paskelbia juos po kiekvieno pakeitimo `main` šakoje.

**Svetainė:** https://evitalecreator.github.io/EviTaleApp/

## Pirmą kartą įjungti publikavimą

1. Saugykloje atidarykite **Settings → Pages**: https://github.com/EviTaleCreator/EviTaleApp/settings/pages
2. Skiltyje **Build and deployment → Source** pasirinkite **GitHub Actions**.
3. Atidarykite **Actions → Publish GitHub Pages → Run workflow → Run workflow**: https://github.com/EviTaleCreator/EviTaleApp/actions/workflows/pages.yml
4. Palaukite, kol `build` ir `deploy` užduotys bus žalios. Atidarykite aukščiau nurodytą svetainės adresą. Pirmas publikavimas gali užtrukti kelias minutes.

Vėliau užtenka įrašyti pakeitimus į `main`: publikavimas prasidės automatiškai. Atskiras Vercel ar kitas hostingas nereikalingas. Jei saugykla privati ir Pages nustatymuose prašoma pakeisti planą, privačiai saugyklai reikia tinkamo GitHub plano; saugyklos matomumo automatiškai nekeiskite. GitHub Pages svetainė paprastai viešai prieinama.

## Apsauga nuo neteisingo publikavimo šaltinio

Rekomenduojamas šaltinis yra **GitHub Actions**. Svetainė taip pat moka veikti tiesiai iš `main` šaknies: `index.html` naudoja santykinius CSS ir JavaScript kelius, o `src.js` veikia įprastoje naršyklėje be surinkimo. `.nojekyll` leidžia saugyklą pateikti kaip statinius failus. Tiesioginio pateikimo režimu iliustracijos imamos iš `public/illustrations/`, o pasakų kopija – iš `content/stories.json`.

Tai apsauga, kad alternatyvus Pages publikavimas nebeperrašytų veikiančios svetainės baltu langu. `content/stories.json` kopiją reikia palaikyti kartu su `content/stories/*.md`; pagrindinis Actions surinkimas visada naudoja `.md` failus. Keičiant tik `.md` failus patogiausia rinktis **Source → GitHub Actions**, kad svetainė visada naudotų automatiškai surinktą naujausią turinį.

`check-live-pages.mjs` tikrina abu pateikimo būdus: HTML, JavaScript ir CSS pasiekiamumą, visas pasakas pagal dabartinius `.md` failus bei jų iliustracijas. Jei naršyklėje liko sena versija, atidarykite svetainę privačiame lange arba atlikite pilną atnaujinimą (`Ctrl+Shift+R`).

## Pakeisti pasakos tekstą be programavimo

1. Atidarykite [content/stories](https://github.com/EviTaleCreator/EviTaleApp/tree/main/content/stories).
2. Pasirinkite pasakos `.md` failą ir spauskite pieštuką **Edit** (kai kuriuose vaizduose pirmiausia pasirinkite **Code**).
3. Pakeiskite pavadinimą, aprašymą arba tekstą. Pastraipas atskirkite tuščia eilute.
4. Paspauskite **Commit changes**, pasirinkite įrašymą į `main` ir patvirtinkite.
5. Actions lange palaukite žalio **Publish GitHub Pages** rezultato, tada atnaujinkite svetainę.

Kiekvienos pasakos pradžioje tarp `---` eilučių yra paprasti laukai:

| Laukas | Reikšmė |
| --- | --- |
| `id` | Unikalus vardas: mažosios lotyniškos raidės, skaitmenys ir brūkšneliai. |
| `title` | Pavadinimas. |
| `topic` | Tema. Nauja tema automatiškai atsiras filtruose. |
| `desc` | Trumpas vienos eilutės aprašymas lentynoje. |
| `status` | `published` – rodyti svetainėje; `draft` – neįtraukti teksto į svetainės failus. |
| `color` | Atsarginis viršelis: `night`, `pink` arba `garden`. |
| `sample` | `true` – pavyzdinis tekstas; savo pasakoms naudokite `false`. |
| `image` | Pvz. `illustrations/mano-pasaka.png`; galima palikti tuščią. |
| `imageAlt` | Trumpas iliustracijos aprašymas nematantiems skaitytojams. |

Kiekvieną lauką rašykite vienoje eilutėje, po dvitaškio. Išorinių kabučių nereikia. Po antros `---` eilutės rašykite pasaką. Pasirenkamas skyrius `## Suaugusiesiems` su papildomomis mintimis rodomas pasakos pabaigoje. Skaitymo trukmė apskaičiuojama automatiškai.

## Pridėti naują pasaką

1. Atidarykite [pasakos šabloną](content/PASAKOS-SABLONAS.txt) ir nukopijuokite dalį nuo pirmos `---` eilutės.
2. `content/stories` kataloge rinkitės **Add file → Create new file**.
3. Failą pavadinkite, pvz. `paukstelio-siulas.md`, įklijuokite šabloną ir užpildykite.
4. Pasirinkite naują unikalų `id`, pvz. `paukstelio-siulas`. Kol ruošiate tekstą, palikite `status: draft`.
5. Kai norėsite paskelbti, pakeiskite į `status: published` ir įrašykite pakeitimus.

Juodraščių tekstai nepatenka į svetainės paketą, tačiau lieka GitHub saugykloje ir jos istorijoje. Jei saugykla vieša, juodraščiai ten irgi vieši. Į `public/` įkelti paveikslėliai visada vieši, net jeigu pasaka yra juodraštis. Privačių duomenų saugykloje nelaikykite.

## Įkelti iliustraciją

1. Atidarykite [public/illustrations](https://github.com/EviTaleCreator/EviTaleApp/tree/main/public/illustrations).
2. Rinkitės **Add file → Upload files**, įkelkite PNG, JPG arba WebP ir įrašykite pakeitimus.
3. Naudokite trumpą failo vardą be tarpų ir lietuviškų raidžių, pvz. `paukstelio-siulas.webp`. Rekomenduojama iki 2 MB, kad puslapis greitai atsivertų telefone.
4. Pasakos faile įrašykite `image: illustrations/paukstelio-siulas.webp` ir užpildykite `imageAlt`.

Netaisyklingus laukus, pasikartojančius id ir nerastas iliustracijas tikrina surinkimas. Jei užduotis raudona, paskutinė sėkmingai paskelbta svetainė lieka veikti; klaidą pamatysite Actions užduoties žurnale.

## Vietinis kūrimas (nebūtina publikavimui)

Reikia Node.js 22 arba 24:

```sh
npm ci
npm run dev
```

Vietinė svetainė yra `/EviTaleApp/` kelyje, numatytasis prievadas 5173. Po pasakų `.md` pakeitimų paleiskite `npm run dev` iš naujo, kad būtų perkurti duomenys.

```sh
npm test
npm run build
npm run preview -- --port 4173
```

`dist/` turi tik viešą svetainę, paskelbtas pasakas ir iliustracijas. Tai visas Pages publikavimui reikalingas turinys. Bazinis kelias yra `/EviTaleApp/`; pakeitus saugyklos pavadinimą, atnaujinkite `vite.config.js` arba nustatykite `PAGES_BASE_PATH` surinkimo aplinkoje.

## Ankstesnis serverinis redaktorius

`admin/`, `server.mjs`, `dev.mjs`, `content/stories.json` ir `tests/server.test.mjs` išsaugoti ateičiai. Jie **neįtraukiami į GitHub Pages svetainę**, administratoriaus slaptažodžio Pages versijai nereikia. Serverinio varianto komandos: `npm run dev:editor`, `npm run build:editor`, `npm run start:editor`. Jam vis tiek reikia Node.js serverio, `ADMIN_PASSWORD` ir išliekančio disko. Jo `.data/` turinys automatiškai nepersikelia į Pages; dabartinės pasakos pateiktos `content/stories/*.md` failuose.

Įgarsinimas, mokėjimai ir vaiko paskyros kol kas neįgyvendinti.
