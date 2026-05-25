# DivSprout AI-Assisted Growth System
### Architektúra pre bezpečný, organický rast na X (Twitter)
**Verzia:** MVP 1.0 | **Autor:** Simon | **Projekt:** DivSprout / DivSprout

---

## Filozofia systému

Toto **nie je bot**. Je to **inteligentný asistent**, ktorý ti ráno pripraví prácu — ty sa rozhodneš, čo pôjde von. Každý tweet, každý reply, každá akcia prechádza cez teba. AI šetrí čas a zlepšuje kvalitu, nie nahrádza ľudský úsudok.

Princípy:
- **Human-in-the-loop vždy** — žiadna automatická publikácia
- **Kvalita > kvantita** — 2 skvelé tweety > 10 priemerných
- **Autenticita** — AI sa učí tvoj štýl, nie generický "investing influencer" hlas
- **Bezpečnosť** — žiadne rizikovanie účtu

---

## Systémová architektúra

```
┌─────────────────────────────────────────────────────────────────┐
│                     RANNÝ CRON (06:30)                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   ORCHESTRÁTOR      │  (main.py)
          │   riadi oba agenty  │
          └──────┬──────────────┘
                 │
    ┌────────────▼────────────────────────────┐
    │                                         │
    ▼                                         ▼
┌───────────────────┐              ┌──────────────────────┐
│   AGENT 1         │              │   AGENT 2            │
│   Market &        │              │   Reply &            │
│   Content Agent   │              │   Engagement Agent   │
└────────┬──────────┘              └──────────┬───────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────────────────────────────────────────────┐
│              APPROVAL QUEUE (SQLite)                    │
│   tweet_drafts | reply_suggestions | scores             │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   APPROVAL UI       │
              │   (Telegram bot     │
              │    alebo web app)   │
              └──────────┬──────────┘
                         │
                    TY ROZHODUJEŠ
                    ✅ Schváliť
                    ✏️ Upraviť
                    ❌ Zamietnuť
```

---

## AGENT 1 — Market & Content Agent

### Čo robí každé ráno:

**Krok 1: Market Data Pull** (06:30–06:35)
- Stiahne zmeny cien: S&P 500, NASDAQ, Bitcoin, top dividend ETFs (VYM, SCHD, JEPI)
- Stiahne top holdings z tvojho DivSprout app (ak máš vlastné dáta)
- Skontroluje ex-dividend dátumy blížiace sa tento týždeň
- API: `yfinance` (zadarmo), `Alpha Vantage` (free tier)

**Krok 2: News & Trend Scan** (06:35–06:40)
- Stiahne top investing/dividend novinky za posledných 12 hodín
- Skontroluje trending hashtagy: `#dividendinvesting`, `#ETF`, `#passiveincome`, `#Bitcoin`
- Nájde virálne tweety (>500 likes) v investing niche za 24 hodín
- API: `NewsAPI.org` (free tier = 100 req/day), `X API v2 search`

**Krok 3: Sentiment Analysis** (06:40–06:45)
- Claude API analyzuje: "Aký je celkový sentiment investorov dnes?"
- Výstup: `BULLISH` / `BEARISH` / `NEUTRAL` + confidence score
- Identifikuje hlavnú emóciu dňa (strach, eufória, opatrnosť, príležitosť)

**Krok 4: Topic Selection** (06:45–06:50)
- Scoring engine vyberie top 3 témy pre dnešný obsah
- Každá téma dostane skóre podľa:

```
Topic Score = (Relevance × 0.35) + (Timeliness × 0.25) + 
              (Engagement Potential × 0.25) + (Brand Fit × 0.15)
```

| Kritérium | Popis |
|-----------|-------|
| Relevance | Súvisí to s dividendami / investovaním / DivSprout? |
| Timeliness | Je to z posledných 24h? Trending? |
| Engagement Potential | Majú podobné tweety vysoký engagement? |
| Brand Fit | Zodpovedá to hodnotám DivSprout? |

**Krok 5: Tweet Generation** (06:50–07:00)
- Pre každú z top 3 tém vygeneruje 2 tweet varianty
- Výsledok: 6 tweet draftov s rôznym tónom

### Ako generovať ľudský, nie generický obsah:

Kľúčom je **Style Profile** — súbor s popisom tvojho hlasu:

