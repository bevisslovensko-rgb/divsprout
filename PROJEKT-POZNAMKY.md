# DivSprout — Projektové poznámky

> Tento dokument obsahuje všetko čo potrebuješ na správu a obnovu projektu.
> Uložený aj lokálne aj na GitHub.

---

## 1. DOMÉNY A DNS

**Registrátor domény: Porkbun**
- Web: https://porkbun.com
- Doména: `divsprout.com`
- Nameservery nastavené na Cloudflare:
  - `leah.ns.cloudflare.com`
  - `piotr.ns.cloudflare.com`
- ⚠️ Porkbun má tendenciu resetovať nameservery — skontroluj ich raz za čas

---

## 2. HOSTING A NASADENIE

**Cloudflare Pages**
- Web: https://dash.cloudflare.com
- Projekt: `divsprout`
- Napojený na GitHub repozitár: `bevisslovensko-rgb/divsprout`
- Vetva: `main`
- Automatické nasadenie: každý `git push` na `main` = nová verzia online do 1-2 minút
- Doména pripojená cez: Cloudflare Pages → Custom domains → `divsprout.com`

---

## 3. KÓD A REPOZITÁR

**GitHub**
- Web: https://github.com
- Repozitár: https://github.com/bevisslovensko-rgb/divsprout
- Vetva: `main`

**Lokálny priečinok**
- Cesta: `C:\Users\ssimo\Desktop\divsprout`
- Technológia: čistý HTML + CSS + JavaScript (žiadne frameworky)
- Súbory: 11 HTML stránok + CSS + JS assets

**Štruktúra webu:**
```
divsprout/
├── index.html                          ← Hlavná stránka
├── 404.html                            ← Stránka nenájdená
├── sitemap.xml                         ← Pre Google
├── about/index.html                    ← O projekte
├── privacy/index.html                  ← Ochrana súkromia
├── calculators/
│   ├── dividend-yield/index.html       ← Kalkulačka výnosu
│   └── drip/index.html                 ← DRIP kalkulačka
├── learn/
│   ├── index.html                      ← Rozcestník článkov
│   ├── what-is-drip/index.html
│   ├── dividend-yield-explained/index.html
│   ├── yield-on-cost/index.html
│   └── how-dividend-compounding-works/index.html
└── assets/
    ├── css/                            ← Štýly
    └── js/                             ← Skripty
```

---

## 4. POSTUP NAHRÁVANIA ZMIEN (GIT)

Spusti `cmd` (Windows + R → cmd) a zadaj:

```
cd C:\Users\ssimo\Desktop\divsprout
git add .
git commit -m "Popis zmeny"
git push
```

Potom počkaj 1-2 minúty → Cloudflare automaticky nasadí.

---

## 5. ANALYTIKA

**Google Analytics 4**
- Web: https://analytics.google.com
- Property: `DivSprout`
- Measurement ID: `G-R1J6FGJX6C`
- Stream ID: `14905439491`
- Sleduje: stránky, čas na stránke, krajiny, zariadenia, zdroje návštevnosti

**Google Search Console**
- Web: https://search.google.com/search-console
- Property: `https://divsprout.com/`
- Sleduje: indexovanie, kľúčové slová, pozície vo vyhľadávaní
- Sitemap: `https://divsprout.com/sitemap.xml` — odoslaná, status: Úspech (10 stránok)

**Cloudflare Analytics**
- Prístupné cez: https://dash.cloudflare.com → Analytics
- Sleduje: sieťové requesty, krajiny návštevníkov, chybové kódy

---

## 6. ÚČTY KTORÉ PROJEKT VYUŽÍVA

| Služba              | URL                              | Na čo slúži                        |
|---------------------|----------------------------------|------------------------------------|
| Porkbun             | porkbun.com                      | Doména divsprout.com               |
| Cloudflare          | dash.cloudflare.com              | Hosting, DNS, CDN, analytika       |
| GitHub              | github.com/bevisslovensko-rgb    | Úložisko kódu                      |
| Google Analytics    | analytics.google.com             | Správanie návštevníkov             |
| Google Search Console | search.google.com/search-console | SEO a indexovanie                 |

---

## 7. ZÁLOHOVANIE

### Automatická záloha (GitHub)
Každý `git push` = záloha na GitHub. Ak sa pokazí počítač, kód je bezpečný.

### Obnova na novom počítači
1. Nainštaluj Git: https://git-scm.com/download/win
2. Otvor cmd a zadaj:
```
cd C:\Users\[tvoje-meno]\Desktop
git clone https://github.com/bevisslovensko-rgb/divsprout.git
```
3. Priečinok `divsprout` sa stiahne kompletný s celou históriou.

### USB záloha (odporúčané)
**Áno, USB záloha má zmysel** — aj keď je kód na GitHub, mať fyzickú zálohu nikdy nezaškodí.

**Ako na to:**
- Skopíruj celý priečinok `C:\Users\ssimo\Desktop\divsprout` na USB kľúč
- Odporúčané: robiť zálohu vždy po väčšej zmene
- Prípadne použiť automatickú zálohu cez Windows zálohovanie

---

## 8. PLÁN MONETIZÁCIE (časový odhad)

| Fáza | Časový rámec | Akcia |
|------|-------------|-------|
| Teraz | Mesiac 1-2 | Tvorba obsahu, zdieľanie na Reddit/fórach |
| Krátko | Mesiac 2-3 | Affiliate linky (brokerages ako IBKR, Degiro) |
| Neskôr | Mesiac 4-6 | Google AdSense (vyžaduje etablovanú návštevnosť) |

---

## 9. DÔLEŽITÉ POZNÁMKY

- Stránka je **čisto statická** — žiadna databáza, žiadny server, žiadne heslo pre backend
- Všetky kalkulačky bežia **v prehliadači** — žiadne dáta sa neposielajú nikam
- Cloudflare Pages je **zadarmo** pre tento rozsah
- GitHub repozitár je **verejný** (public) — kód môže vidieť ktokoľvek

---

*Naposledy aktualizované: máj 2026*
