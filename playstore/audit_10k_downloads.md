# DivSprout — Audit pre cieľ 10 000 stiahnutí

**Stav:** 62 stiahnutí, ~25 aktívnych používateľov, 3 týždne na trhu  
**Cieľ:** 10 000 stiahnutí  
**Vypracoval:** Claude, máj 2026

---

## Celkové hodnotenie

Aplikácia má solídny základ — správny matematický model, pekný dizajn, features ako FIRE tracker, scenáre, míľniky a share card. Problém nie je v kvalite kódu, ale v **distribúcii a chýbajúcej platforme**. Dosiahnuť 10 000 stiahnutí len na Android Play Store s dividendovým kalkulátorom je možné, ale pomalé. Nižšie sú konkrétne kroky v poradí priority.

---

## 🔴 KRITICKÉ — Riešiť ako prvé

### 1. Nie si na iOS
Toto je pravdepodobne najväčšia chyba. Dividend investing komunita je silno zastúpená na iPhone — Reddit, Twitter/X, YouTube komentáre to potvrdzujú. Ak chceš 10 000 stiahnutí, musíš byť aj na App Store. Flutter to umožňuje takmer bez zmeny kódu — len iOS konfigurácia (Runner.xcworkspace, AdMob iOS bundle ID, App Store Connect account). Bez iOS budú čísla rásť pomaly.

**Odhadovaný dopad:** +50–80% downloads

### 2. Scenáre sú zadarmo: 0 slotov
`freeSlots = 0` v `scenario_service.dart` — to znamená, že používateľ si nemôže uložiť ANI JEDEN scenár bez toho, aby pozrel reklamu. Toto je príliš agresívne pri prvom použití. Používateľ príde, skúsi uložiť scenár, vyskočí reklama a veľká časť odíde. Daj aspoň **2–3 free slotov** zadarmo, reklama nech slúži na rozšírenie nad tento limit. Konverzia na ad view bude paradoxne vyššia, pretože používateľ bude v appke dlhšie a bude mať dôvod ostať.

**Odhadovaný dopad:** -30% churn pri prvej relácii

---

## 🟠 DÔLEŽITÉ — Riešiť v ďalšom update

### 3. Chýba home screen widget
Dividend investing je o dlhodobom sledovaní. Keby mohol používateľ vidieť "Aktuálna projekcia: $847/mes" priamo na domovskej obrazovke bez otvárania appky, bude appka v jeho telefóne dlhšie. Flutter má `home_widget` package — implementácia trvá 1–2 dni. Toto je feature, ktorú kompetícia väčšinou nemá.

**Odhadovaný dopad:** +40% retencia

### 4. Žiadne push notifikácie
Milestone notifikácia — "Si na 60% cesty k FIRE cieľu! 🎉" — keď používateľ ručne prepočíta. Alebo weekly reminder: "Skontroluj svoj dividend plán." Bez notifikácií je retencia (DAU/MAU) nízka. Používateľ appku zabudne.  
Package: `flutter_local_notifications` + naplánované triggery pri zmene vstupov.

**Odhadovaný dopad:** +25% retencia

### 5. Žiadna webová verzia / landing page
Väčšina stiahnutí dividendových kalkulátorov ide z Google Search, nie z Play Store search. Ak napíšeš "dividend calculator" do Google, vyjdú webové kalkulátory — a tie potom odkazujú na svoju appku. Potrebuješ webovú stránku `divsprout.app` s kalkulátorom (môže byť jednoduchší), SEO článkami ("How to calculate dividend income", "FIRE calculator 2026") a bannerom "Download the app". Toto je kanál č. 1 pre organický rast.

**Odhadovaný dopad:** pravdepodobne 5–10× viac stiahnutí dlhodobo

### 6. Žiadna export funkcia
Používatelia chcú zdieľať alebo zálohovať svôj plán. Share card existuje (dobrý nápad), ale chýba **export do PDF alebo CSV**. Ľudia zdieľajú tabuľky na Reddit a YouTube ("Ukážem vám môj plán") — DivSprout logo na každom PDF je zadarmo marketing. Implementácia: `pdf` package, exportuje všetky scenáre + graf.

**Odhadovaný dopad:** virálny efekt, community zdieľanie

---

## 🟡 STREDNÁ PRIORITA — Nasledujúce mesiace

### 7. UX: Jedna dlhá obrazovka je problém
Kalkulačka, graf, FIRE goal, scenáre, míľniky — všetko v jednom veľkom scrolle. Na malých telefónoch je to chaotické. Zvaž **bottom navigation bar** s 3 tabmi:
- `Calculator` (vstupy + výsledky)
- `My Plan` (FIRE cieľ, míľniky, scenáre)
- `Settings` (mena, jazyk, o appke)

Toto pomôže aj retencii — používatelia nájdu features, ktoré inak prejdú.