```python
# style_profile.py
SIMON_STYLE = """
Píšem krátko a jasne. Vyhýbam sa buzzwords ako "game-changer" alebo "unlock your potential".
Preferujem čísla a konkrétne príklady pred vágnym nadšením.
Používam slovenský/anglický mixed štýl keď som v slovenskom prostredí, inak čistú angličtinu.
Sem-tam pridám osobnú poznámku o DivSprout vývoji.
Nič nezdieľam len pre zdieľanie — každý tweet musí mať value.
Tón: úprimný indie developer, nie finanční guru.
Formát: max 2 odstavce, sem-tam odrážky, čísla vždy konkrétne.
Veci ktorým sa vyhýbam: "THREAD:", nadmerné emoji, klišé motivačné citáty.
"""
```

Prompt pre generovanie:
```python
prompt = f"""
Si social media asistent pre DivSprout — dividend tracking app indie developera.

ŠTÝL AUTORA:
{SIMON_STYLE}

DNEŠNÝ KONTEXT:
- Trhový sentiment: {sentiment}
- Top téma: {topic}
- Relevantné dáta: {market_data}
- Virálny tweet v niche: {viral_example}

Vygeneruj 2 RÔZNE tweety na túto tému. 
Tweet A: faktický, dátami podložený
Tweet B: osobný pohľad / building in public angle

PRAVIDLÁ:
- Max 240 znakov
- Žiadne generické frázy
- Žiadne zbytočné hashtagy (max 1-2)
- Žiadne vymyslené čísla — len čo máme z dát
- Aspoň v jednom tweete spomenujem DivSprout prirodzene
"""
```

---

## AGENT 2 — Reply & Engagement Agent

### Čo robí každé ráno:

**Krok 1: Target Tweet Discovery** (07:00–07:10)
- Vyhľadá tweety podľa keywords: `dividend investing`, `passive income ETF`, `SCHD`, `DivSprout`, `building in public fintech`
- Filter: >50 likes, posledných 12 hodín, anglický jazyk
- Prioritizuje tweety od:
  - Väčší účty v niche (10k–500k followers) — viditeľnosť
  - Indie developeri / building in public — komunita
  - Relevantné fintech/investing diskusie

**Krok 2: Reply Scoring** (07:10–07:15)

```
Reply Score = (Thread Quality × 0.30) + (Add-Value Potential × 0.35) + 
              (Audience Fit × 0.25) + (Risk Score × 0.10)
```

| Faktor | Čo hodnotí |
|--------|------------|
| Thread Quality | Je to kvalitná diskusia? Nie flame war. |
| Add-Value Potential | Viem k tomu niečo pridať? |
| Audience Fit | Sledujú tí ľudia dividendy / investovanie? |
| Risk Score | Nie je to kontroverzia alebo politika? |

**Minimálne skóre pre návrh:** 65/100. Pod tým sa nenavrhuje nič.

**Krok 3: Reply Generation** (07:15–07:25)
- Pre každý vybraný tweet vygeneruje reply návrh
- Reply musí:
  - Pridávať hodnotu, nie len súhlasiť
  - Byť prirodzene relevantný k DivSprout (nie salesy)
  - Pôsobiť ako normálna reakcia investora

```python
reply_prompt = f"""
Reaguj na tento tweet ako Simon — indie developer DivSprout dividend tracking app.

TWEET:
{original_tweet}

PRAVIDLÁ:
- Pridaj niečo hodnotné (dáta, iný pohľad, vlastná skúsenosť)
- Max 200 znakov
- Spomeň DivSprout len ak je to 100% prirodzené — nie vždy
- Žiadny spam, žiadne "check out my app"
- Pôsob ako bežný investor v konverzácii

OUTPUT FORMAT:
Reply: [text]
Confidence: [1-10]
Dôvod: [1 veta prečo je tento reply dobrý]
"""
```

---

## Approval Workflow — Ako to prechádza cez teba

### Email (Gmail) — odporúčaná metóda pre MVP

Každé ráno o 7:30 príde na tvoj Gmail pekne naformátovaný HTML email. Žiadna extra appka, žiadny účet — len Gmail ktorý už máš.

Email vyzerá takto (HTML v inboxe):

