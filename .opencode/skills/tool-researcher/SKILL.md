---
name: tool-researcher
description: Research and discover new tool ideas for xtoolbox by scanning web pain points, new browser APIs, and community needs. Use when you need to find the next tool to build.
disable-model-invocation: true
---

# Tool Researcher

Find high-value, unique tool ideas that fit xtoolbox's 100% client-side philosophy.

## Process

### 1. Run All Modes Progressively

Do not ask the user which mode to run. Run all five modes, but start with the cheapest sources and only go deeper if the initial results show promise.

**Layer 1 — Quick scan (fast, cheap):**

- Reddit (most signal per token)
- Hacker News
- Category gap scan (reads local file, zero cost)
- Competitor gap scan (fetches known URLs)

If Layer 1 finds 5+ ideas scoring 40+, present them. Done.

**Layer 2 — Deep scan (only if Layer 1 is thin):**

- Twitter/X
- Product Hunt comments
- GitHub Issues
- Dev.to
- TikTok

**Layer 3 — Full scan (only if Layer 2 is thin):**

- LinkedIn
- Facebook Groups
- Stack Overflow
- YouTube
- Indie Hackers
- Lobste.rs
- Slashdot

Stop as soon as you have 10+ ideas scoring 35+. No need to burn tokens on Layer 3 if Layer 1 and 2 deliver.

### 2. Execute Research

#### Pain-point scan

Find pain from what people share — social signals, not just search queries:

**Reddit** (highest signal — real people complaining):

- `site:reddit.com "I wish there was" tool`
- `site:reddit.com "is there a tool" OR "any tool for"`
- `site:reddit.com "I hate" online tool`
- `site:reddit.com "why is there no" tool`
- `site:reddit.com "someone should make" tool`
- `site:reddit.com "best free" tool 2026`
- Subreddits to scan: r/webdev, r/productivity, r/datarhoarder, r/privacy, r/opensource, r/SideProject

**Hacker News** (developer signal):

- `site:news.ycombinator.com "show HN" tool browser`
- `site:news.ycombinator.com "why isn't there" OR "wish there was"`
- `site:news.ycombinator.com "client side" OR "no server" OR "privacy"`

**Twitter/X** (real-time complaints):

- `"I wish there was" tool`
- `"why is there no" tool browser`
- `"someone build" tool free`

**Stack Overflow** (recurring pain):

- `site:stackoverflow.com "browser based" OR "client side" OR "no upload"`

**YouTube** (tutorial gaps):

- `"no tool exists" OR "couldn't find a tool" tutorial`

**Product Hunt** (launch comments reveal gaps):

- `"wish this had" OR "if only it could" site:producthunt.com`
- `"missing feature" OR "dealbreaker" tool site:producthunt.com`
- Look at comments on popular tools — what do users ask for that the tool doesn't do?

**GitHub Issues** (feature requests on popular tools):

- `site:github.com "feature request" tool browser client-side`
- `site:github.com "would be nice" OR "would love" OR "please add" tool`
- Check issues on popular open-source tools (ffmpeg.wasm, pdf.js, fabric.js) for unmet needs

**Indie Hackers** (solo builder pain):

- `site:indiehackers.com "looking for" OR "need a tool" OR "wish there was"`
- `site:indiehackers.com "building" OR "side project" tool idea`

**Dev.to** (developer articles):

- `site:dev.to "I built" OR "why I built" tool browser`
- `site:dev.to "no good tool" OR "couldn't find" OR "frustrated with"`

**Discord communities** (real-time complaints — search via web):

- `"I wish there was" tool site:discord.com OR site:discord.gg`
- `"anyone know a tool" OR "is there a tool" discord`

**Lobste.rs** (high-signal dev community):

- `site:lobste.rs "tool" OR "utility" OR "browser" client-side`

**Slashdot** (tech news comments):

- `site:slashdot.org "wish there was" OR "no tool" OR "need a tool"`

