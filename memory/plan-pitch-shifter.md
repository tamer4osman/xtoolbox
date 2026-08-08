# Plan: Pitch Shifter (`audio-pitch`) — Phase 28

> Date: 2026-08-08 · Status: planned, awaiting build kickoff

## Decisions (grilled, approved)

1. **Algorithm:** hand-rolled phase vocoder (STFT). Time-stretch by R = 2^(semitones/12),
   then CQT resample back to original duration → pitch shifted, length preserved. Zero new deps.
2. **Locality / DRY:** extract shared `src/tools/audio/dsp.js` with `hannWindow`, `fft`, `ifft`,
   `stft`/`istft`, and the phase-vocoder primitive. Refactor `noise-remover.js` (8f-163) and
   `bpm-key-detector.js` (`fftInPlace`) to import from it. Re-run their unit + e2e tests.
3. **Range:** one integer slider −12..+12 semitones + musical key dropdown (C..B → semitone
   offset), plus preset chips (complement with audio-speed chips pattern).
4. **UX flow:** Upload (audio-tool-factory) → choose pitch (slider + key + chips) →
   Apply button runs vocoder once → shows shifted duration/waveform → Play/Pause preview
   (AudioBufferSourceNode) → Download WAV (`audioBufferToWav` + `downloadBlob`).

## Scope (no feature creep)

- **In:** semitone shift, key shortcut, preview+download flow, dsp extraction refactor.
- **Out:** formant preservation, live real-time shift, MP3/OGG export, multi-selection, BPM autodetect.

## File map

| File                                  | Action                                |
| ------------------------------------- | ------------------------------------- |
| `src/tools/audio/dsp.js`              | NEW — shared FFT/STFT + phase vocoder |
| `src/tools/audio/audio-pitch.js`      | NEW — tool render + orchestration     |
| `src/tools/audio/noise-remover.js`    | REFACTOR — import from dsp.js         |
| `src/tools/audio/bpm-key-detector.js` | REFACTOR — import from dsp.js         |
| `src/__tests__/audio-pitch.test.js`   | NEW                                   |
| `src/__tests__/dsp.test.js`           | NEW                                   |
| `tests/audio-pitch.spec.js`           | NEW                                   |

## Verifiable goals (Protocol 2)

1. Loading a 30s WAV, applying +7 → duration unchanged (±50ms), audible pitch rises.
2. Key dropdown C→ selecting "E" yields +4 semitone offset (clear interval).
3. Preview plays the shifted buffer; Download yields valid WAV (RIFF header).
4. `npm run build`, `test:unit`, smoke, SPA-perf, fallow, oxlint/oxfmt all pass.
5. `noise-remover` + `bpm-key-detector` behavior unchanged (existing tests pass).

## Registry/doc sync (post-approval, 21-step)

- tools.json + toolsList.json: `audio-pitch` planned→done (no category count change — flip only).
- README, TOOLS.md, PROJECT-PLAN.md, tool-building-progress.md: totals 332→333 done / 12→11 planned.
- home.js/footer/about.js tool counts if dynamic-registry-driven (verify first).