```
Od: divsprout.growthbot@gmail.com
Predmet: 🌅 DivSprout Daily Brief — Pondelok 25. máj

┌─────────────────────────────────────────┐
│  📊 MARKET SNAPSHOT                     │
│  S&P 500: +0.8% | BTC: +2.1%           │
│  SCHD: -0.2% | Sentiment: BULLISH 72%  │
│  Hlavná téma: Fed drží sadzby           │
└─────────────────────────────────────────┘

✍️ TWEET DRAFTY — 6 návrhov
═══════════════════════════

[1/6] ⭐ Skóre: 87/100
────────────────────────
"Fed held rates again. For dividend investors,
that's signal to stay the course. SCHD's
3.8% yield looks even better vs. bonds now.
What's your move? 👇"

→ Ak sa ti páči: skopíruj a postni na X

─────────────────────────────────────────

[2/6] ⭐ Skóre: 82/100
"Built a new feature in DivSprout last night —
now shows projected annual dividend income
next to each position. Small thing, changes
how I think about every buy."

→ Ak sa ti páči: skopíruj a postni na X

... (ďalšie 4 tweety)

💬 REPLY SUGGESTIONS — 3 návrhy
═══════════════════════════════

[R1] ⭐ Skóre: 78/100
Na tweet od @dividendgrowth (42k followers):
"Honestly the hardest part of dividend investing
isn't picking stocks — it's ignoring the noise..."

Tvoj navrhovaný reply:
"This. Tracking it weekly in DivSprout actually
helped me — seeing the trend vs. single
data point changes perspective."

→ Link na tweet: https://x.com/dividendgrowth/status/...
```

Workflow je jednoduchý: otvoríš email, prečítaš návrhy, skopíruješ čo sa ti páči, postneš na X. Hotovo.

Schválený obsah ide do **publishing queue** — ty ho manuálne postneš z X webu alebo mobilu.

---

## Ako sa AI učí tvoj štýl

**Fáza 1 — Bootstrap (týždeň 1–2):**
- Ručne skopíruješ 20–30 svojich najlepších tweetov do `training_data/my_tweets.txt`
- AI dostane tieto ako "few-shot examples" v každom prompte
- Učí sa: dĺžka, tón, štruktúra, čo zdieľaš a čo nie

**Fáza 2 — Feedback loop (mesiac 1–3):**
- Každý schválený tweet sa uloží do `approved_tweets.db`
- Každý zamietnutý tweet sa uloží s poznámkou `reason: "too salesy / wrong tone / not relevant"`
- Každý týždeň sa prompt aktualizuje o nové príklady

**Fáza 3 — Fine-tuning (mesiac 3+, voliteľné):**
- Ak máš 200+ schválených tweetov, môžeš zvážiť fine-tuning Claude alebo GPT-4o mini
- Pre MVP je to zbytočné — few-shot prompting funguje dobre

---

## Bezpečnosť — Ako sa vyhnúť banu

### Čo Twitter/X sleduje:
1. **API rate limits** — prekročenie = dočasný ban
2. **Posting frequency** — viac ako 5 tweety/hod = podozrivé
3. **Reply bombing** — veľa replies na cudzích účtoch v krátkom čase
4. **Keyword spam** — rovnaké hashtagy každý deň
5. **Duplicate content** — rovnaký text viackrát

### Bezpečnostné pravidlá zabudované do systému:

```python
SAFETY_RULES = {
    "max_tweets_per_day": 5,          # Nikdy viac ako 5 tweetov denne
    "max_replies_per_day": 8,          # Nikdy viac ako 8 replies denne
    "min_interval_between_posts": 45,  # Minimálne 45 minút medzi postmi
    "no_duplicate_hashtags": True,     # Rotuj hashtagy, nie vždy tie isté
    "no_auto_publish": True,           # VŽDY čaká na tvoje schválenie
    "no_DM_automation": True,          # Nikdy automatické DMs
    "no_follow_unfollow": True,        # Žiadny follow/unfollow farming
}
```

### Zlaté pravidlo:
**Systém navrhuje, ty rozhoduješ.** X nesmie vedieť, že AI pomohla — pretože finálny text si vždy prečítaš, prípadne upravíš, a post príde v prirodzenom čase.

---

## Tech Stack pre MVP

### Jadrové závislosti

```
Python 3.11+
├── anthropic          # Claude API (generovanie obsahu)
├── yfinance           # Market dáta zadarmo
├── requests           # HTTP calls
├── tweepy             # X/Twitter API v2
├── newsapi-python     # News agregácia
├── yagmail             # Gmail SMTP odosielanie emailov
├── apscheduler        # Cron scheduler
├── sqlite3            # DB (built-in Python, žiadna inštalácia)
├── python-dotenv      # Bezpečné API keys
└── rich               # Pekné CLI logy
```

### Aké API budeš potrebovať a koľko stoja:

