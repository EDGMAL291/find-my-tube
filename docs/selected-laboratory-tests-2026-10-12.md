# Fifteen selected laboratory tests — implementation and confirmation record

The catalogue grows from 353 to 368 records. All 353 existing records, their order and fields, and their parsed collection mappings are preserved. The approved additions are individual assays, not new profiles. Existing 24-hour urine metanephrines, CSF cryptococcal antigen and anti-GAD remain available separately.

## Collection mappings

| Canonical test | Selected collection | Recorded specimen |
| --- | --- | --- |
| G6PD Enzyme Activity | Purple/Lavender EDTA | EDTA whole blood |
| Pyruvate Kinase Activity | Yellow ACD | ACD whole blood |
| Platelet Aggregation Studies (LTA) | Light blue sodium citrate | Citrated whole blood |
| Factor VIII Activity | Light blue sodium citrate | Platelet-poor citrate plasma |
| Factor IX Activity | Light blue sodium citrate | Platelet-poor citrate plasma |
| Factor XIII Activity | Light blue sodium citrate | Platelet-poor citrate plasma |
| JAK2 V617F Mutation | Purple/Lavender EDTA | Anticoagulated EDTA whole blood |
| Serum Osmolality | Gold/Yellow SST | Serum |
| Urine Osmolality | Plain urine container | Urine |
| Beta-hydroxybutyrate (Blood Ketones) | Gold/Yellow SST | Serum or receiving-assay validated plasma |
| Plasma Free Metanephrines | Purple/Lavender EDTA | EDTA plasma |
| Insulin-like Growth Factor 1 (IGF-1) | Gold/Yellow SST | Serum |
| Cryptococcal Antigen (Serum) | Gold/Yellow SST | Serum |
| Urine TB-LAM Antigen | Sterile urine container | Urine |
| IA-2 Antibodies | Gold/Yellow SST | Serum |

These are the owner's selected site mappings. They are not independent evidence of receiving-laboratory acceptance. No specific acceptance conflict was independently verified during this session; conditional confirmation is visible in each new entry rather than substituting another collection.

## Files and integrations

Changed:

- `assets/data/data.js`: the 15 canonical records, specimen descriptions, important pre-analytical cautions and explicit confirmation requirements. Every new turnaround is **Confirm with receiving laboratory**.
- `assets/js/script.js`: aliases, clinical uses and search keywords; appropriate department classification; collection parser/additive labels and existing Tube Plan integration. JAK2 is in Molecular Biology, not an inherited-disorder profile. Serum/urine osmolality remain separate, as do the serum/CSF cryptococcal and plasma/urine metanephrine entries.
- `index.html`, `find-my-tube.html`, `order-stock.html`, `track-orders.html`, `stock-dashboard.html`, and `service-worker.js`: versions of the changed shared JS/catalogue and PWA cache only.
- `package.json`: adds the targeted browser test to the existing browser command.

Added:

- `test/fixtures/selected-laboratory-tests.json`: approved record names, specimens, mappings and search aliases for regression coverage.
- `test/laboratory-catalogue.test.js`: canonical record uniqueness, original-catalogue preservation and essential cautions.
- `tests/laboratory-catalogue-browser.cjs`: real browser coverage of all 15 records and aliases, Details, direct/repeated selection, collection groups, additive labels, preparation boundaries and Find My Test's shared API.
- This report.

No CSS, images, layout, stock inventory, API/database schema or existing disease recommendation rules changed. The existing enrichment and public catalogue API make the new assays selectable by Find My Test without adding unsupported automatic clinical recommendations. The existing clinical concern dictionaries and profiles are preserved.

## Tube Plan safety boundaries

- **ACD is not SST:** Yellow ACD resolves only to its own anticoagulant group, even when its expanded name contains the word citrate. A mixed ACD + SST request has two groups. It uses the existing illustration family, with its ACD additive explicitly labelled. Local ACD draw order is unverified, so its card says **Confirm draw order** rather than assigning a guessed venous step.
- **LTA is not referral plasma:** an optional `separateCollection` record flag keeps its fresh citrate whole-blood request separate from the same-colour factor-assay plasma requests. The separate item's additive key remains Blue for the existing illustration and venous ordering; its label and handling explain LTA whole blood.
- **Metanephrine plasma is not EDTA whole blood:** the same flag keeps plasma free metanephrines separate from ordinary EDTA whole-blood requests. The existing purple volume rule counts the remaining requests; it does not count the separate plasma request again.
- **Urine is a container:** plain urine has its own non-blood collection group. TB-LAM uses the existing sterile urine-container group. Neither enters the venous draw sequence or receives an SST/EDTA label. Existing 24-hour urine collection behaviour is retained.
- Baseline grouped Tube Plan quantities remain the site's existing planning convention, not verified assay volumes or referral aliquot counts. For specialised citrate assays the card explicitly requires confirmation of tube number, fill, volume and processing. Confirm the actual amount for every assay with the receiving laboratory.

