# Evi Tale Creator

Lietuviškas virtualios pasakų lentynos prototipas. Temos, paieška, vietoje išsaugomos mėgstamos pasakos ir skaitymo langas su pastabomis suaugusiesiems. Turinys yra pavyzdinis; pagrindinio ekrano iliustracija sugeneruota AI pagal pasirinktą pasakų knygos vizualinę kryptį. Pasakų viršeliuose kol kas likę CSS piešiniai.

## Paleidimas

Naudokite Node.js 22 arba 24. Projekto kataloge:

```sh
npm ci
npm run dev -- --port 5173
```

```sh
npm run build
npm run preview -- --port 4173
```

Pasakų turinys: `src.js`, išvaizda: `style.css`. Pagrindinio ekrano iliustracija: `public/illustrations/red-thread-bird.png`. Peržiūros: `docs/svetaines-perziura.png` ir `docs/telefono-perziura.png`.

Mėgstamos pasakos saugomos tik šios naršyklės localStorage; paskyrų ir serverio nėra. Įgarsinimas, mokėjimai, vaiko paskyros ir vaizdo įrašai yra būsimos galimybės. Prieš publikavimą reikia pakeisti pavyzdinį turinį, peržiūrėti tekstus ir paruošti privatumo informaciją, jei bus renkami asmens duomenys.