| API | Plán | Cena | Na čo |
|-----|------|------|-------|
| **Anthropic Claude** | API pay-per-use | ~$5–15/mesiac pri MVP objeme | Generovanie tweetov, sentiment |
| **X/Twitter API v2** | Free tier | $0 | Read search (500 req/mesiac) |
| **X/Twitter API v2** | Basic tier | $100/mesiac | Write (posting) — potrebné na auto-post |
| **yfinance** | — | $0 | Market dáta |
| **NewsAPI.org** | Free | $0 | 100 req/deň, mesiac old news |
| **NewsAPI.org** | Developer | $449/mesiac | Nie pre MVP |
| **Gmail SMTP** | — | $0 | Email approval UI (cez App Password) |

**MVP celkové náklady: $5–15/mesiac** (iba Claude API)

> ⚠️ **Dôležité k X API:** Free tier ti dovolí čítať/searchovať tweety (Agent 2 monitoring), ale **posting cez API vyžaduje Basic tier ($100/mesiac)**. Pre MVP odporúčam: AI pripraví obsah, ty ho manuálne postneš z telefónu/webu. Ušetríš $100/mesiac.

### Kde bude systém bežať:

**MVP fáza (0–3 mesiace): Tvoj počítač**
- Stačí, ak ho máš zapnutý ráno
- APScheduler spustí workflow o 6:30
- Žiadna extra infraštruktúra

**Rast fáza (3+ mesiace): VPS**
- Hetzner CX11: **€3.29/mesiac** (1 vCPU, 2GB RAM, Nemecko)
- Systemd service alebo cron job beží nepretržite
- Nikdy nezabudneš na ranný brief

---

## Folder Structure projektu

```
divsprout-growth/
│
├── .env                    # API keys (NIKDY do gitu!)
├── .env.example            # Template bez hodnôt
├── .gitignore
├── requirements.txt
├── README.md
│
├── config/
│   ├── settings.py         # Konštanty, limity, safety rules
│   └── style_profile.py    # Simon's writing style + examples
│
├── agents/
│   ├── __init__.py
│   ├── market_agent.py     # Agent 1: market data + content gen
│   └── engagement_agent.py # Agent 2: reply monitoring + gen
│
├── core/
│   ├── market_data.py      # yfinance wrapper
│   ├── news_scraper.py     # NewsAPI wrapper
│   ├── twitter_client.py   # Tweepy wrapper
│   ├── claude_client.py    # Anthropic SDK wrapper
│   ├── scorer.py           # Scoring engine pre tweety a reply
│   └── db.py               # SQLite operations
│
├── approval/
│   ├── email_sender.py     # Gmail HTML email daily brief
│   └── web_ui.py           # Voliteľne: jednoduché Flask UI
│
├── scheduler/
│   └── main.py             # APScheduler — entry point
│
├── training_data/
│   ├── my_tweets.txt       # Tvoje najlepšie tweety (few-shot)
│   └── rejected_samples.txt# Čo nechceš (negatívne príklady)
│
├── data/
│   └── growth.db           # SQLite databáza
│
└── logs/
    └── daily_brief.log     # Logy pre debugging
```

---

## Bezpečné ukladanie API keys

```python
# .env súbor (nikdy do gitu!)
ANTHROPIC_API_KEY=sk-ant-...
TWITTER_BEARER_TOKEN=AAA...
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=yyy
TWITTER_ACCESS_TOKEN=zzz
TWITTER_ACCESS_SECRET=www
NEWSAPI_KEY=abc...
GMAIL_SENDER=divsprout.growthbot@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
NOTIFY_EMAIL=ssimonkucera@gmail.com

# V kóde:
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("ANTHROPIC_API_KEY")
```

```gitignore
# .gitignore — POVINNÉ
.env
data/*.db
logs/
__pycache__/
*.pyc
```

---

## MVP — Kompletný ranný workflow (kód)