## Clinical guidance and access limits

Reviewed an authoritative source available within this environment: [WHO SMART HIV implementation source, decision logic](https://github.com/WorldHealthOrganization/smart-hiv/blob/b1e7735f1e50cc6e4d126ce6063793def9ae3a12/input/pagecontent/decision-logic.md), especially the TB/LF-LAM and advanced-HIV cryptococcal sections. Its LF-LAM language supports diagnostic assistance in selected people with HIV and referral to WHO TB guidance; cryptococcal testing is described in advanced-HIV care. This supports the restrained indication wording here. The implementation source incorporates older guideline references, so it is not proof of the current local eligibility thresholds or specimen acceptance. No numeric eligibility thresholds were copied into the site.

The environment's destination policy returned CONNECT 403 for direct Mayo Clinic Laboratories and WHO publication pages. Current receiving-assay instructions for these 15 tests could therefore not be freshly verified. The following reliable references identify the clinical/laboratory review to complete; they are **reference targets, not pages freshly retrieved in this session**:

- [Mayo Clinic Laboratories test catalogue](https://www.mayocliniclabs.com/test-catalog): enzyme activity, osmolality, ketones, JAK2, IGF-1, antibody and specimen-specific antigen assay requirements.
- [ARUP Consult: functional platelet disorders](https://arupconsult.com/content/functional-platelet-disorders) and [uncommon factor deficiencies](https://arupconsult.com/content/uncommon-factor-deficiencies): platelet-function and factor-assay interpretation and specialist assessment.
- Cattaneo et al., *Recommendations for the standardization of light transmission aggregometry*, ISTH consensus, [doi:10.1111/jth.12231](https://doi.org/10.1111/jth.12231): LTA preparation and pre-analytical standardisation.
- Lenders et al., *Pheochromocytoma and Paraganglioma: An Endocrine Society Clinical Practice Guideline*, [doi:10.1210/jc.2014-1498](https://doi.org/10.1210/jc.2014-1498): plasma metanephrine interpretation and patient preparation.
- [WHO tuberculosis knowledge-sharing platform](https://tbksp.who.int/en) and [WHO LF-LAM policy publication](https://www.who.int/publications/i/item/9789241550604): current diagnostic algorithms and eligibility must be checked with the applicable local guidance and assay instructions.

Clinical text describes support for investigation or monitoring, not diagnosis from a test alone. G6PD false-normal cautions after haemolysis/transfusion remain visible. JAK2 negativity does not exclude a myeloproliferative neoplasm. Serum cryptococcal antigen does not alone establish meningitis. TB-LAM is not a general TB screen and a negative test does not exclude TB. Medicines are not to be stopped without clinician/prescriber advice.

## Receiving-laboratory confirmations still required

| Area | Required confirmation |
| --- | --- |
| Every new assay | Availability, selected tube/container acceptance, specimen amount, turnaround, collection timing and handling |
| G6PD and pyruvate kinase | EDTA versus ACD acceptance, ACD formulation, transport and recent haemolysis/transfusion effects |
| LTA | Prior appointment/arrangement, medication review, citrate fill and tube number, delivery window; approved room-temperature transport and no refrigeration |
| Factors VIII, IX and XIII | Citrate fill, required tube number/volume, platelet-poor plasma preparation; double-spin requirements for VIII/IX, frozen referral requirements and anticoagulant/treatment interference |
| Serum SST assays | Assay-specific gel/SST acceptance; particularly osmolality and beta-hydroxybutyrate; validated plasma alternatives are not assumed |
| Plasma free metanephrines | EDTA acceptance, resting posture/period, fasting where required, medication/stress/exercise effects, rapid separation and transport/storage |
| IGF-1 | Assay-specific age-appropriate reference ranges; no ranges are published here |
| Urine assays | Collection type, container, amount and handling; current local/WHO TB-LAM eligibility and validated assay |
| Cryptococcal antigen and IA-2 | Serum SST acceptance and clinically appropriate interpretation/further investigation |

No numeric collection volumes, turnaround estimates, reference ranges, unverified transport temperatures or exact local preparation intervals were introduced. The approved LTA room-temperature/no-refrigeration instruction is retained.

## Validation

- `npm run check`: syntax checks configured by the repository; no separate lint or build command is configured.
- `npm test`: 25 unit tests plus order-submission and Google Sheets redirect regressions.
- `npm run test:browser`: existing discovery/Tube Plan workflows at 360, 390, 412, 430, 768 and 1280px in both themes, stock visual regressions, plus the new 390/1280px assay coverage and Find My Test shared API checks.
- Independent before/after comparison: zero collection mapping changes among the 353 pre-existing records.
- `git diff --check`: whitespace validation.

Browser tests use the environment's installed Chromium. No production orders, inventory or database records are modified by these tests. Git push does not prove deployment; live frontend/API access remains restricted by this environment's network policy.