### 8. Onboarding je príliš rýchly
Po onboardingu sa používateľ ocitne na prázdnej kalkulačke s defaultnými hodnotami. Nie je jasné čo robiť. Pridaj **"Quick Start" prompt** — napr. malý tooltip alebo animated pulse na tlačidle Calculate. Prípadne po onboardingu automaticky spusti prvý výpočet s defaultnými hodnotami a ukáž výsledok — "aha, toto robia tieto čísla".

### 9. Hardcodované anglické texty v modeli
`FreedomDateResult.formatted` vracia anglické "Not achievable", "months", "years" — tieto nie sú v lokalizácii (`app_localizations.dart`). Nemecký, taliansky, španielsky a kórejský používateľ vidí angličtinu. Treba preniesť do `l10n`.

### 10. Chýba "About / Credits" sekcia
Používatelia chcú vedieť kto appku robí, ako kontaktovať support, a vidieť verziu appky. Dôležité aj pre Play Store — Google môže požadovať kontaktný email pre support.

---

## 🔵 MONETIZÁCIA — Optimalizácia

### 11. Len AdMob — málo výnosov
Aktuálny model: banner ad + rewarded na scenáre. Pre 10 000 users s typickým RPM $1–3 budeš zarábať $10–30/deň. To je fajn, ale môžeš viac. Zváž **DivSprout Pro** (one-time purchase, $2.99):
- Neobmedzené scenáre bez reklám
- Export do PDF
- Widget (ak implementuješ)
- Tmavý + svetlý theme toggle  

In-app purchase cez `in_app_purchase` package. Flutter to podporuje. Pro users budú tiež menej churnovať.

### 12. Banner reklama je na dne obrazovky
V appke kde používatelia scrollujú veľa, banner na spodku je správne umiestnený. Ale zvýš CTR tým, že banner zobrazíš až po prvom výpočte — nie hneď pri otvorení. Používateľ, ktorý videl výsledok, je angažovanejší a menej ho reklama otravuje.

---

## 🟢 MARKETING / RAST — Kanály

### 13. Žiadna komunita prítomnosť
Play Store search pre "dividend calculator" má obmedzený objem. Používatelia dividend kalkulátorov sú na:
- **Reddit:** r/dividends (600K), r/financialindependence (2M), r/personalfinance (20M)
- **YouTube:** Dividend investori (Graham Stephan, Joseph Carlson, Andrei Jikh) — komentáre pod videami
- **Twitter/X:** #DividendInvesting, #FIRE, #PassiveIncome

Jedna zverejnená post na r/dividends ("I built a free dividend calculator app — feedback welcome") môže priniesť 500–2000 organických stiahnutí za víkend. Toto je zádarmo.

### 14. ASO — kľúčové slová nie sú v názve
Aktuálny názov: `DivSprout - Dividend Calculator` — dobrý. Ale skús A/B testovať v Play Console:
- `DivSprout: FIRE & Dividend Planner`
- `Dividend Calculator - DivSprout`

V short description zahrň "DRIP calculator" — nízka konkurencia, vysoký zámer.

### 15. Žiadne odpovede na recenzie
Play Store zobrazuje developer odpovede vedľa recenzií. Ak niekto napíše recenziu (aj negatívnu) a ty odpovieš profesionálne a rýchlo, zvyšuje to dôveru nových používateľov. Nastav si notifikácie v Play Console.

---

## 📊 Realistická cesta k 10 000 stiahnutiam

| Krok | Dopad | Čas implementácie |
|---|---|---|
| iOS App Store launch | +5 000–8 000 | 1–2 týždne |
| Reddit + komunity post | +500–2 000 | 1 deň |
| Web kalkulátor + SEO | +1 000–3 000 (dlhodobo) | 2–4 týždne |
| Home screen widget | lepšia retencia | 2–3 dni |
| Free scenáre (2–3) | menej churn | 30 minút |
| Export PDF | virálne zdieľanie | 1–2 dni |
| DivSprout Pro | monetizácia | 3–5 dní |

**Bez iOS:** cesta na 10K bude trvať 6–12 mesiacov hlavne cez komunity a SEO.  
**S iOS:** reálne 2–4 mesiace pri aktívnom marketingu.

---

## ✅ Čo funguje dobre — NETREBA meniť

- Matematický model je správny (DRIP, dividend growth, tax rate, portfolio growth rate sú oddelené — to väčšina kalkulátorov robí zle)
- FIRE goal tracker s freedom date je unikátna feature
- Share card — dobrý nápad pre virálne šírenie
- Míľniky (Coffee Money → Rent Covered → FIRE Achieved) — emotívne, zdieľateľné
- 5 jazykov — veľká výhoda nad konkurenciou
- Multi-currency — dobré
- Rating prompt po uložení scenára — smart trigger
- AdMob produkčné IDs zostali nedotknuté ✓
- Dizajn je čistý a profesionálny

---

*Audit vyhotovený na základe zdrojového kódu: `calculator_screen.dart`, `scenario_service.dart`, `goal_service.dart`, `dividend_calculator_model.dart`, `ad_service.dart` a ostatných súborov projektu.*