```python
# scheduler/main.py

from apscheduler.schedulers.blocking import BlockingScheduler
from agents.market_agent import MarketAgent
from agents.engagement_agent import EngagementAgent
from approval.email_sender import send_daily_brief
from core.db import save_drafts
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DivSproutGrowth")

def morning_workflow():
    logger.info("🌅 Spúšťam ranný workflow...")
    
    # AGENT 1 — Market & Content
    market = MarketAgent()
    market_snapshot = market.get_market_data()          # yfinance
    sentiment = market.analyze_sentiment(market_snapshot)  # Claude
    topics = market.select_top_topics(sentiment)        # Scorer
    tweet_drafts = market.generate_tweets(topics)       # Claude × 6
    
    # AGENT 2 — Engagement
    engagement = EngagementAgent()
    relevant_tweets = engagement.find_target_tweets()   # X API search
    reply_suggestions = engagement.generate_replies(relevant_tweets)  # Claude × 3
    
    # Uložiť do DB
    save_drafts(tweet_drafts, reply_suggestions, sentiment)
    
    # Poslať na schválenie
    send_daily_brief(tweet_drafts, reply_suggestions, market_snapshot)
    
    logger.info("✅ Ranný workflow dokončený. Čakám na tvoje schválenie.")

# Scheduler
scheduler = BlockingScheduler()
scheduler.add_job(morning_workflow, 'cron', hour=6, minute=30)

if __name__ == "__main__":
    logger.info("🚀 DivSprout Growth System štartuje...")
    morning_workflow()  # Spustí hneď pri štarte (pre testovanie)
    scheduler.start()
```

---

## Scoring systém — detaily

### Tweet Score (0–100)

```python
def score_tweet(tweet: str, context: dict) -> int:
    score = 0
    
    # Relevance (0–35)
    investing_keywords = ["dividend", "ETF", "yield", "passive income", 
                          "portfolio", "investing", "DivSprout", "SCHD"]
    keyword_matches = sum(1 for kw in investing_keywords if kw.lower() in tweet.lower())
    score += min(keyword_matches * 7, 35)
    
    # Length (0–20) — optimum 180–240 znakov
    length = len(tweet)
    if 180 <= length <= 240:
        score += 20
    elif 120 <= length < 180:
        score += 12
    elif length < 120:
        score += 5
    
    # Has data/numbers (0–20)
    import re
    if re.search(r'\d+\.?\d*%', tweet):  # obsahuje percento
        score += 20
    elif re.search(r'\$\d+', tweet):      # obsahuje sumu
        score += 15
    elif re.search(r'\d+', tweet):        # obsahuje číslo
        score += 10
    
    # Timeliness (0–15)
    if context.get("market_moving_today"):
        score += 15
    elif context.get("weekly_relevance"):
        score += 8
    
    # Brand fit (0–10)
    if "DivSprout" in tweet or "divsprout" in tweet.lower():
        score += 10
    
    return min(score, 100)
```

### Minimálne skóre pre odporúčanie:
- Tweet drafts: **70+** (pod tým sa neposiela na schválenie)
- Reply suggestions: **65+**

---

## Roadmapa

### Mesiac 1 — MVP
- [ ] Setup projektu + API keys
- [ ] Agent 1: market data + základné tweet generovanie
- [ ] Telegram bot approval workflow
- [ ] Manuálne testovanie každý deň

### Mesiac 2 — Iteration
- [ ] Agent 2: reply monitoring + suggestions
- [ ] Feedback loop z schválených/zamietnutých tweetov
- [ ] Scoring system tuning
- [ ] Style profile refinement

### Mesiac 3 — Scale
- [ ] Presun na VPS (Hetzner €3/mesiac)
- [ ] Analytics: ktoré typy tweetov majú najlepší engagement?
- [ ] A/B testing tweet formátov
- [ ] Voliteľne: X API Basic pre auto-posting

### Mesiac 6+ — Advanced
- [ ] Multi-platform: LinkedIn adaptation
- [ ] Competitor monitoring
- [ ] Follower segment analysis
- [ ] Newsletter integration

---

## Čo MUSÍ zostať manuálne (nikdy neautomatizovať)

| Akcia | Dôvod |
|-------|-------|
| Finálne postovanie tweetov | Bezpečnosť + autenticita |
| Reply na kontroverzné témy | Reputačné riziko |
| Follow/unfollow | Shadowban riziko |
| DM správy | Spam označenie |
| Zdieľanie trhových predikcií | Právne riziko (financial advice) |
| Odpovede na kritiku DivSprout | Vyžaduje tvoj osobný hlas |

---

## Záver — Kde začať

1. **Dnes:** Vytvor GitHub repo `divsprout-growth`, nastav `.env`, nainštaluj závislosti
2. **Zajtra:** Napíš `market_agent.py` — len market data + jednoduchý Claude prompt
3. **Tento týždeň:** Telegram bot ktorý ti pošle 3 tweet návrhy každé ráno
4. **Budúci týždeň:** Pridaj engagement agent

**Nezačínaj so všetkým naraz.** MVP = Agent 1 + Telegram approval. Keď to beží 2 týždne spoľahlivo, pridáš Agent 2.

---

*DivSprout AI Growth System — dokumentácia v1.0*
*Postavené pre indie developera, nie pre korporát.*
