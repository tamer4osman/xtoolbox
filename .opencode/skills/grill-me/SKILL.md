---
name: grill-me
description: A relentless interview to sharpen a plan or design. Use before building new tools or making major architectural decisions.
disable-model-invocation: true
---

Interview me relentlessly about every aspect of this until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a *fact* can be found by exploring the environment (filesystem, tools, etc.), look it up rather than asking me. The *decisions*, though, are mine — put each one to me and wait for my answer.

Do not act on it until I confirm we have reached a shared understanding.

## Context for xtoolbox

When grilling about new tools, consider:
- Does it fit the 100% client-side philosophy? (no server, no API keys, no accounts)
- Is there already a tool that does this? (check `src/data/tools.json`)
- Which factory pattern applies? (image-tool-factory, video-tool-factory, codec-factory, etc.)
- What browser APIs or WASM modules are needed?
- What's the audience? (developers, creators, general users)

## Context for architecture decisions

When grilling about refactoring or architecture:
- Use terms from codebase-design: module, interface, depth, seam, adapter, leverage, locality
- Apply the deletion test: would deleting it concentrate complexity?
- Consider the factory pattern — can the change be extracted to a shared factory?
- Check `AGENTS.md` conventions — does the change follow the 19-step workflow?
