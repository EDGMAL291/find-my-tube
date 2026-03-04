const tests = [
  {
    name: "FBC",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "2-4 hours",
    notes: "Mix tube gently after collection. Avoid clots.",
    borderColor: "purple"
  },
  {
    name: "INR",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "2-3 hours",
    notes: "Tube must be filled correctly to maintain blood-to-anticoagulant ratio.",
    borderColor: "#89CFF0"
  },
  {
    name: "U&E",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-6 hours",
    notes: "Allow sample to clot before centrifugation.",
    borderColor: "yellow"
  },
  {
    name: "CRP",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-6 hours",
    notes: "Can be processed with routine chemistry samples.",
    borderColor: "yellow"
  },
  {
    name: "CMP (Comprehensive Metabolic Panel)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Includes electrolytes, renal and liver markers.",
    borderColor: "yellow"
  },
  {
    name: "Lipid Profile / Lipogram",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Fasting sample preferred where clinically indicated.",
    borderColor: "yellow"
  },
  {
    name: "Liver Function Tests (LFT)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-6 hours",
    notes: "Allow sample to clot before centrifugation.",
    borderColor: "yellow"
  },
  {
    name: "Iron Studies",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Morning fasting sample may improve interpretability.",
    borderColor: "yellow"
  },
  {
    name: "TSH / Thyroid Profile",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-12 hours",
    notes: "Can be combined with FT4/FT3 depending on request.",
    borderColor: "yellow"
  },
  {
    name: "HbA1c",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "6-12 hours",
    notes: "Reflects average glycemic control over ~3 months.",
    borderColor: "purple"
  },
  {
    name: "PSA",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-12 hours",
    notes: "Avoid sample collection soon after prostate manipulation.",
    borderColor: "yellow"
  },
  {
    name: "D-Dimer",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "2-4 hours",
    notes: "Fill tube completely to maintain proper ratio.",
    borderColor: "#89CFF0"
  },
  {
    name: "Blood Group & Rh",
    tubeColor: "Pink",
    specimen: "EDTA whole blood",
    turnaroundTime: "2-6 hours",
    notes: "Label sample at bedside to reduce identification errors.",
    borderColor: "pink"
  },
  {
    name: "Glucose",
    tubeColor: "Grey",
    specimen: "Fluoride plasma",
    turnaroundTime: "2-4 hours",
    notes: "Useful when delayed processing is expected.",
    borderColor: "gray"
  },
  {
    name: "ESR",
    tubeColor: "Black",
    specimen: "Citrate whole blood",
    turnaroundTime: "Same day",
    notes: "Use correct ESR tube where applicable.",
    borderColor: "black"
  },
  {
    name: "Procalcitonin (PCT)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Listed on Ampath form under inflammatory markers.",
    borderColor: "yellow"
  },
  {
    name: "Free T4",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Endocrinology test listed on PathCare and Ampath forms.",
    borderColor: "yellow"
  },
  {
    name: "Free T3",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Endocrinology test listed on PathCare and Ampath forms.",
    borderColor: "yellow"
  },
  {
    name: "Thyroid Antibodies (TPO and Tg Ab)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Autoimmune/endocrine thyroid antibody profile.",
    borderColor: "yellow"
  },
  {
    name: "FSH",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Endocrinology/reproductive screen.",
    borderColor: "yellow"
  },
  {
    name: "LH",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Endocrinology/reproductive screen.",
    borderColor: "yellow"
  },
  {
    name: "Prolactin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Endocrinology/reproductive screen.",
    borderColor: "yellow"
  },
  {
    name: "Progesterone",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Endocrinology/reproductive screen.",
    borderColor: "yellow"
  },
  {
    name: "Estradiol",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Endocrinology/reproductive screen.",
    borderColor: "yellow"
  },
  {
    name: "Cortisol",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Endocrinology screening profile.",
    borderColor: "yellow"
  },
  {
    name: "DHEAS",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Listed in hirsutism/endocrinology profile.",
    borderColor: "yellow"
  },
  {
    name: "Prothrombin Time (PT)",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "2-4 hours",
    notes: "Coagulation screen item.",
    borderColor: "#89CFF0"
  },
  {
    name: "Partial Thromboplastin Time (PTT)",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "2-4 hours",
    notes: "Coagulation screen item.",
    borderColor: "#89CFF0"
  },
  {
    name: "Fibrinogen",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "2-6 hours",
    notes: "Coagulation/thrombosis screen item.",
    borderColor: "#89CFF0"
  },
  {
    name: "Von Willebrand Screen",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "1-3 days",
    notes: "Bleeding tendency screen.",
    borderColor: "#89CFF0"
  },
  {
    name: "DIC Screen",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "Same day",
    notes: "Profile includes PT/PTT/fibrinogen and related markers.",
    borderColor: "#89CFF0"
  },
  {
    name: "Factor V Leiden",
    tubeColor: "Lavender/Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "2-5 days",
    notes: "Thrombosis screen item; molecular/genetic workflow may vary by lab.",
    borderColor: "purple"
  },
  {
    name: "ANA (Antinuclear Antibody)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Autoimmune screening test.",
    borderColor: "yellow"
  },
  {
    name: "ENA/CTD Screen",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Autoimmune connective tissue disease screen.",
    borderColor: "yellow"
  },
  {
    name: "Rheumatoid Factor (RF)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day",
    notes: "Autoimmune screen item.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis A IgM",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Viral hepatitis acute infection marker.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis B Surface Antigen (HBsAg)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Viral hepatitis screening marker.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis B Surface Antibody (HBsAb)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Viral hepatitis immunity marker.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis B Core Total Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Viral hepatitis exposure marker.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis C Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Hepatitis C screening marker.",
    borderColor: "yellow"
  },
  {
    name: "HIV ELISA",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Infectious disease screen with confirmatory testing per lab protocol.",
    borderColor: "yellow"
  },
  {
    name: "HIV Viral Load (PCR)",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "1-3 days",
    notes: "Molecular HIV quantification test.",
    borderColor: "purple"
  },
  {
    name: "RPR (Syphilis Screen)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Syphilis screening assay.",
    borderColor: "yellow"
  },
  {
    name: "Treponema pallidum Antibody Screen",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Treponemal syphilis test.",
    borderColor: "yellow"
  },
  {
    name: "Respiratory PCR Panel",
    tubeColor: "N/A (Swab-specific)",
    specimen: "Nasopharyngeal/respiratory specimen",
    turnaroundTime: "Same day to 1 day",
    notes: "Multiplex PCR panel for respiratory pathogens.",
    borderColor: "#64748b"
  },
  {
    name: "GI PCR Panel",
    tubeColor: "N/A (Stool specimen)",
    specimen: "Stool",
    turnaroundTime: "1-2 days",
    notes: "Multiplex gastrointestinal pathogen panel.",
    borderColor: "#64748b"
  },
  {
    name: "Meningitis/Encephalitis PCR Panel",
    tubeColor: "N/A (CSF container)",
    specimen: "CSF",
    turnaroundTime: "Same day to 1 day",
    notes: "Multiplex PCR panel for CNS pathogens.",
    borderColor: "#64748b"
  },
  {
    name: "Pneumonia Panel (PCR)",
    tubeColor: "N/A (Respiratory specimen)",
    specimen: "Lower respiratory tract sample",
    turnaroundTime: "Same day to 1 day",
    notes: "Multiplex lower respiratory pathogen panel.",
    borderColor: "#64748b"
  },
  {
    name: "STD PCR",
    tubeColor: "N/A (Swab or urine)",
    specimen: "Genital swab or urine",
    turnaroundTime: "1-3 days",
    notes: "Molecular STI screen panel.",
    borderColor: "#64748b"
  },
  {
    name: "Genital Ulcer PCR",
    tubeColor: "N/A (Ulcer swab)",
    specimen: "Ulcer swab/bubo aspirate/rectal swab",
    turnaroundTime: "1-3 days",
    notes: "Molecular test for ulcer-associated pathogens.",
    borderColor: "#64748b"
  },
  {
    name: "Bacterial Vaginosis PCR",
    tubeColor: "N/A (Vaginal swab)",
    specimen: "Vaginal swab",
    turnaroundTime: "1-3 days",
    notes: "PCR panel for BV-associated organisms.",
    borderColor: "#64748b"
  },
  {
    name: "Blood Culture",
    tubeColor: "Blood Culture Bottles",
    specimen: "Blood",
    turnaroundTime: "24-120 hours",
    notes: "Collect aseptically before antibiotics where possible.",
    borderColor: "#64748b"
  },
  {
    name: "Urine MCS",
    tubeColor: "Sterile urine container",
    specimen: "Midstream urine",
    turnaroundTime: "24-72 hours",
    notes: "Microbiology culture and sensitivity.",
    borderColor: "#64748b"
  },
  {
    name: "CSF MCS",
    tubeColor: "Sterile CSF container",
    specimen: "CSF",
    turnaroundTime: "24-72 hours",
    notes: "Microbiology culture and sensitivity of CSF.",
    borderColor: "#64748b"
  },
  {
    name: "Stool Culture",
    tubeColor: "Sterile stool container",
    specimen: "Stool",
    turnaroundTime: "24-72 hours",
    notes: "Routine stool microbiology culture.",
    borderColor: "#64748b"
  },
  {
    name: "TB PCR (GeneXpert)",
    tubeColor: "N/A (Specimen-specific)",
    specimen: "Sputum/respiratory or other appropriate sample",
    turnaroundTime: "Same day to 2 days",
    notes: "Molecular tuberculosis testing.",
    borderColor: "#64748b"
  },
  {
    name: "TB Culture",
    tubeColor: "N/A (Specimen-specific)",
    specimen: "Sputum/respiratory or other appropriate sample",
    turnaroundTime: "2-8 weeks",
    notes: "Mycobacterial culture turnaround is typically prolonged.",
    borderColor: "#64748b"
  },
  {
    name: "Calprotectin (Fecal)",
    tubeColor: "Stool container",
    specimen: "Stool",
    turnaroundTime: "1-3 days",
    notes: "Gut inflammation marker listed on form.",
    borderColor: "#64748b"
  },
  {
    name: "Celiac Screen",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Coeliac antibody screening panel.",
    borderColor: "yellow"
  },
  {
    name: "Creatinine",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Routine renal function test.",
    borderColor: "yellow"
  },
  {
    name: "Uric Acid",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Chemistry profile test.",
    borderColor: "yellow"
  },
  {
    name: "Sodium",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Electrolyte profile test.",
    borderColor: "yellow"
  },
  {
    name: "Potassium",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Electrolyte profile test.",
    borderColor: "yellow"
  },
  {
    name: "Chloride",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Electrolyte profile test.",
    borderColor: "yellow"
  },
  {
    name: "Calcium",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Bone/electrolyte chemistry marker.",
    borderColor: "yellow"
  },
  {
    name: "Phosphate",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Bone and renal chemistry marker.",
    borderColor: "yellow"
  },
  {
    name: "Magnesium",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Routine chemistry test.",
    borderColor: "yellow"
  },
  {
    name: "Albumin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Protein chemistry marker.",
    borderColor: "yellow"
  },
  {
    name: "Bilirubin Total",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Liver/pancreas profile component.",
    borderColor: "yellow"
  },
  {
    name: "ALT",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Liver enzyme test.",
    borderColor: "yellow"
  },
  {
    name: "AST",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Liver enzyme test.",
    borderColor: "yellow"
  },
  {
    name: "GGT",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Liver enzyme test.",
    borderColor: "yellow"
  },
  {
    name: "ALP",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Liver and bone enzyme marker.",
    borderColor: "yellow"
  },
  {
    name: "LDH",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "General tissue injury marker.",
    borderColor: "yellow"
  },
  {
    name: "CK Total",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Muscle/cardiac enzyme marker.",
    borderColor: "yellow"
  },
  {
    name: "Troponin T HS",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-4 hours",
    notes: "High-sensitivity cardiac injury marker.",
    borderColor: "yellow"
  },
  {
    name: "NT-proBNP",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-12 hours",
    notes: "Cardiac strain/heart failure marker.",
    borderColor: "yellow"
  },
  {
    name: "HDL Cholesterol",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Lipid profile component.",
    borderColor: "yellow"
  },
  {
    name: "LDL Cholesterol",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Lipid profile component.",
    borderColor: "yellow"
  },
  {
    name: "Triglycerides",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Lipid profile component.",
    borderColor: "yellow"
  },
  {
    name: "Beta-hCG Quantitative",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-12 hours",
    notes: "Pregnancy-related endocrine marker.",
    borderColor: "yellow"
  },
  {
    name: "C-Peptide",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Diabetes/endocrine investigation.",
    borderColor: "yellow"
  },
  {
    name: "Anti-Thyroglobulin Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Autoimmune thyroid antibody test.",
    borderColor: "yellow"
  },
  {
    name: "TSH Receptor Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Graves disease-associated antibody test.",
    borderColor: "yellow"
  },
  {
    name: "Lupus Anticoagulant",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "1-3 days",
    notes: "Coagulation autoantibody screen.",
    borderColor: "#89CFF0"
  },
  {
    name: "Anti-CCP Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Rheumatology autoimmune marker.",
    borderColor: "yellow"
  },
  {
    name: "ANCA",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Autoimmune vasculitis screen.",
    borderColor: "yellow"
  },
  {
    name: "Anti-dsDNA",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Systemic autoimmune marker.",
    borderColor: "yellow"
  },
  {
    name: "Complement C3",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Complement pathway marker.",
    borderColor: "yellow"
  },
  {
    name: "Complement C4",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Complement pathway marker.",
    borderColor: "yellow"
  },
  {
    name: "H. pylori Stool Antigen",
    tubeColor: "Stool container",
    specimen: "Stool",
    turnaroundTime: "1-3 days",
    notes: "Stool antigen test for Helicobacter pylori.",
    borderColor: "#64748b"
  },
  {
    name: "C. difficile Toxin A/B",
    tubeColor: "Stool container",
    specimen: "Stool",
    turnaroundTime: "Same day to 1 day",
    notes: "Stool toxin assay for C. difficile infection.",
    borderColor: "#64748b"
  },
  {
    name: "Semen Analysis",
    tubeColor: "Sterile semen container",
    specimen: "Semen",
    turnaroundTime: "Same day",
    notes: "Male fertility and post-vasectomy checks.",
    borderColor: "#64748b"
  },
  {
    name: "MRSA Screen",
    tubeColor: "N/A (Swab-specific)",
    specimen: "Nasal/groin/other screening swab",
    turnaroundTime: "1-3 days",
    notes: "Culture or PCR-based MRSA screening.",
    borderColor: "#64748b"
  },
  {
    name: "Group B Streptococcus PCR",
    tubeColor: "N/A (Swab-specific)",
    specimen: "Recto-vaginal swab",
    turnaroundTime: "1-3 days",
    notes: "Molecular Group B Strep screening test.",
    borderColor: "#64748b"
  }
];
