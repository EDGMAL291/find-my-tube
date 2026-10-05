# Test discovery and Tube Plan

## Data boundary

`assets/data/data.js` remains the laboratory's authoritative catalogue. This UI pass does not change any test/tube assignments. HIV ELISA remains Gold/Yellow; HIV Viral Load remains Pearl/White; qualitative PCR and resistance genotyping remain Purple.

`enrichTest` supplies search metadata, `getTubeGroups` resolves collection labels, and `getResolvedDrawPlan` applies the existing laboratory rules. Unknown or specimen-specific collection labels remain visible and require laboratory review; they are never replaced with a guessed blood tube.

## Interaction and fixes

- `expandedTestNames` controls inspection; `selectedTestNames` controls actual plan membership. Searching or expanding a result does not add tests.
- Adding a test preserves the search and the inspected card. Previously mobile selection cleared the search while keeping the keyboard focused, and the focused layout hid the plan control.
- Cards show the recorded specimen without the former HIV Viral Load exclusion. Unrecognised collection descriptions remain visible instead of losing the entire collection field.
- The parser recognises the existing `Sterile semen container` label.
- Planner cards show their assigned tests. Exact profile overrides associate each test only with its mapped collection group. Previously every selected test was attached to every exact-rule group, although those associations were hidden in the UI.
- Exact overrides retain their minimum quantities and include unassigned tests from their recorded mappings. This fixes the sepsis-panel omission of Lactate's grey tube without altering the catalogue or patching a specific test name.
- Planner guidance explains the existing dedicated Gold/Yellow, purple volume, OGTT, and profile rules. No quantity rule is relaxed for visual consolidation.

## Presentation

Content cards and modal sheets use the shared `--fmt-card-radius: 0px` token in `modern.css`; do not add page-specific rounded-card overrides. Controls, badges, and illustrations are separate from card geometry. Page photographs stay fixed behind the content. Find My Tube uses the same dark photographic treatment in each theme, with theme-aware solid clinical cards; department links and result counts remain transparent. Avoid pale full-page overlays that wash out the photograph.

`assets/css/discovery.css` owns the neutral search/card/planner surfaces, light/dark tokens, focus styles, and mobile layout. `getTubeVisualMarkup` supplies one scalable SVG family for shared tube displays, with cap colour, size, paediatric proportions, optional fill, and accessible labels. Non-blood containers use a separate silhouette.

Design references: [NHS cards](https://service-manual.nhs.uk/design-system/components/card) for clear interactive hierarchy, and [BD tube label illustrations](https://www.bd.com/content/dam/bd-assets/na/integrated-diagnostic-solutions/documents/in-service-material/3711-WW-0924-SM-Fill-Line-ch.pdf) for tube geometry conventions only. Neither source defines this laboratory's mappings.

## Drug search synonyms

`drugSearchAliases` in `script.js` covers all 16 existing therapeutic-drug peak/trough/level records plus paracetamol and salicylate. It adds common brands and generic synonyms without creating assays or changing local mappings. Examples: Epilim/valproic acid → Sodium Valproate; Epanutin → Phenytoin; Lanoxin → Digoxin; Priadel → Lithium; Panado/acetaminophen → Paracetamol. Generic antibiotic searches return both peak and trough records; an explicit peak/trough query retains that distinction.

One-character insertion, deletion, or substitution is tolerated only in established drug-name words of at least five letters. Thus `valproac acid` and `epilum` work while unrelated clinical terms are not fuzzily reassigned. Results always display the canonical laboratory test name and require explicit addition to the plan.

Identity references (search vocabulary only): [MHRA valproate brands](https://www.gov.uk/guidance/valproate-reproductive-risks), [NHS epilepsy medicine names](https://cavuhb.nhs.wales/files/services/epilepsy/anti-epileptic-poster/), [NHS digoxin](https://www.nhs.uk/medicines/digoxin/about-digoxin/), [NHS lithium](https://www.nhs.uk/medicines/lithium/about-lithium/), [NHS levetiracetam](https://www.nhs.uk/medicines/levetiracetam/), [Uniphyllin product information](https://www.medicines.org.uk/emc/product/100852/smpc), [phenobarbital terminology](https://rightdecisions.scot.nhs.uk/scottish-palliative-care-guidelines/medicine-information/phenobarbital-phenobarbitone/), [WHO amikacin reference products](https://extranet.who.int/prequal/sites/default/files/document_files/Comparator-TB2024-03May_0.pdf), [NLM gentamicin](https://meshb.nlm.nih.gov/record/ui?ui=D005839), [NLM tobramycin](https://meshb.nlm.nih.gov/record/ui?ui=D014031), [EMA vancomycin](https://www.ema.europa.eu/en/medicines/human/referrals/vancomycin-containing-medicines), [Panado manufacturer](https://panado.co.za/product/panado-capsules-20s/), [NHS paracetamol](https://www.gloshospitals.nhs.uk/our-services/services-we-offer/pathology/tests-and-investigations/paracetamol/), and [NHS salicylate synonyms](https://pathology.royalcornwallhospitals.nhs.uk/viewTest.php?ID=267).

## Running tests

Run `npm run check` and `npm test`. For browser tests, run `npx playwright install chromium --only-shell`, start `npm start` in another terminal, and run `npm run test:browser`.

The browser suite exercises 360, 390, 412, 430, 768, and 1280px widths in light/dark modes. It checks inspection, explicit addition/removal, HIV mapping/specimen visibility, grouping, dedicated-tube rules, every catalogue record's planner coverage, SVG variants, overlap/overflow, and JavaScript errors. Screenshots are written to a temporary directory for visual review. It does not submit stock orders or alter production data.