**TikTok** (short-form complaints and hacks):

- `"I wish there was" tool site:tiktok.com`
- `"why is there no" tool free`
- `"this tool saved me" OR "finally a tool" — reverse-engineer what pain it solved`
- `"hack" OR "trick" OR "workaround" browser tool` — workarounds = unmet needs
- `"I hate" OR "so annoying" OR "frustrating" tool online`
- Productivity and tech creator videos often show pain points indirectly

**LinkedIn** (professional workflow pain):

- `"I spend hours" OR "waste time" OR "manually" tool site:linkedin.com`
- `"looking for" OR "need a tool" OR "any recommendations" site:linkedin.com`
- `"automate" OR "streamline" OR "too many steps" workflow`
- Professionals share what they struggle with — high-intent, high-value pain

**Facebook Groups** (niche community complaints):

- `"I wish there was" OR "is there a tool" site:facebook.com`
- `"anyone know" OR "does anyone use" tool free`
- Facebook Groups are high-signal because people complain in niche communities (photography, writing, freelancing, small business) where tool pain is specific and intense
- Groups to scan: photography editing groups, freelance groups, small business tools groups, writer groups, developer groups

For each result, note:

- What problem people have
- How many people are engaging (upvotes, likes, replies)
- Whether existing solutions require server upload or accounts
- The emotional intensity (mild annoyance vs. rage quit)

#### API opportunity scan

Search for:

- New browser APIs: `MDN new web APIs 2025 2026`
- WebAssembly modules: `awesome wasm` OR `wasm modules browser`
- Emerging standards: `TC39 proposals 2026` OR `web platform new features`
- ONNX models for browser: `transformers.js new models` OR `onnx browser inference`

For each API, ask:

- Can it process user data without a server?
- Is there a tool use case non-developers would want?
- Is it supported in major browsers (Chrome, Firefox, Safari)?

#### Category gap scan

Read `src/data/categories.json` and count tools per category. Categories with the fewest tools relative to user demand are gap opportunities.

Current categories and counts (update as tools are added):

- Image: 43
- Dev: 40
- Text: 35
- PDF: 33
- Video: 26
- CSS: 20
- Audio: 17
- Finance: 16
- Business: 16
- Productivity: 18
- Math: 13
- Health: 12
- Encoding: 9
- Reference: 8
- SEO: 8
- Privacy: 8
- Fun: 6
- QR: 4
- OCR: 4
- Visualization: 4
- Weather: 4

Lowest counts = highest gap priority.

#### Competitor gap scan

Search for popular online tool sites and compare:

- `smalldev.tools` — what do they have that we don't?
- `toolbox.google.com` — Google's tools
- `convertio.co` — file converters
- `ilovepdf.com` — PDF tools
- `tinypng.com` — image optimization
- `remove.bg` — background removal
- `carbon.now.sh` — code screenshots

Note tools they offer that we don't, especially ones that could work client-side.

#### Nascent needs scan

Search for problems that don't have tools yet — emerging needs where the concept is still forming:

- **New regulations**: `new privacy law 2026 compliance tools` OR `accessibility requirements 2026` OR `AI content labeling law`
- **Emerging workflows**: `remote work tab overload` OR `too many browser tabs productivity` OR `AI prompt management tool`
- **Technology side effects**: `AI generated text detection` OR `deepfake detection browser` OR `watermark AI content`
- **Behavioral shifts**: `digital wellness browser` OR `screen time tracker offline` OR `focus mode tool`
- **New data formats**: `new file format 2026` OR `emerging data standard` OR `[new format] converter`
- **Industry pain points**: `freelancer tool gap` OR `small business pain points 2026` OR `creator economy tools missing`

For each result, ask:

- Is this a real problem or just a novelty?
- Are 1000+ people affected by this?
- Can it be solved client-side?
- Does a solution already exist (even a bad one)?
- Will this problem grow or disappear?

