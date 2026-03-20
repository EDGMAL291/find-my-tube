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
    notes: "Calculated from PT ratio; tube must be filled correctly to maintain blood-to-anticoagulant ratio.",
    borderColor: "#89CFF0"
  },
  {
    name: "Coagulation Studies",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "2-4 hours",
    notes: "Profile includes PT, PTT, and INR (calculated).",
    borderColor: "#89CFF0"
  },
  {
    name: "Malaria Profile",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Urgent / same day",
    notes: "Profile includes smear, antigen, and PCR options for malaria workup.",
    borderColor: "purple"
  },
  {
    name: "Antenatal Screen (ANTINV)",
    tubeColor: "Gold + Purple + Gray",
    specimen: "Serum, EDTA whole blood, and fluoride plasma",
    turnaroundTime: "1-3 days",
    notes: "Booking antenatal profile for the first antenatal visit, ideally early in pregnancy, including blood group, antibody screen, infections, rubella immunity, and glucose.",
    borderColor: "yellow"
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
    name: "CMP",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Calcium, magnesium, phosphate profile with albumin/corrected calcium context.",
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
    name: "Ammonia",
    tubeColor: "Green (Heparin)",
    specimen: "Heparin plasma",
    turnaroundTime: "Urgent / same day",
    notes: "PathCare courier/driver must be called first. Lab calls doctor to draw while driver waits, then plasma is separated immediately on receipt.",
    criticalPrep: "Call PathCare courier first. Draw sample only when courier is on-site waiting. Separate plasma immediately after collection and dispatch without delay.",
    borderColor: "#22c55e"
  },
  {
    name: "Fe Studies",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Morning fasting sample may improve interpretability.",
    borderColor: "yellow"
  },
  {
    name: "Serum Iron (Fe)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Iron concentration measured with iron profile interpretation.",
    borderColor: "yellow"
  },
  {
    name: "Ferritin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Reflects body iron stores.",
    borderColor: "yellow"
  },
  {
    name: "Transferrin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Iron transport protein measurement.",
    borderColor: "yellow"
  },
  {
    name: "TIBC",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Total iron binding capacity.",
    borderColor: "yellow"
  },
  {
    name: "Transferrin Saturation (Calculated)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Calculated from iron and binding capacity.",
    borderColor: "yellow"
  },
  {
    name: "Thyroid Function Test (TFT)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-12 hours",
    notes: "Core TFT includes TSH and Free T4; add Free T3 if requested.",
    borderColor: "yellow"
  },
  {
    name: "Menopausal Screen",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Screen includes FSH, LH, and Estradiol (E2) for menopausal endocrine assessment.",
    borderColor: "yellow"
  },
  {
    name: "BHCG (Beta-HCG)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Quantitative serum beta-HCG used for pregnancy assessment, confirmation, and follow-up when clinically indicated.",
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
    name: "Blood Group & Rh",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "2-6 hours",
    notes: "Label sample at bedside to reduce identification errors.",
    borderColor: "purple"
  },
  {
    name: "Blood Bank / Transfusion",
    tubeColor: "Pink",
    specimen: "EDTA whole blood",
    turnaroundTime: "Urgent / same day",
    notes: "Pink tube request for blood bank / transfusion processing.",
    criticalPrep: "The requesting healthcare professional (HCP) should complete the Western Cape blood bank form and call the driver to courier the tube and form to blood bank in GSH.",
    borderColor: "#ec4899"
  },
  {
    name: "ESR",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Use correct ESR tube where applicable.",
    borderColor: "purple"
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
    notes: "Listed in the hirsutism/hormone profile.",
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
    tubeColor: "Purple + Light Blue",
    specimen: "EDTA whole blood + citrate plasma",
    turnaroundTime: "Same day",
    notes: "Profile includes FBC/platelets, PT/PTT, fibrinogen, and D-dimer/XDP.",
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
    name: "HIV Viral Load",
    tubeColor: "Pearl/White",
    specimen: "EDTA plasma",
    turnaroundTime: "1-3 days",
    notes: "Molecular HIV quantification test. Local protocol uses a pearl tube (PPT, sometimes called white) with EDTA and gel separator.",
    borderColor: "#e5e7eb"
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
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "Same day to 1 day",
    notes: "Multiplex PCR panel for CNS pathogens on CSF.",
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
    specimen: "Vaginal swab or urine",
    turnaroundTime: "1-3 days",
    notes: "Molecular STI screen panel.",
    borderColor: "#64748b"
  },
  {
    name: "Chlamydia trachomatis PCR",
    tubeColor: "N/A (Swab or urine)",
    specimen: "Vaginal swab or urine",
    turnaroundTime: "1-3 days",
    notes: "Molecular chlamydia test.",
    borderColor: "#64748b"
  },
  {
    name: "Neisseria gonorrhoeae PCR",
    tubeColor: "N/A (Swab or urine)",
    specimen: "Vaginal swab or urine",
    turnaroundTime: "1-3 days",
    notes: "Molecular gonorrhoea test.",
    borderColor: "#64748b"
  },
  {
    name: "Trichomonas vaginalis PCR",
    tubeColor: "N/A (Swab or urine)",
    specimen: "Vaginal swab or urine",
    turnaroundTime: "1-3 days",
    notes: "Molecular trichomonas test.",
    borderColor: "#64748b"
  },
  {
    name: "Mycoplasma genitalium PCR",
    tubeColor: "N/A (Swab or urine)",
    specimen: "Vaginal swab or urine",
    turnaroundTime: "1-3 days",
    notes: "Molecular Mycoplasma genitalium test.",
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
    name: "CSF Profile",
    tubeColor: "Tan",
    specimen: "CSF (Tan tubes)",
    turnaroundTime: "Same day to 3 days",
    notes: "CSF profile combining MCS, cell count, chemistry, and cytology.",
    criticalPrep: "Send urgently and clearly state if the patient was already on antimicrobials when the sample was taken.",
    specimenGuide: "CSF in appropriately labelled tan/CSF tubes as per local protocol.",
    borderColor: "#64748b"
  },
  {
    name: "CSF MCS",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "24-72 hours",
    notes: "Microbiology culture and sensitivity of CSF. Local workflow includes cryptococcal antigen; this may also be reflexed if lymphocytes are >5/uL or protein is abnormal.",
    criticalPrep: "Clearly state if the patient was already on antimicrobials when the sample was taken.",
    specimenGuide: "CSF in tan tube (per lab protocol).",
    borderColor: "#64748b"
  },
  {
    name: "CSF Cell Count and Chemistry",
    tubeColor: "Tan + Gray",
    specimen: "CSF",
    turnaroundTime: "Same day",
    notes: "CSF chemistry profile including cell count and differential, glucose, protein, IgG index, ADA, and oligoclonal bands. Fill both the tan tube and the gray top fluoride tube with CSF, not blood. Paired serum is also needed for IgG index and usually for oligoclonal bands.",
    borderColor: "#64748b"
  },
  {
    name: "CSF Cell Count and Differential",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "Same day",
    notes: "CSF microscopy with cell count and differential.",
    borderColor: "#64748b"
  },
  {
    name: "CSF Glucose",
    tubeColor: "Gray",
    turnaroundTime: "Same day",
    notes: "CSF glucose measurement on a gray top tube with fluoride additive.",
    borderColor: "#9ca3af"
  },
  {
    name: "CSF Protein",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "Same day",
    notes: "CSF protein measurement.",
    borderColor: "#64748b"
  },
  {
    name: "CSF Cytology",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "1-3 days",
    notes: "CSF cytology for malignant or abnormal cells.",
    borderColor: "#64748b"
  },
  {
    name: "Cryptococcal Antigen (CSF)",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "Same day to 1 day",
    notes: "CSF cryptococcal antigen test. Also covered in local CSF MCS workflow.",
    borderColor: "#64748b"
  },
  {
    name: "Enterovirus PCR (CSF)",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "1-3 days",
    notes: "CSF enterovirus PCR.",
    borderColor: "#64748b"
  },
  {
    name: "Mumps PCR (CSF)",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "1-3 days",
    notes: "CSF mumps PCR.",
    borderColor: "#64748b"
  },
  {
    name: "CSF IgG Index",
    tubeColor: "Tan + Gold/Yellow",
    specimen: "CSF + paired blood (Gold/Yellow)",
    turnaroundTime: "1-3 days",
    notes: "CSF IgG index assessment. Collect CSF in a tan tube and paired blood in a Gold/Yellow tube.",
    borderColor: "#64748b"
  },
  {
    name: "CSF Oligoclonal Bands",
    tubeColor: "Tan",
    specimen: "CSF (Sterile tan tube) + paired serum",
    turnaroundTime: "1-3 days",
    notes: "CSF oligoclonal bands used mainly in demyelinating or inflammatory CNS workup, such as multiple sclerosis. Paired serum is usually required.",
    borderColor: "#64748b"
  },
  {
    name: "CSF ADA",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "1-3 days",
    notes: "CSF adenosine deaminase (ADA).",
    borderColor: "#64748b"
  },
  {
    name: "FTA (CSF)",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "1-3 days",
    notes: "CSF treponemal antibody test used in neurosyphilis workup.",
    borderColor: "#64748b"
  },
  {
    name: "HSV-1 PCR (CSF)",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "1-3 days",
    notes: "CSF HSV-1 PCR.",
    borderColor: "#64748b"
  },
  {
    name: "HSV-2 PCR (CSF)",
    tubeColor: "Tan",
    specimen: "CSF (Tan tube)",
    turnaroundTime: "1-3 days",
    notes: "CSF HSV-2 PCR.",
    borderColor: "#64748b"
  },
  {
    name: "Swab MCS",
    tubeColor: "N/A (Swab-specific)",
    specimen: "Wound/throat/nasal/other clinical swab",
    turnaroundTime: "24-72 hours",
    notes: "Microbiology culture and sensitivity on swab specimen.",
    borderColor: "#64748b"
  },
  {
    name: "Stool MCS",
    tubeColor: "Sterile stool container",
    specimen: "Stool",
    turnaroundTime: "24-72 hours",
    notes: "Microbiology culture and sensitivity on stool specimen.",
    borderColor: "#64748b"
  },
  {
    name: "Sputum MCS",
    tubeColor: "Sterile sputum container",
    specimen: "Sputum",
    turnaroundTime: "24-72 hours",
    notes: "Microbiology culture and sensitivity on sputum specimen.",
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
    name: "Faecal Occult Blood",
    tubeColor: "Stool container",
    specimen: "Stool",
    turnaroundTime: "1-3 days",
    notes: "Occult blood screening test performed on a stool sample.",
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
    name: "IgE Total",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Allergy screening baseline. If positive IgE/screening, request individual allergen tests.",
    borderColor: "yellow"
  },
  {
    name: "Phadiatop Inhalant Screen",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Inhalant allergy screen. If positive IgE/screening, request individual allergen tests.",
    borderColor: "yellow"
  },
  {
    name: "Pediatric Food Screen",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Paediatric food allergy screen. If positive IgE/screening, request individual allergen tests.",
    borderColor: "yellow"
  },
  {
    name: "Adult Food Screen",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Adult food allergy screen. If positive IgE/screening, request individual allergen tests.",
    borderColor: "yellow"
  },
  {
    name: "Skin Prick Test",
    tubeColor: "N/A (Clinic procedure)",
    specimen: "Skin test (in vivo)",
    turnaroundTime: "Same day",
    notes: "Allergy skin prick panel. If screening is positive, request individual allergen tests as needed.",
    borderColor: "#64748b"
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
    tubeColor: "Green (Heparinised) preferred / Gold-Yellow acceptable",
    specimen: "Heparinised plasma (preferred) or serum",
    turnaroundTime: "4-8 hours",
    notes: "General tissue injury marker.",
    borderColor: "yellow"
  },
  {
    name: "Haptoglobin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Haemolysis workup marker. Most official lab guides prefer serum/serum-gel; some labs also accept heparin plasma or EDTA.",
    borderColor: "yellow"
  },
  {
    name: "CK Total",
    tubeColor: "Green (Heparinised) preferred / Gold-Yellow acceptable",
    specimen: "Heparinised plasma (preferred) or serum",
    turnaroundTime: "4-8 hours",
    notes: "Muscle/cardiac enzyme marker.",
    borderColor: "yellow"
  },
  {
    name: "Troponin I",
    tubeColor: "Green (Heparinised) preferred / Gold-Yellow acceptable",
    specimen: "Heparinised plasma (preferred) or serum",
    turnaroundTime: "1-4 hours",
    notes: "Primary biomarker for suspected acute myocardial injury.",
    borderColor: "green"
  },
  {
    name: "Cardiac Profile",
    tubeColor: "Green (Heparinised) preferred / Gold-Yellow acceptable",
    specimen: "Heparinised plasma (preferred) or serum",
    turnaroundTime: "1-4 hours",
    notes: "Profile includes CK Total, CK-MB Mass, and Troponin I.",
    borderColor: "yellow"
  },
  {
    name: "NT-proBNP",
    tubeColor: "Green (Heparinised) preferred / Gold-Yellow acceptable",
    specimen: "Heparinised plasma (preferred) or serum",
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
    name: "p-ANCA",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Perinuclear ANCA-associated autoimmune vasculitis marker.",
    borderColor: "yellow"
  },
  {
    name: "c-ANCA",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Cytoplasmic ANCA-associated autoimmune vasculitis marker.",
    borderColor: "yellow"
  },
  {
    name: "PR3 Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Proteinase 3 autoantibody used in ANCA-associated vasculitis workup.",
    borderColor: "yellow"
  },
  {
    name: "MPO Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Myeloperoxidase autoantibody used in ANCA-associated vasculitis workup.",
    borderColor: "yellow"
  },
  {
    name: "GBM IIF",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Glomerular basement membrane indirect immunofluorescence test.",
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
  },
  {
    name: "Blood Gases",
    tubeColor: "Green (Heparinised)",
    specimen: "Heparinised whole blood",
    turnaroundTime: "Urgent / same day",
    notes: "Analyze promptly after collection.",
    borderColor: "#22c55e"
  },
  {
    name: "Creatinine Clearance (Serum and 24hr Urine)",
    tubeColor: "Gold + 24hr urine container",
    specimen: "Serum and 24hr urine",
    turnaroundTime: "1 day",
    notes: "Requires paired serum and timed urine sample.",
    borderColor: "#64748b"
  },
  {
    name: "Lactate",
    tubeColor: "Grey",
    specimen: "Fluoride plasma",
    turnaroundTime: "Urgent / same day",
    notes: "Transport quickly to reduce pre-analytical error.",
    borderColor: "gray"
  },
  {
    name: "Parathyroid Hormone (PTH)",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "1 day",
    notes: "Parathyroid hormone test from the renal/bone panel.",
    criticalPrep: "Collect in a purple EDTA tube, invert gently to mix, avoid clots, and send promptly per lab handling protocol.",
    borderColor: "purple"
  },
  {
    name: "Vitamin D (25OH)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Vitamin D status test.",
    borderColor: "yellow"
  },
  {
    name: "Urea",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Renal chemistry marker.",
    borderColor: "yellow"
  },
  {
    name: "Protein:Creatinine Ratio (Random Urine)",
    tubeColor: "Sterile urine container",
    specimen: "Random urine sample",
    turnaroundTime: "Same day to 1 day",
    notes: "Urine protein:creatinine ratio on a random urine sample.",
    borderColor: "#64748b"
  },
  {
    name: "Albumin:Creatinine Ratio (Random Urine)",
    tubeColor: "Sterile urine container",
    specimen: "Random urine sample",
    turnaroundTime: "Same day to 1 day",
    notes: "Urine albumin:creatinine ratio on a random urine sample.",
    borderColor: "#64748b"
  },
  {
    name: "Daily Urine Protein (24hr Urine)",
    tubeColor: "24hr urine bottle",
    specimen: "24hr urine",
    turnaroundTime: "1 day",
    notes: "Timed 24-hour urine protein quantification.",
    criticalPrep: "Collect the full 24-hour urine sample in the correct lab-issued 24-hour urine bottle and follow local collection and storage instructions.",
    borderColor: "#64748b"
  },
  {
    name: "Calcium/Phosphate (24hr Urine)",
    tubeColor: "24hr urine container",
    specimen: "24hr urine",
    turnaroundTime: "1 day",
    notes: "Timed urine mineral excretion test.",
    borderColor: "#64748b"
  },
  {
    name: "Uric Acid (24hr Urine)",
    tubeColor: "24hr urine container",
    specimen: "24hr urine",
    turnaroundTime: "1 day",
    notes: "Timed urine uric acid excretion test.",
    borderColor: "#64748b"
  },
  {
    name: "Bilirubin Total and Conjugated",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Liver panel bilirubin fractionation.",
    borderColor: "yellow"
  },
  {
    name: "Bilirubin (Neonatal Screen)",
    tubeColor: "Gold",
    tubeVariant: "Paeds microtainer",
    specimen: "Serum",
    turnaroundTime: "Urgent / same day",
    notes: "Neonatal bilirubin assessment, usually collected in a gold/yellow paeds microtainer.",
    borderColor: "yellow"
  },
  {
    name: "Total Serum Bilirubin (TSB)",
    tubeColor: "Gold",
    tubeVariant: "Paeds microtainer",
    specimen: "Serum",
    turnaroundTime: "Urgent / same day",
    notes: "Preferred bilirubin profile for newborn and infant jaundice monitoring, including total bilirubin and conjugated/direct bilirubin; unconjugated/indirect bilirubin is calculated. Usually collected in a gold/yellow paeds microtainer.",
    borderColor: "yellow"
  },
  {
    name: "Total Protein",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Liver and nutrition chemistry marker.",
    borderColor: "yellow"
  },
  {
    name: "Pre-Albumin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1 day",
    notes: "Short-term nutritional marker.",
    borderColor: "yellow"
  },
  {
    name: "Amylase",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Pancreatic enzyme test.",
    borderColor: "yellow"
  },
  {
    name: "Lipase",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Pancreatic enzyme test.",
    borderColor: "yellow"
  },
  {
    name: "Alpha-1-Antitrypsin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Protein deficiency/inflammation marker.",
    borderColor: "yellow"
  },
  {
    name: "Steatocrit",
    tubeColor: "Stool container",
    specimen: "Stool",
    turnaroundTime: "1-3 days",
    notes: "Fecal fat screening test.",
    borderColor: "#64748b"
  },
  {
    name: "Myoglobin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day",
    notes: "Cardiac/muscle injury marker.",
    borderColor: "yellow"
  },
  {
    name: "CK-MB Mass",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day",
    notes: "Cardiac injury marker.",
    borderColor: "yellow"
  },
  {
    name: "Cholesterol Total",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Lipid profile component.",
    borderColor: "yellow"
  },
  {
    name: "Non-HDL Cholesterol (Calculated)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "4-8 hours",
    notes: "Calculated from total cholesterol and HDL cholesterol.",
    borderColor: "yellow"
  },
  {
    name: "Lipoprotein (a)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Cardiovascular risk marker.",
    borderColor: "yellow"
  },
  {
    name: "Apolipoprotein A1 and B",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Advanced lipid risk profile.",
    borderColor: "yellow"
  },
  {
    name: "Homocysteine (Fasting)",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "1 day",
    notes: "Cardiovascular/thrombotic risk marker.",
    borderColor: "purple"
  },
  {
    name: "Fasting Glucose",
    tubeColor: "Grey",
    specimen: "Fluoride plasma",
    turnaroundTime: "Same day",
    notes: "Fasting glucose measurement.",
    borderColor: "gray"
  },
  {
    name: "Random Glucose",
    tubeColor: "Grey",
    specimen: "Fluoride plasma",
    turnaroundTime: "Same day",
    notes: "Random glucose measurement.",
    borderColor: "gray"
  },
  {
    name: "OGTT (2hr)",
    tubeColor: "Grey",
    specimen: "Fluoride plasma (fasting, 1 hour, 2 hour)",
    turnaroundTime: "Same day",
    notes: "75 g oral glucose tolerance test with fasting, 1 hour, and 2 hour fluoride samples.",
    criticalPrep: "Fast overnight. Draw the fasting sample first, then give 75 g glucose to drink within 5 minutes. Keep the patient seated during the test; no food, smoking, or caffeine until the 2 hour sample is taken.",
    borderColor: "gray"
  },
  {
    name: "OGTT Pregnancy (75g, 2hr)",
    tubeColor: "Grey",
    specimen: "Fluoride plasma (fasting, 1 hour, 2 hour)",
    turnaroundTime: "Same day",
    notes: "Pregnancy 75 g oral glucose tolerance test with fasting, 1 hour, and 2 hour fluoride samples.",
    criticalPrep: "Fast overnight. Draw the fasting sample first, then give 75 g glucose to drink within 5 minutes. Keep the patient seated during the test; no food, smoking, or caffeine until the 2 hour sample is taken.",
    borderColor: "gray"
  },
  {
    name: "Insulin (Fasting)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1 day",
    notes: "Fasting insulin level.",
    borderColor: "yellow"
  },
  {
    name: "IgG Subfractions 1-4",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "2-5 days",
    notes: "Immunoglobulin G subclass profile.",
    borderColor: "yellow"
  },
  {
    name: "Immunoglobulin G (IgG)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Immunoglobulin quantification.",
    borderColor: "yellow"
  },
  {
    name: "Immunoglobulin A (IgA)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Immunoglobulin quantification.",
    borderColor: "yellow"
  },
  {
    name: "Immunoglobulin M (IgM)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Immunoglobulin quantification.",
    borderColor: "yellow"
  },
  {
    name: "TSH",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Thyroid stimulating hormone.",
    borderColor: "yellow"
  },
  {
    name: "Cord Blood",
    tubeColor: "Gold",
    specimen: "Cord blood serum",
    turnaroundTime: "6-24 hours",
    notes: "Cord blood profile including TSH and RPR.",
    borderColor: "yellow"
  },
  {
    name: "Hirsutism Screen (Full)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Endocrine reproductive profile.",
    borderColor: "yellow"
  },
  {
    name: "Infertility Screen (Female)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Female infertility hormone profile.",
    borderColor: "yellow"
  },
  {
    name: "Infertility Screen (Male)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Male infertility hormone profile.",
    borderColor: "yellow"
  },
  {
    name: "Total Testosterone (+SHBG if Female)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Reproductive endocrine marker.",
    borderColor: "yellow"
  },
  {
    name: "Free Testosterone (Calculated, Male)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Male androgen profile.",
    borderColor: "yellow"
  },
  {
    name: "17-OH Progesterone",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Congenital adrenal hyperplasia workup marker.",
    borderColor: "yellow"
  },
  {
    name: "Semen Analysis Post Vasectomy",
    tubeColor: "Sterile semen container",
    specimen: "Semen",
    turnaroundTime: "Same day",
    notes: "Post-vasectomy fertility clearance check.",
    borderColor: "#64748b"
  },
  {
    name: "E2 (Routine)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Estradiol measurement.",
    borderColor: "yellow"
  },
  {
    name: "E2 (On anti-E2 Rx)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "6-24 hours",
    notes: "Estradiol monitoring while on therapy.",
    borderColor: "yellow"
  },
  {
    name: "Cortisol (24hr Urine)",
    tubeColor: "24hr urine bottle",
    specimen: "24hr urine",
    turnaroundTime: "1-3 days",
    notes: "Timed 24-hour urinary cortisol collection.",
    criticalPrep: "Collect the full 24-hour urine sample in the correct lab-issued 24-hour urine bottle and follow local collection and storage instructions.",
    borderColor: "#64748b"
  },
  {
    name: "Aldosterone:Renin Ratio",
    tubeColor: "Gold",
    specimen: "Serum/plasma",
    turnaroundTime: "1-3 days",
    notes: "Hypertension endocrine workup.",
    borderColor: "yellow"
  },
  {
    name: "Dexamethasone Suppression",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1 day",
    notes: "Cortisol suppression protocol test.",
    borderColor: "yellow"
  },
  {
    name: "5-HIAA (24hr Urine)",
    tubeColor: "24hr urine bottle (acid preservative)",
    specimen: "24hr urine",
    turnaroundTime: "2-5 days",
    notes: "Carcinoid syndrome marker collected as a 24-hour urine using the correct preservative bottle from the lab.",
    criticalPrep: "Patient must come to the lab before starting collection to collect the correct 24-hour urine bottle with acid preservative. Follow local dietary and collection instructions, then keep handling per lab protocol.",
    borderColor: "#64748b"
  },
  {
    name: "Metanephrines (24hr Urine)",
    tubeColor: "24hr urine bottle (preservative supplied by lab)",
    specimen: "24hr urine",
    turnaroundTime: "2-5 days",
    notes: "Pheochromocytoma workup marker collected as a 24-hour urine using the correct preservative bottle from the lab.",
    criticalPrep: "Patient must come to the lab before starting collection to collect the correct 24-hour urine bottle with preservative. Preservative and handling requirements vary by lab, so follow local protocol.",
    borderColor: "#64748b"
  },
  {
    name: "AFP",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Tumor marker.",
    borderColor: "yellow"
  },
  {
    name: "CA 15-3",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Tumor marker.",
    borderColor: "yellow"
  },
  {
    name: "CA 19-9",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Tumor marker.",
    borderColor: "yellow"
  },
  {
    name: "CA 125",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Tumor marker.",
    borderColor: "yellow"
  },
  {
    name: "CA 72-4",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Tumor marker.",
    borderColor: "yellow"
  },
  {
    name: "CEA",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Tumor marker.",
    borderColor: "yellow"
  },
  {
    name: "Protein Electrophoresis with Immunofixation",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "2-5 days",
    notes: "Myeloma/monoclonal protein workup.",
    borderColor: "yellow"
  },
  {
    name: "Free Light Chains (Serum)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "2-5 days",
    notes: "Myeloma marker.",
    borderColor: "yellow"
  },
  {
    name: "Bence-Jones Protein (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "2-5 days",
    notes: "Urine myeloma marker.",
    borderColor: "#64748b"
  },
  {
    name: "Beta-2 Microglobulin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Hematologic tumor marker.",
    borderColor: "yellow"
  },
  {
    name: "Total PSA only / Follow Up",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1 day",
    notes: "PSA follow-up request.",
    borderColor: "yellow"
  },
  {
    name: "Haemochromatosis PCR",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "2-7 days",
    notes: "Genetic hemochromatosis test.",
    borderColor: "purple"
  },
  {
    name: "Acute Porphyria Attack Screen (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine sample",
    turnaroundTime: "2-7 days",
    notes: "Acute porphyria attack screen performed on a urine sample.",
    borderColor: "#64748b"
  },
  {
    name: "Porphobilinogen Follow-up (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "2-7 days",
    notes: "Porphyria follow-up assay.",
    borderColor: "#64748b"
  },
  {
    name: "Full Porphyria Screen (Blood, Urine, Stool)",
    tubeColor: "Blood tube + urine container + stool container",
    specimen: "Blood, urine, and stool",
    turnaroundTime: "2-7 days",
    notes: "Comprehensive porphyria panel using blood, urine, and stool specimens.",
    borderColor: "#64748b"
  },
  {
    name: "Porphyria Variegata PCR (R59W)",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "2-7 days",
    notes: "Genetic porphyria test.",
    borderColor: "purple"
  },
  {
    name: "ISAC Comprehensive Allergy Component Profile",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "2-7 days",
    notes: "Comprehensive component-resolved allergy panel.",
    borderColor: "yellow"
  },
  {
    name: "Haemolytic Profile",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1 day",
    notes: "Hemolysis workup panel.",
    borderColor: "yellow"
  },
  {
    name: "Bone Marrow (Consult Pathologist)",
    tubeColor: "N/A (Procedure specimen)",
    specimen: "Bone marrow aspirate/trephine",
    turnaroundTime: "By pathology workflow",
    notes: "Specialist pathology consultation request.",
    borderColor: "#64748b"
  },
  {
    name: "Folate (RBC)",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "1-3 days",
    notes: "Red cell folate measurement.",
    borderColor: "purple"
  },
  {
    name: "Folate (Serum)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Serum folate measurement.",
    borderColor: "yellow"
  },
  {
    name: "Vitamin B12",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1 day",
    notes: "Vitamin B12 level.",
    borderColor: "yellow"
  },
  {
    name: "Haemoglobin",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Complete blood count component.",
    borderColor: "purple"
  },
  {
    name: "RBC Count",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Complete blood count component for red cell quantification.",
    borderColor: "purple"
  },
  {
    name: "Haematocrit (HCT)",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Complete blood count component for packed cell volume.",
    borderColor: "purple"
  },
  {
    name: "MCV",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Complete blood count red cell index (mean corpuscular volume).",
    borderColor: "purple"
  },
  {
    name: "MCH",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Complete blood count red cell index (mean corpuscular haemoglobin).",
    borderColor: "purple"
  },
  {
    name: "MCHC",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Complete blood count red cell index (mean corpuscular haemoglobin concentration).",
    borderColor: "purple"
  },
  {
    name: "Platelet Count",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Complete blood count component for platelet quantification.",
    borderColor: "purple"
  },
  {
    name: "Hb Electrophoresis",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "1-3 days",
    notes: "Hemoglobinopathy assessment.",
    borderColor: "purple"
  },
  {
    name: "Malaria Smear (Thick and Thin)",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Urgent / same day",
    notes: "Microscopy for malaria parasites.",
    borderColor: "purple"
  },
  {
    name: "Malaria Smear and Antigen",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Urgent / same day",
    notes: "Combined microscopy and rapid antigen test.",
    borderColor: "purple"
  },
  {
    name: "Malaria PCR",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "1-3 days",
    notes: "Molecular malaria test.",
    borderColor: "purple"
  },
  {
    name: "Reticulocytes",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Reticulocyte count.",
    borderColor: "purple"
  },
  {
    name: "WBC and Differential Count",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "White cell count and differential.",
    borderColor: "purple"
  },
  {
    name: "Direct Coombs",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "Same day",
    notes: "Direct antiglobulin test.",
    borderColor: "purple"
  },
  {
    name: "RBC Antibody Screen (Antenatal)",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "1 day",
    notes: "Antenatal red cell antibody screen.",
    borderColor: "purple"
  },
  {
    name: "Antibody Identification",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "1-2 days",
    notes: "Blood bank antibody identification.",
    borderColor: "purple"
  },
  {
    name: "Antibody Titration",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "1-2 days",
    notes: "Blood bank antibody titer.",
    borderColor: "purple"
  },
  {
    name: "Inherited Thrombotic Screen",
    tubeColor: "Purple + Light Blue",
    specimen: "EDTA blood and citrate plasma",
    turnaroundTime: "2-7 days",
    notes: "Inherited thrombophilia panel.",
    borderColor: "#89CFF0"
  },
  {
    name: "Antiphospholipid Syndrome Profile",
    tubeColor: "Gold + Light Blue",
    specimen: "Serum and citrate plasma",
    turnaroundTime: "2-7 days",
    notes: "Lupus anticoagulant and antiphospholipid antibodies.",
    borderColor: "#89CFF0"
  },
  {
    name: "INR and Dosage",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "Same day",
    notes: "Warfarin monitoring profile.",
    borderColor: "#89CFF0"
  },
  {
    name: "XDP (D-Dimer)",
    tubeColor: "Light Blue",
    specimen: "Citrate plasma",
    turnaroundTime: "Same day",
    notes: "Cross-linked fibrin degradation product.",
    borderColor: "#89CFF0"
  },
  {
    name: "PFA-200 Platelet Screen",
    tubeColor: "Light Blue",
    specimen: "Citrate whole blood",
    turnaroundTime: "Same day",
    notes: "Platelet function screen.",
    borderColor: "#89CFF0"
  },
  {
    name: "Drugs of Abuse / Overdose Screen",
    tubeColor: "Urine container + Gold + Gray",
    specimen: "Urine, serum, and fluoride plasma",
    turnaroundTime: "Same day to 1 day",
    notes: "Screen combines urine drugs-of-abuse testing with common overdose blood levels. Drugs of abuse testing is done on urine.",
    borderColor: "#64748b"
  },
  {
    name: "Drugs of Abuse Screen (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "Same day to 1 day",
    notes: "Multi-drug screening panel performed on urine.",
    borderColor: "#64748b"
  },
  {
    name: "Amphetamine (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug screen analyte.",
    borderColor: "#64748b"
  },
  {
    name: "Barbiturate (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug screen analyte.",
    borderColor: "#64748b"
  },
  {
    name: "Benzodiazepine (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug screen analyte.",
    borderColor: "#64748b"
  },
  {
    name: "Cannabis (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug screen analyte.",
    borderColor: "#64748b"
  },
  {
    name: "Cocaine (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug screen analyte.",
    borderColor: "#64748b"
  },
  {
    name: "Ethanol (Blood)",
    tubeColor: "Grey",
    specimen: "Fluoride plasma",
    turnaroundTime: "Same day",
    notes: "Blood alcohol level.",
    borderColor: "gray"
  },
  {
    name: "Mandrax (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug screen analyte.",
    borderColor: "#64748b"
  },
  {
    name: "Methcathinone CAT (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug screen analyte.",
    borderColor: "#64748b"
  },
  {
    name: "Opiates (Urine)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug screen analyte.",
    borderColor: "#64748b"
  },
  {
    name: "Paracetamol (Blood)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day",
    notes: "Therapeutic/toxicology level.",
    borderColor: "yellow"
  },
  {
    name: "Salicylate (Blood)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day",
    notes: "Therapeutic/toxicology level.",
    borderColor: "yellow"
  },
  {
    name: "Carbamazepine (Tegretol)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug monitoring level.",
    borderColor: "yellow"
  },
  {
    name: "Digoxin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug monitoring level.",
    borderColor: "yellow"
  },
  {
    name: "Levetiracetam (Keppra)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug monitoring level.",
    borderColor: "yellow"
  },
  {
    name: "Lithium",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day",
    notes: "Drug monitoring level.",
    borderColor: "yellow"
  },
  {
    name: "Phenobarbitone",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug monitoring level.",
    borderColor: "yellow"
  },
  {
    name: "Phenytoin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug monitoring level.",
    borderColor: "yellow"
  },
  {
    name: "Sodium Valproate",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug monitoring level.",
    borderColor: "yellow"
  },
  {
    name: "Theophylline",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Drug monitoring level.",
    borderColor: "yellow"
  },
  {
    name: "Trough Amikacin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Aminoglycoside therapeutic level (trough).",
    borderColor: "yellow"
  },
  {
    name: "Trough Gentamycin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Aminoglycoside therapeutic level (trough).",
    borderColor: "yellow"
  },
  {
    name: "Trough Tobramycin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Aminoglycoside therapeutic level (trough).",
    borderColor: "yellow"
  },
  {
    name: "Trough Vancomycin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Vancomycin therapeutic level (trough).",
    borderColor: "yellow"
  },
  {
    name: "Peak Amikacin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Aminoglycoside therapeutic level (peak).",
    borderColor: "yellow"
  },
  {
    name: "Peak Gentamycin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Aminoglycoside therapeutic level (peak).",
    borderColor: "yellow"
  },
  {
    name: "Peak Tobramycin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Aminoglycoside therapeutic level (peak).",
    borderColor: "yellow"
  },
  {
    name: "Peak Vancomycin",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "Same day to 1 day",
    notes: "Vancomycin therapeutic level (peak).",
    borderColor: "yellow"
  },
  {
    name: "Arthritis Profile",
    tubeColor: "Gold + Purple",
    specimen: "Serum and EDTA blood",
    turnaroundTime: "1-3 days",
    notes: "Profile includes ESR, CRP, uric acid, rheumatoid factor, and anti-CCP.",
    borderColor: "yellow"
  },
  {
    name: "Autoimmune Profile",
    tubeColor: "Gold + Purple",
    specimen: "Serum and EDTA blood",
    turnaroundTime: "1-3 days",
    notes: "Profile includes ESR, FBC, CRP, rheumatoid factor, anti-CCP/ACCP, and ANA screen.",
    borderColor: "yellow"
  },
  {
    name: "RF-IgM and Anti-CCP",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Rheumatoid serology panel.",
    borderColor: "yellow"
  },
  {
    name: "ANA Screen and Reflex ENA Antibodies",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Autoimmune connective tissue serology.",
    borderColor: "yellow"
  },
  {
    name: "ENA and dsDNA Panel",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "ENA subset and dsDNA markers.",
    borderColor: "yellow"
  },
  {
    name: "dsDNA (Quantitative)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Quantitative dsDNA antibody test.",
    borderColor: "yellow"
  },
  {
    name: "ANCA Profile",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Autoimmune vasculitis and GBM screen.",
    borderColor: "yellow"
  },
  {
    name: "Antiphospholipid Antibodies (Anti-b2GP and ACL)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Antiphospholipid antibody panel.",
    borderColor: "yellow"
  },
  {
    name: "Gastric Antibodies (IF and Parietal Cell)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Autoimmune gastritis/pernicious anemia serology.",
    borderColor: "yellow"
  },
  {
    name: "Autoimmune Liver Profile",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Autoimmune liver disease serology profile.",
    borderColor: "yellow"
  },
  {
    name: "Anti-Smooth Muscle Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "2-7 days",
    notes: "Autoimmune hepatitis serology marker. Serum gel tube is standard; red-top serum is also acceptable.",
    borderColor: "yellow"
  },
  {
    name: "Anti-LKM1 Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "2-7 days",
    notes: "Autoimmune hepatitis type 2 serology marker. Serum gel tube is standard; red-top serum is also acceptable.",
    borderColor: "yellow"
  },
  {
    name: "Anti-SLA/LP Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "2-7 days",
    notes: "Soluble liver antigen / liver-pancreas autoimmune hepatitis serology marker. Serum gel tube is standard; red-top serum is also acceptable.",
    borderColor: "yellow"
  },
  {
    name: "Systemic Sclerosis Profile",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Scleroderma antibody profile.",
    borderColor: "yellow"
  },
  {
    name: "Autoimmune Myositis Profile",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Myositis antibody profile.",
    borderColor: "yellow"
  },
  {
    name: "Interleukin 6",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Cytokine marker.",
    borderColor: "yellow"
  },
  {
    name: "Autoimmune Bullous Dermatoses",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Pemphigus/pemphigoid antibody workup.",
    borderColor: "yellow"
  },
  {
    name: "SARS-CoV-2 IgG (N-antibody)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "COVID-19 nucleocapsid IgG serology.",
    borderColor: "yellow"
  },
  {
    name: "SARS-CoV-2 IgG (S-antibody post vaccine)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "COVID-19 spike IgG serology.",
    borderColor: "yellow"
  },
  {
    name: "ASOT",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Antistreptolysin O titre serology for recent streptococcal infection.",
    borderColor: "yellow"
  },
  {
    name: "Anti-DNase B",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Anti-DNase B serology for recent streptococcal infection.",
    borderColor: "yellow"
  },
  {
    name: "EBV IgM",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Epstein-Barr virus serology.",
    borderColor: "yellow"
  },
  {
    name: "EBV IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Epstein-Barr virus serology.",
    borderColor: "yellow"
  },
  {
    name: "EBV PCR (Viral Load)",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "1-3 days",
    notes: "Molecular EBV quantification.",
    borderColor: "purple"
  },
  {
    name: "B-D-Glucan",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Invasive fungal infection marker.",
    borderColor: "yellow"
  },
  {
    name: "Bilharzia Antibody",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Schistosoma serology.",
    borderColor: "yellow"
  },
  {
    name: "Bilharzia Urine-CCA (Ag)",
    tubeColor: "Urine container",
    specimen: "Urine",
    turnaroundTime: "1-3 days",
    notes: "Urine schistosoma antigen test.",
    borderColor: "#64748b"
  },
  {
    name: "Brucella IgM",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Brucella IgM serology.",
    borderColor: "yellow"
  },
  {
    name: "Brucella IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Brucella IgG serology.",
    borderColor: "yellow"
  },
  {
    name: "Brucella PCR",
    tubeColor: "N/A (Specimen-specific)",
    specimen: "Specimen per request",
    turnaroundTime: "1-3 days",
    notes: "Molecular brucella test.",
    borderColor: "#64748b"
  },
  {
    name: "Herpes Simplex I IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "HSV-1 serology.",
    borderColor: "yellow"
  },
  {
    name: "Herpes Simplex II IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "HSV-2 serology.",
    borderColor: "yellow"
  },
  {
    name: "Herpes Simplex (I, II) IgM",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "HSV IgM serology.",
    borderColor: "yellow"
  },
  {
    name: "HSV-1/HSV-2/VZV PCR",
    tubeColor: "N/A (Swab/CSF/vesicle fluid)",
    specimen: "Swab, CSF, or vesicle fluid",
    turnaroundTime: "1-3 days",
    notes: "Molecular herpes/varicella panel.",
    borderColor: "#64748b"
  },
  {
    name: "Measles IgM/IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Measles serology.",
    borderColor: "yellow"
  },
  {
    name: "Measles PCR",
    tubeColor: "N/A (Specimen-specific)",
    specimen: "Specimen per request",
    turnaroundTime: "1-3 days",
    notes: "Molecular measles test.",
    borderColor: "#64748b"
  },
  {
    name: "Mumps IgM/IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Mumps serology.",
    borderColor: "yellow"
  },
  {
    name: "Mumps PCR",
    tubeColor: "N/A (Specimen-specific)",
    specimen: "Specimen per request",
    turnaroundTime: "1-3 days",
    notes: "Molecular mumps test.",
    borderColor: "#64748b"
  },
  {
    name: "Parvovirus B19 IgM/IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Parvovirus serology.",
    borderColor: "yellow"
  },
  {
    name: "Parvovirus B19 PCR",
    tubeColor: "N/A (Specimen-specific)",
    specimen: "Specimen per request",
    turnaroundTime: "1-3 days",
    notes: "Molecular parvovirus test.",
    borderColor: "#64748b"
  },
  {
    name: "Rickettsia IgM",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Rickettsia IgM serology.",
    borderColor: "yellow"
  },
  {
    name: "Rickettsia IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Rickettsia IgG serology.",
    borderColor: "yellow"
  },
  {
    name: "CMV IgM/IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Cytomegalovirus serology.",
    borderColor: "yellow"
  },
  {
    name: "CMV IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Cytomegalovirus IgG serology.",
    borderColor: "yellow"
  },
  {
    name: "CMV IgM",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Cytomegalovirus IgM serology.",
    borderColor: "yellow"
  },
  {
    name: "CMV PCR (Viral Load)",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "1-3 days",
    notes: "Molecular CMV quantification.",
    borderColor: "purple"
  },
  {
    name: "CMV PCR Qualitative",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "1-3 days",
    notes: "Qualitative CMV PCR.",
    borderColor: "purple"
  },
  {
    name: "Rubella IgM",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Rubella IgM serology.",
    borderColor: "yellow"
  },
  {
    name: "Rubella IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Rubella IgG immunity serology.",
    borderColor: "yellow"
  },
  {
    name: "Syphilis (Automated Antibody Screening)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-2 days",
    notes: "Positive results reflex to RPR.",
    borderColor: "yellow"
  },
  {
    name: "Toxoplasma IgM",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Toxoplasma IgM serology.",
    borderColor: "yellow"
  },
  {
    name: "Toxoplasma IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Toxoplasma IgG serology.",
    borderColor: "yellow"
  },
  {
    name: "Toxoplasma gondii PCR",
    tubeColor: "N/A (Specimen-specific)",
    specimen: "Specimen per request",
    turnaroundTime: "1-3 days",
    notes: "Molecular toxoplasma test.",
    borderColor: "#64748b"
  },
  {
    name: "Varicella IgM/IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Varicella-zoster serology.",
    borderColor: "yellow"
  },
  {
    name: "Widal",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Typhoid serology test.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis A and B Status (Acute)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Acute viral hepatitis profile.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis B Status (Chronic)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Chronic hepatitis B profile.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis B (Acute)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Acute hepatitis B profile.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis B PCR (Viral Load)",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "1-3 days",
    notes: "HBV molecular quantification.",
    borderColor: "purple"
  },
  {
    name: "Hepatitis A IgG (Immunity)",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Hepatitis A immunity marker.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis C PCR (Viral Load)",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "1-3 days",
    notes: "HCV molecular quantification.",
    borderColor: "purple"
  },
  {
    name: "Hepatitis C Viral Load and Genotype",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "2-7 days",
    notes: "HCV quantification with genotype.",
    borderColor: "purple"
  },
  {
    name: "Hepatitis E IgM",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Hepatitis E acute infection marker.",
    borderColor: "yellow"
  },
  {
    name: "Hepatitis E IgG",
    tubeColor: "Gold",
    specimen: "Serum",
    turnaroundTime: "1-3 days",
    notes: "Hepatitis E exposure/immunity marker.",
    borderColor: "yellow"
  },
  {
    name: "CD4 Count",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "1 day",
    notes: "HIV immune monitoring marker.",
    borderColor: "purple"
  },
  {
    name: "CD4/CD8 Count",
    tubeColor: "Purple",
    specimen: "EDTA whole blood",
    turnaroundTime: "1 day",
    notes: "Lymphocyte subset profile.",
    borderColor: "purple"
  },
  {
    name: "HIV PCR Qualitative",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "1-3 days",
    notes: "Qualitative HIV PCR test.",
    borderColor: "purple"
  },
  {
    name: "HIV-1 Resistance Genotyping (incl. Integrase)",
    tubeColor: "Purple",
    specimen: "EDTA plasma",
    turnaroundTime: "3-10 days",
    notes: "HIV drug resistance genotyping.",
    borderColor: "purple"
  }
];
