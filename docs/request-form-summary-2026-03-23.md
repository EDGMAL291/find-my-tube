# Request Form Summary (2026-03-23)

Source: manual photo set `IMG_5386` to `IMG_5437` from NHLS-style request forms.

This note intentionally excludes patient-identifying text. It captures only the recurring test names, shorthand, and specimen labels seen across the forms so the app can search more naturally against real request-form wording.

## Recurring Shorthand Seen

- `FBC`
- `U+E` / `UE`
- `HbA1c` / `HBA1C`
- `LFT` / `LFTs`
- `Lipogram` / `Lipids`
- `TSH`, `T4`, `TSH+T4`, `Thy funct`
- `Fe studies` / `Iron studies`
- `Vit D`
- `Vit B12`
- `Folate` / `Folic acid`
- `PSA`
- `CRP`
- `ESR`
- `Urate`
- `INR`
- `Blood MCS`, `Urine MCS`, `Swab MCS`, `Sputum MCS`, `Tissue MCS`, `Faeces MCS`
- `Malaria screen (microscopy)`
- `Beta-HCG`
- `BNP`
- `Testosterone`
- `Blood film`
- `Immunoglobulins`
- `HE4`

## Catalogue Additions Backed By Forms

- `Fluid MCS`
- `Tissue MCS`
- `Immunoglobulin Profile (IgG, IgA, IgM)`
- `HE4`
- `Peripheral Blood Smear / Blood Film`

## Search Improvements Added

- Request-form aliases now map common shorthand to existing catalogue entries, especially for thyroid, glucose, vitamin, lipid, hematology, microbiology, and cardiac-marker requests.
- `Blood MCS` now resolves to `Blood Culture`.
- `Faeces MCS` now resolves to `Stool MCS`.

## Clinical Findings Folded Into Quick Add

- New quick-add items:
  `Dizziness`, `Malaise`, `Missed period`, `Hair loss`, `DVT / clot`, `Malaria`, and `Gout`
- Existing quick-add items expanded with request-form wording:
  `Shortness of breath` now catches `SOB`
  `Bleeding` now catches `PV bleeding`
  `Oedema` now catches `leg swelling`, `foot swelling`, and `unilateral leg swelling`
  `Thyroid disease` now catches `hypothyroid` and `hyperthyroid`
  `Sepsis` now catches `site infection` and `wound infection`

## Clinical Pathways Added From Form Findings

- `Hair loss support`
- `Malaria support`
- `Missed period / amenorrhoea support`
- `Gout support`

## Utility Added

- `scripts/ocr_forms.swift` can be reused to OCR future request-form photos with automatic rotation selection.