Key difference from pain-point scan: pain-point scan finds people asking for _existing_ tool categories. Nascent needs scan finds _new categories_ that don't exist yet.

### 3. Cross-Reference Results

After running all five modes, look for compound opportunities — where two or more modes point to the same idea:

- Nascent need + API opportunity = tool that solves a new problem with new technology
- Competitor gap + Category gap = tool that fills a hole in our collection that competitors already have
- Pain point + Growth potential = tool that solves a growing problem with no good solution

These compound opportunities should be ranked higher than single-mode findings.

### 4. Score and Rank

Score each idea on a 1-5 scale. The scoring is designed to reward uniqueness and growth potential over raw demand — because that's how you outperform competitors.

| Dimension            | Weight | Question                                                                                            |
| -------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| **Uniqueness**       | 5x     | Can users find this exact tool elsewhere? (1=dozens of alternatives, 5=doesn't exist yet)           |
| **Growth potential** | 4x     | Will demand for this grow in the next 12 months? (1=shrinking, 5=exploding)                         |
| **Engagement**       | 3x     | Will users spend time or just convert and leave? (1=5 seconds, 5=5+ minutes, 5=bookmark and return) |
| **Client-side fit**  | 2x     | Can it run 100% in browser? (1=needs server, 5=pure browser APIs)                                   |
| **Shareability**     | 1x     | Would someone share this? (1=no, 5=viral potential)                                                 |

**Total = (Uniqueness × 5) + (Growth × 4) + (Engagement × 3) + (Client-side × 2) + (Shareability × 1)**

Maximum possible: 75 points.

**Why this weighting:**

- Uniqueness is #1 because commodity tools (JSON formatters, image resizers) are a race to the bottom. You win by having tools nobody else has.
- Growth potential is #2 because building a tool for an emerging need means you capture the market before competitors notice.
- Engagement is #3 because your business model is ad revenue — time on page = revenue.
- Client-side fit is a hard filter, not a differentiator — if it can't run in-browser, it's out regardless of score.
- Shareability is a bonus — nice to have, not critical.

### 5. Present Results

Output exactly 20 tools per stage, formatted to match `PROJECT-PLAN.md` structure. Each tool spec must include:

```markdown
### Phase [N]: [Theme] Tools

> **Libraries:** [list of WASM/ONNX/npm libraries needed]
> **Pattern:** [input → process → output description]

#### [tool-id]

- **File:** `src/tools/[category]/[tool-id].js`
- **Category:** [category]
- **Purpose:** [one-line description]
- **Library:** [specific library or "Pure JS" or "Canvas API"]
- **UI:**
  1. [UI element]
  2. [UI element]
  3. ...
- **Implementation notes:**
  - [technical detail]
  - [technical detail]
  - ...
```

Group tools by theme (e.g., "Social Media Tools", "E-Commerce Tools", "Calculator Tools"). Each theme should have 20 tools.

### 6. Hand Off

Save the output to `memory/tool-ideas.md` for reference. The user decides what to build next.

## Output Format

Follows the exact structure from `PROJECT-PLAN.md`:

```markdown
### Phase [N]: [Theme] Tools

> **Libraries:** [libraries]
> **Pattern:** [pattern]

#### tool-id

- **File:** `src/tools/[category]/tool-id.js`
- **Category:** [category]
- **Purpose:** [description]
- **Library:** [library]
- **UI:**
  1. [UI element]
  2. [UI element]
- **Implementation notes:**
  - [note]
  - [note]
```

## Anti-patterns to Avoid

- Don't suggest tools that require API keys (violates 100% client-side)
- Don't suggest tools that are pure server-side (e.g., real-time multiplayer)
- Don't suggest tools that already exist in our collection
- Don't suggest tools with niche industrial use cases (too narrow)
- Don't suggest generic "converter" tools (oversaturated market)
