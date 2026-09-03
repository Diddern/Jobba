# Slik publiserer du en ny versjon av Jobba

Hele prosessen tar ca. 10 minutter. Selve opplastingen må gjøres manuelt i
nettleseren — Chrome Web Store krever innlogging med utviklerkontoen.

## Forutsetninger

- Node og npm installert (`npm ci` hvis `node_modules` mangler)
- Tilgang til [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
  med kontoen som eier Jobba
- Ren `main` uten ucommittede endringer

---

## 1. Bump versjonsnummer

Versjonen står **to** steder, og begge må oppdateres:

| Fil | Format | Merknad |
|---|---|---|
| `manifest.json` | `"version": "1.3"` | Dette er versjonen Chrome Web Store leser |
| `package.json` | `"version": "1.3.0"` | Kun for npm, men hold den i synk |

Regelen: ny funksjon → bump minor (1.2 → 1.3). Kun bugfix → bump patch (1.3 → 1.3.1).

> Chrome Web Store godtar **ikke** at du laster opp samme versjonsnummer to
> ganger, og heller ikke et lavere nummer enn det som allerede ligger ute.
> Glemmer du dette, feiler opplastingen.

## 2. Bygg

```bash
rm -rf dist
npm run lint
npm run build
```

`rm -rf dist` er viktig — `dist/` blir ikke ryddet automatisk, og gamle
hash-navngitte filer fra forrige bygg blir liggende igjen og havner i zip-en.

Sjekk at versjonen faktisk kom med:

```bash
grep '"version"' dist/manifest.json
```

## 3. Test lokalt før du laster opp

1. Åpne `chrome://extensions`
2. Skru på **Utviklermodus** øverst til høyre
3. **Last inn upakket** → velg `dist/`-mappen
4. Klikk på ikonet og sjekk at popup-en fungerer
5. Høyreklikk ikonet → **Alternativer** og sjekk innstillingssiden

Test alltid begge sidene — popup og innstillinger er separate HTML-sider, og
en byggefeil kan ramme kun den ene.

Husk å fjerne den upakkede versjonen igjen etterpå, ellers kjører du med to
installasjoner av Jobba samtidig.

## 4. Lag zip

```bash
cd dist
zip -r -X ../jobba-<versjon>.zip . -x '.*'
cd ..
```

`-X` dropper macOS-spesifikke metadata, og `-x '.*'` holder `.DS_Store` ute.
Slike filer er unødvendig ballast i pakken og kan bli flagget i gjennomgangen.

**Viktig:** `manifest.json` må ligge på rot-nivå *inne i* zip-en — ikke i en
undermappe. Derfor zipper vi fra innsiden av `dist/`, ikke `zip -r x.zip dist/`.

Verifiser:

```bash
unzip -l jobba-<versjon>.zip | grep manifest.json
```

Skal vise `manifest.json`, ikke `dist/manifest.json`.

## 5. Last opp til Chrome Web Store

1. Gå til [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Velg **Jobba** i listen
3. **Package** → **Upload new package** → velg zip-en
4. Gå gjennom **Store listing** hvis beskrivelsen skal endres.
   Skjermbilder ligger i `screenshots/` (ikke i git — mappen er gitignored)
5. Under **Privacy practices**: Jobba samler ingen data. Begrunnelsen for
   `storage`-tillatelsen er at innstillinger (lunsj, tema, desimaltimer) lagres
   lokalt hos brukeren. Sjekk at feltene fortsatt er utfylt — de må av og til
   bekreftes på nytt før du får sende inn
6. **Submit for review**

Gjennomgangen tar vanligvis fra noen timer til et par dager. Du får e-post når
den er godkjent eller avvist.

## 6. Firefox (valgfritt)

Samme zip fungerer på [addons.mozilla.org](https://addons.mozilla.org/developers/).
`manifest.json` inneholder allerede `browser_specific_settings.gecko` med
extension-ID og `strict_min_version`, så det trengs ikke et eget bygg.

## 7. Merk versjonen i git

```bash
git add manifest.json package.json
git commit -m "chore: bump versjon til <versjon>"
git tag v<versjon>
git push && git push --tags
```

---

## Feilsøking

**«An extension with this version already exists»**
Du glemte å bumpe `manifest.json`. Bump, bygg på nytt, zip på nytt.

**«Manifest file is missing or unreadable»**
`manifest.json` ligger i en undermappe inne i zip-en. Se steg 4.

**Popup-en er blank etter installasjon**
Høyreklikk i popup-en → **Inspiser** for å se konsollfeil. Vanligste årsak er
at `dist/` ikke ble ryddet før bygget, så `index.html` peker på en JS-fil som
ikke finnes lenger.

**Innstillinger lagres ikke**
`chrome.storage.sync` finnes kun når utvidelsen kjører som utvidelse. Kjører du
`npm run dev` i en vanlig fane, faller `Options.js` og `ThemeProvider.jsx`
tilbake på `localStorage` — men `TimeCalculator.jsx` gjør ikke det, og kaster
feil. Test alltid innstillinger via **Last inn upakket**, ikke via `npm run dev`.

## Om `dist.pem`

Den private nøkkelen brukes kun til å pakke en selvsignert `.crx` for
distribusjon utenom butikken. Den trengs **ikke** for publisering til Chrome
Web Store, som signerer pakken selv. Filen er gitignored (`*.pem`) — ikke commit
den, og ikke del den.
