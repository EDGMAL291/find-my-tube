const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const testCataloguePath = path.join(root, "assets/data/data.js");
const dictionaryPath = path.join(root, "assets/data/find-my-test-dictionary.json");
const outputJsonPath = path.join(root, "assets/data/find-my-test-clinical-dataset.json");
const outputSummaryPath = path.join(root, "docs/find-my-test-clinical-dataset-summary.md");

const DEFAULT_DISCLAIMER = "Reference-only laboratory support. This does not diagnose or exclude disease. Interpret with clinical findings, patient context, and local protocols.";
const DEFAULT_LOCAL_PROTOCOL_NOTE = "Confirm specimen, tube, timing, transport, and repeat-testing requirements with local laboratory protocol.";

const sourceLibrary = {
  NICE_ACS: {
    name: "NICE acute chest pain / ACS guidance",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK63786/bin/nicecg95fm-fs2.pdf"
  },
  NICE_SEPSIS: {
    name: "NICE suspected sepsis guidance",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK553314/"
  },
  NICE_CKD: {
    name: "NICE chronic kidney disease eGFR and ACR quality standard",
    url: "https://www.nice.org.uk/guidance/qs5/chapter/Quality-statement-1-Identification-and-monitoring"
  },
  NICE_ANTENATAL: {
    name: "NICE/NHS antenatal screening and booking bloods",
    url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/screening-for-hepatitis-b-hiv-and-syphilis/"
  },
  CDC_MALARIA: {
    name: "CDC malaria evaluation and diagnosis",
    url: "https://www.cdc.gov/malaria/hcp/clinical-guidance/evaluation-diagnosis.html"
  },
  CDC_STI: {
    name: "CDC STI treatment guidelines and NAAT specimen guidance",
    url: "https://www.cdc.gov/std/treatment-guidelines/chlamydia.htm"
  },
  NICE_VTE: {
    name: "NICE venous thromboembolic diseases guidance",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK556698/"
  },
  NICE_CANCER: {
    name: "NICE suspected cancer guidance",
    url: "https://www.nice.org.uk/guidance/ng12"
  },
  MERCK_PANELS: {
    name: "Merck Manual Professional commonly used laboratory panels",
    url: "https://www.merckmanuals.com/professional/multimedia/table/commonly-used-panels"
  },
  ARTHRITIS: {
    name: "Arthritis Foundation blood tests for inflammatory arthritis",
    url: "https://www.arthritis.org/health-wellness/about-arthritis/understanding-arthritis/blood%2C-fluid-and-tissue-tests-for-arthritis"
  },
  LTO_STYLE: {
    name: "Laboratory medicine references including Lab Tests Online-style test interpretation",
    url: "https://labtestsonline.org.uk/"
  }
};

const categorySourceKeys = [
  ["Cardiac", ["NICE_ACS", "NICE_VTE", "MERCK_PANELS"]],
  ["Emergency", ["NICE_SEPSIS", "NICE_ACS", "NICE_VTE"]],
  ["Infection", ["NICE_SEPSIS", "CDC_STI", "CDC_MALARIA"]],
  ["Renal", ["NICE_CKD", "MERCK_PANELS"]],
  ["Antenatal", ["NICE_ANTENATAL"]],
  ["Pregnancy", ["NICE_ANTENATAL"]],
  ["Autoimmune", ["ARTHRITIS", "LTO_STYLE"]],
  ["Rheumatology", ["ARTHRITIS", "LTO_STYLE"]],
  ["Oncology", ["NICE_CANCER", "LTO_STYLE"]],
  ["Coagulation", ["NICE_VTE", "LTO_STYLE"]],
  ["Liver", ["MERCK_PANELS", "LTO_STYLE"]],
  ["GIT", ["MERCK_PANELS", "LTO_STYLE"]],
  ["Endocrine", ["MERCK_PANELS", "LTO_STYLE"]],
  ["Metabolic", ["MERCK_PANELS", "LTO_STYLE"]],
  ["Paediatric", ["NICE_SEPSIS", "NICE_CANCER"]],
  ["Haematology", ["NICE_CANCER", "LTO_STYLE"]]
];

function loadTests() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${fs.readFileSync(testCataloguePath, "utf8")}; this.tests = tests;`, sandbox);
  return sandbox.tests;
}

const tests = loadTests();
const testByName = new Map(tests.map((test) => [test.name.toLowerCase(), test]));

const testAliases = new Map(Object.entries({
  "blood gas (abg)": "Blood Gases",
  "blood gas": "Blood Gases",
  "d-dimer": "XDP (D-Dimer)",
  "group and save": "Blood Bank / Transfusion",
  "crossmatch": "Blood Bank / Transfusion",
  "beta-hcg": "BHCG (Beta-HCG)",
  "glucose": "Random Glucose",
  "tsh": "TSH",
  "free t4": "Free T4",
  "free t3": "Free T3",
  "ana": "ANA Screen and Reflex ENA Antibodies",
  "ana screen": "ANA Screen and Reflex ENA Antibodies",
  "blood film": "Peripheral Blood Smear / Blood Film",
  "urine mc&s": "Urine MCS",
  "acute viral hepatitis profile": "Hepatitis B (Acute)",
  "total serum bilirubin (tsb)": "Total Serum Bilirubin (TSB)",
  "cortisol": "Cortisol",
  "pcr respiratory panel": "Respiratory PCR Panel",
  "std pcr": "STD PCR",
  "protein electrophoresis": "Protein Electrophoresis with Immunofixation",
  "spep": "Protein Electrophoresis with Immunofixation",
  "bence-jones protein": "Bence-Jones Protein (Urine)",
  "malaria smear": "Malaria Smear (Thick and Thin)",
  "malaria screen": "Malaria Profile",
  "h. pylori antigen": "H. pylori Stool Antigen",
  "conjugated bilirubin (direct)": "Bilirubin Total and Conjugated",
  "pth": "Parathyroid Hormone (PTH)",
  "ige": "IgE Total",
  "folate": "Folate (Serum)",
  "reticulocyte count": "Reticulocytes",
  "faecal occult blood": "Faecal Occult Blood",
  "fecal occult blood": "Faecal Occult Blood",
  "faecal calprotectin": "Calprotectin (Fecal)"
}));

const manualTests = {
  "Urine Dipstick / Urinalysis": {
    name: "Urine Dipstick / Urinalysis",
    tubeColor: "Urine Container",
    specimen: "Fresh urine",
    notes: "Use clean urine container. Confirm microscopy/culture reflex rules locally."
  },
  "Pregnancy Test (Urine or Serum beta-hCG)": {
    name: "Pregnancy Test (Urine or Serum beta-hCG)",
    tubeColor: "Urine Container or Gold",
    specimen: "Urine or serum",
    notes: "Choose specimen according to clinical setting and local protocol."
  },
  "Stool MCS / PCR as indicated": {
    name: "Stool MCS / PCR as indicated",
    tubeColor: "Stool Container",
    specimen: "Stool",
    notes: "Request culture, PCR, ova/parasites, or C. difficile only when clinically indicated."
  },
  "Wound / Site Swab MCS": {
    name: "Wound / Site Swab MCS",
    tubeColor: "Swab Transport Medium",
    specimen: "Site-specific swab",
    notes: "Collect from appropriate site before antibiotics where possible."
  },
  "Sputum MCS / TB testing as indicated": {
    name: "Sputum MCS / TB testing as indicated",
    tubeColor: "Sterile Sputum Container",
    specimen: "Sputum",
    notes: "Confirm sputum, GeneXpert, microscopy, and culture requirements locally."
  },
  "Lead": {
    name: "Lead",
    tubeColor: "Tan or certified trace-element tube",
    specimen: "Whole blood",
    notes: "Use a lead/trace-element-certified tube; confirm collection and contamination precautions locally."
  },
  "Trace Elements / Heavy Metals": {
    name: "Trace Elements / Heavy Metals",
    tubeColor: "Tan or special trace-element tube",
    specimen: "Blood or urine depending on analyte",
    notes: "Specimen type and tube vary by analyte. Confirm with local laboratory protocol before collection."
  }
};

const reasonByTest = {
  "FBC": "Screens for anaemia, infection pattern, platelet abnormalities, and baseline haematology.",
  "CRP": "May assist with assessment of inflammation or infection in the correct clinical context.",
  "U&E": "Assesses electrolytes and renal function supportively.",
  "Creatinine": "Assesses renal function and supports eGFR-based interpretation.",
  "Random Glucose": "Assists with assessment of acute hypo- or hyperglycaemia.",
  "Fasting Glucose": "Supports glycaemic assessment when fasting testing is required.",
  "HbA1c": "Supports diabetes screening or longer-term glycaemic monitoring.",
  "Lactate": "Assists with assessment of tissue hypoperfusion or severe illness; interpret urgently.",
  "Blood Culture": "Supports microbiological assessment before antibiotics where feasible.",
  "Troponin I": "Assists in assessment of myocardial injury in the correct clinical context.",
  "Cardiac Profile": "Supports cardiac marker assessment according to local pathway.",
  "NT-proBNP": "Supports assessment of possible heart failure in clinical context.",
  "XDP (D-Dimer)": "May assist in VTE rule-out only when used with an approved pretest-probability pathway.",
  "Coagulation Studies": "Screens PT/aPTT/INR pattern for bleeding, liver disease, anticoagulant, or DIC concerns.",
  "INR": "Assesses PT-derived anticoagulation or synthetic liver/coagulation status.",
  "Liver Function Tests (LFT)": "Assesses hepatocellular, cholestatic, bilirubin, and albumin patterns supportively.",
  "Lipase": "Supports assessment of suspected pancreatitis in clinical context.",
  "Amylase": "May support pancreatic or salivary enzyme assessment; lipase is usually more specific for pancreatitis.",
  "Fe Studies": "Supports assessment of iron deficiency or iron overload patterns.",
  "Ferritin": "Supports assessment of iron stores; interpret with inflammation.",
  "Vitamin B12": "Supports evaluation of macrocytosis, neuropathy, or deficiency concern.",
  "Folate": "Supports evaluation of macrocytosis or deficiency concern.",
  "TSH": "First-line thyroid axis assessment in many settings.",
  "Free T4": "Supports thyroid function interpretation, especially when TSH is abnormal or pituitary disease is considered.",
  "Free T3": "May assist when thyrotoxicosis is suspected and local protocol supports testing.",
  "Thyroid Function Test (TFT)": "Core thyroid function screen; commonly includes TSH and free T4.",
  "Urine MCS": "Supports assessment of urinary tract infection with microscopy, culture, and susceptibility where indicated.",
  "Blood Bank / Transfusion": "Supports group-and-screen/crossmatch or transfusion workflow according to blood bank protocol.",
  "Blood Group & Rh": "Supports antenatal, transfusion, or Rh-related assessment.",
  "Antenatal Screen (ANTINV)": "Common booking profile for pregnancy-related screening and baseline tests.",
  "HIV ELISA": "Supports HIV screening after counselling and consent according to local policy.",
  "RPR (Syphilis Screen)": "Supports syphilis screening in STI or antenatal contexts.",
  "Hepatitis B Surface Antigen (HBsAg)": "Supports hepatitis B infection screening.",
  "Hepatitis C Antibody": "Supports hepatitis C exposure/infection screening pathway.",
  "Malaria Profile": "Supports urgent malaria assessment where travel/exposure and symptoms fit.",
  "Malaria Smear (Thick and Thin)": "Supports microscopic malaria assessment and parasite quantification/speciation.",
  "STD PCR": "Supports molecular STI assessment from correct urine or swab specimen.",
  "CSF Profile": "Supports meningitis/CNS infection evaluation when lumbar puncture is clinically appropriate.",
  "Celiac Screen": "Supports assessment of coeliac disease in compatible presentations.",
  "ANA Screen and Reflex ENA Antibodies": "Supports screening for systemic autoimmune/connective tissue disease when clinically indicated.",
  "Rheumatoid Factor (RF)": "Supports inflammatory arthritis assessment; not diagnostic alone.",
  "Anti-CCP Antibody": "Supports rheumatoid arthritis assessment in compatible clinical presentations.",
  "ESR": "Non-specific inflammation marker; may support infection, autoimmune, or malignancy workups.",
  "Protein Electrophoresis with Immunofixation": "Supports assessment for monoclonal protein when myeloma or paraproteinaemia is suspected.",
  "Bence-Jones Protein (Urine)": "Supports assessment for urinary light chains in suspected plasma-cell disorder.",
  "PSA": "Supports prostate assessment after counselling and shared decision-making."
};

const priorityByTest = {
  "Troponin I": "Urgent",
  "Cardiac Profile": "Urgent",
  "Blood Culture": "Urgent",
  "Lactate": "Urgent",
  "Blood Gases": "Urgent",
  "XDP (D-Dimer)": "Urgent depending on pathway",
  "Blood Bank / Transfusion": "Urgent if bleeding or transfusion needed",
  "CSF Profile": "Urgent",
  "Malaria Profile": "Urgent",
  "Malaria Smear (Thick and Thin)": "Urgent",
  "Coagulation Studies": "Routine/Urgent depending on presentation",
  "INR": "Routine/Urgent depending on presentation"
};

const priorityByCategory = [
  ["Emergency", "Urgent"],
  ["Cardiac", "Urgent"],
  ["Sepsis", "Urgent"],
  ["Infection", "Routine/Urgent depending on presentation"],
  ["Antenatal", "Routine/Urgent depending on presentation"],
  ["Pregnancy", "Routine/Urgent depending on presentation"],
  ["Chronic", "Routine"],
  ["Monitoring", "Routine"]
];

const supplementalRecords = [
  ["Severe chest pain with sweating", "Cardiac / Emergency", ["diaphoresis", "sweaty chest pain", "crushing chest pain"], ["Troponin I", "FBC", "U&E", "Random Glucose"]],
  ["Chest pain with shortness of breath", "Cardiac / Emergency", ["SOB with chest pain", "dyspnoea and chest pain", "dyspnea and chest pain"], ["Troponin I", "XDP (D-Dimer)", "FBC", "U&E"]],
  ["Palpitations with weight loss", "Endocrine / Cardiac", ["racing heart", "tachycardia and weight loss", "thyrotoxicosis symptoms"], ["Thyroid Function Test (TFT)", "U&E", "Magnesium"]],
  ["Syncope with palpitations", "Cardiac / Emergency", ["fainting", "collapse", "blackout"], ["Random Glucose", "U&E", "Cardiac Profile", "FBC"]],
  ["Possible pulmonary embolism", "Cardiac / Coagulation / Emergency", ["PE", "suspected PE", "pleuritic chest pain", "unexplained hypoxia"], ["XDP (D-Dimer)", "FBC", "U&E", "Coagulation Studies"]],
  ["Possible deep vein thrombosis", "Coagulation / Emergency", ["DVT", "calf swelling", "unilateral leg swelling"], ["XDP (D-Dimer)", "FBC", "Coagulation Studies"]],
  ["Severe sepsis concern", "Infection / Emergency", ["septic shock", "hypotension with infection", "sepsis red flag"], ["Blood Culture", "Lactate", "FBC", "CRP", "U&E", "Coagulation Studies"]],
  ["Fever in infant", "Paediatric / Infection", ["baby fever", "infant fever", "febrile infant"], ["FBC", "CRP", "Blood Culture", "Urine MCS"]],
  ["Fever in neutropenia", "Haematology / Infection / Emergency", ["neutropenic sepsis", "chemo fever", "low neutrophils fever"], ["FBC", "Blood Culture", "CRP", "U&E", "Lactate"]],
  ["Fever after travel", "Infection / Emergency", ["travel fever", "malaria risk", "returned traveller fever"], ["Malaria Profile", "Malaria Smear (Thick and Thin)", "FBC", "CRP", "Blood Culture", "Liver Function Tests (LFT)"]],
  ["Suspected malaria", "Infection / Emergency", ["malaria", "plasmodium", "fever chills travel"], ["Malaria Profile", "Malaria Smear (Thick and Thin)", "FBC", "Liver Function Tests (LFT)", "U&E"]],
  ["Suspected meningitis", "Infection / Emergency", ["neck stiffness fever", "meningism", "photophobia fever"], ["Blood Culture", "FBC", "CRP", "CSF Profile"]],
  ["Suspected pneumonia", "Infection / Respiratory", ["LRTI", "lower respiratory tract infection", "productive cough fever"], ["FBC", "CRP", "Blood Culture", "Sputum MCS / TB testing as indicated"]],
  ["Suspected tuberculosis", "Infection / Respiratory", ["TB", "night sweats cough", "pulmonary TB"], ["FBC", "CRP", "ESR", "HIV ELISA", "Sputum MCS / TB testing as indicated"]],
  ["Chronic cough", "Respiratory / Infection", ["persistent cough", "cough more than 2 weeks", "TB symptoms"], ["FBC", "CRP", "ESR", "Sputum MCS / TB testing as indicated"]],
  ["Haemoptysis", "Respiratory / Emergency", ["hemoptysis", "coughing blood", "blood in sputum"], ["FBC", "Coagulation Studies", "CRP", "Sputum MCS / TB testing as indicated"]],
  ["Urinary tract infection symptoms", "Renal / Infection", ["UTI", "cystitis", "dysuria frequency"], ["Urine MCS", "CRP", "FBC"]],
  ["Pyelonephritis concern", "Renal / Infection", ["loin pain fever", "kidney infection", "CVA tenderness"], ["Urine MCS", "FBC", "CRP", "U&E", "Blood Culture"]],
  ["Acute kidney injury concern", "Renal / Emergency", ["AKI", "acute renal failure", "rising creatinine"], ["U&E", "Creatinine", "Potassium", "Urine Dipstick / Urinalysis"]],
  ["Chronic kidney disease monitoring", "Renal / Chronic disease monitoring", ["CKD", "chronic renal disease", "eGFR monitoring"], ["U&E", "Creatinine", "Albumin:Creatinine Ratio (Random Urine)", "Calcium", "Phosphate", "Parathyroid Hormone (PTH)", "FBC"]],
  ["Proteinuria", "Renal", ["albuminuria", "frothy urine", "urine protein"], ["Albumin:Creatinine Ratio (Random Urine)", "Protein:Creatinine Ratio (Random Urine)", "U&E"]],
  ["Haematuria", "Renal / Urology", ["hematuria", "blood in urine", "red urine"], ["Urine MCS", "Urine Dipstick / Urinalysis", "U&E", "FBC"]],
  ["Diabetes screening", "Endocrine / Metabolic", ["high sugar", "prediabetes", "diabetes mellitus"], ["HbA1c", "Fasting Glucose", "Random Glucose"]],
  ["Poor diabetes control", "Endocrine / Chronic disease monitoring", ["high HbA1c", "uncontrolled diabetes", "glycaemic control"], ["HbA1c", "U&E", "Albumin:Creatinine Ratio (Random Urine)", "Lipid Profile / Lipogram"]],
  ["Diabetic ketoacidosis concern", "Endocrine / Emergency", ["DKA", "ketones", "Kussmaul breathing"], ["Blood Gases", "Random Glucose", "U&E", "Potassium", "Lactate"]],
  ["Hypoglycaemia", "Endocrine / Emergency", ["hypoglycemia", "low sugar", "sweating and confusion"], ["Random Glucose", "U&E", "FBC"]],
  ["Thyrotoxicosis symptoms", "Endocrine", ["hyperthyroid", "overactive thyroid", "heat intolerance"], ["TSH", "Free T4", "Free T3"]],
  ["Hypothyroid symptoms", "Endocrine", ["underactive thyroid", "cold intolerance", "weight gain fatigue"], ["TSH", "Free T4", "FBC", "Lipid Profile / Lipogram"]],
  ["Goitre", "Endocrine", ["goiter", "thyroid enlargement", "neck swelling thyroid"], ["Thyroid Function Test (TFT)", "Thyroid Antibodies (TPO and Tg Ab)"]],
  ["Adrenal insufficiency concern", "Endocrine / Emergency", ["Addison", "low cortisol", "hyperpigmentation hypotension"], ["Cortisol", "U&E", "Random Glucose"]],
  ["Cushing syndrome concern", "Endocrine", ["cushingoid", "steroid excess", "easy bruising weight gain"], ["Cortisol", "HbA1c", "U&E", "Lipid Profile / Lipogram"]],
  ["Hypercalcaemia", "Chemistry / Emergency", ["hypercalcemia", "high calcium", "stones bones groans"], ["Calcium", "Albumin", "Phosphate", "Parathyroid Hormone (PTH)", "U&E"]],
  ["Hypocalcaemia", "Chemistry / Emergency", ["hypocalcemia", "tetany", "low calcium"], ["Calcium", "Magnesium", "Phosphate", "Vitamin D (25OH)", "Parathyroid Hormone (PTH)"]],
  ["Hyponatraemia", "Chemistry / Emergency", ["hyponatremia", "low sodium", "confusion low sodium"], ["Sodium", "U&E", "Random Glucose", "Cortisol", "TSH"]],
  ["Hyperkalaemia", "Chemistry / Emergency", ["hyperkalemia", "high potassium", "renal potassium"], ["Potassium", "U&E", "Creatinine"]],
  ["Anaemia screen", "Haematology", ["anemia", "low haemoglobin", "low hemoglobin", "pallor"], ["FBC", "Ferritin", "Fe Studies", "Vitamin B12", "Folate"]],
  ["Iron deficiency anaemia", "Haematology", ["iron deficiency anemia", "IDA", "microcytic anaemia"], ["FBC", "Ferritin", "Fe Studies"]],
  ["Macrocytosis", "Haematology", ["high MCV", "macrocytic anaemia", "macrocytic anemia"], ["FBC", "Vitamin B12", "Folate", "Liver Function Tests (LFT)", "TSH"]],
  ["Thrombocytopenia", "Haematology / Coagulation", ["low platelets", "platelet count low", "purpura"], ["FBC", "Peripheral Blood Smear / Blood Film", "Coagulation Studies", "Liver Function Tests (LFT)"]],
  ["Easy bruising", "Haematology / Coagulation", ["bruises easily", "ecchymoses", "purpura"], ["FBC", "Coagulation Studies", "INR", "Fibrinogen"]],
  ["Heavy menstrual bleeding", "Gynaecology / Haematology", ["menorrhagia", "flooding periods", "HMB"], ["FBC", "Ferritin", "TSH", "Coagulation Studies"]],
  ["Warfarin monitoring", "Coagulation / Chronic disease monitoring", ["INR monitoring", "anticoagulation monitoring", "warfarin check"], ["INR"]],
  ["Heparin monitoring concern", "Coagulation", ["aPTT monitoring", "unfractionated heparin", "PTT"], ["Partial Thromboplastin Time (PTT)", "FBC"]],
  ["DIC concern", "Coagulation / Emergency", ["disseminated intravascular coagulation", "consumptive coagulopathy", "DIC"], ["DIC Screen", "FBC", "Fibrinogen", "XDP (D-Dimer)", "Coagulation Studies"]],
  ["Jaundice", "Liver / GIT", ["icterus", "yellow eyes", "yellow skin"], ["Liver Function Tests (LFT)", "Total Serum Bilirubin (TSB)", "Conjugated Bilirubin (Direct)", "FBC", "INR"]],
  ["Acute hepatitis concern", "Liver / Infection", ["viral hepatitis", "hepatitis symptoms", "transaminitis"], ["Liver Function Tests (LFT)", "Hepatitis A IgM", "Hepatitis B (Acute)", "Hepatitis C Antibody", "INR"]],
  ["Alcohol-related liver concern", "Liver / Chronic disease monitoring", ["alcohol liver disease", "deranged LFT", "cirrhosis screen"], ["Liver Function Tests (LFT)", "FBC", "INR", "U&E"]],
  ["Ascites", "Liver / GIT", ["abdominal fluid", "decompensated liver disease", "fluid abdomen"], ["Liver Function Tests (LFT)", "U&E", "INR", "FBC", "Fluid MCS"]],
  ["Upper gastrointestinal bleed", "GIT / Emergency", ["haematemesis", "hematemesis", "coffee ground vomit"], ["FBC", "U&E", "INR", "Blood Bank / Transfusion"]],
  ["Melaena", "GIT / Emergency", ["melena", "black stool", "tarry stool"], ["FBC", "U&E", "INR", "Blood Bank / Transfusion"]],
  ["Chronic diarrhoea", "GIT", ["chronic diarrhea", "loose stool persistent", "malabsorption"], ["FBC", "CRP", "U&E", "Celiac Screen", "Stool MCS / PCR as indicated", "Calprotectin (Fecal)"]],
  ["Inflammatory bowel disease concern", "GIT / Autoimmune", ["IBD", "Crohn", "ulcerative colitis", "bloody diarrhoea"], ["FBC", "CRP", "ESR", "Calprotectin (Fecal)", "Liver Function Tests (LFT)"]],
  ["Coeliac disease concern", "GIT / Autoimmune", ["celiac", "coeliac", "malabsorption"], ["Celiac Screen", "FBC", "Ferritin", "Vitamin B12", "Folate"]],
  ["Acute pancreatitis concern", "GIT / Emergency", ["pancreatitis", "epigastric pain radiating to back"], ["Lipase", "Amylase", "Liver Function Tests (LFT)", "FBC", "CRP", "U&E"]],
  ["Rheumatoid arthritis concern", "Autoimmune / Rheumatology", ["RA", "inflammatory arthritis", "morning stiffness"], ["CRP", "ESR", "Rheumatoid Factor (RF)", "Anti-CCP Antibody", "FBC"]],
  ["Systemic lupus concern", "Autoimmune / Rheumatology", ["SLE", "lupus", "malar rash", "photosensitivity"], ["ANA Screen and Reflex ENA Antibodies", "FBC", "U&E", "Urine Dipstick / Urinalysis", "CRP", "ESR"]],
  ["Vasculitis concern", "Autoimmune / Rheumatology", ["ANCA vasculitis", "purpura renal", "systemic vasculitis"], ["FBC", "CRP", "ESR", "U&E", "Urine Dipstick / Urinalysis", "ANA Screen and Reflex ENA Antibodies"]],
  ["Myositis concern", "Autoimmune / Rheumatology", ["muscle inflammation", "proximal weakness", "polymyositis"], ["CK Total", "CRP", "ESR", "ANA Screen and Reflex ENA Antibodies", "TSH"]],
  ["Polymyalgia rheumatica concern", "Autoimmune / Rheumatology", ["PMR", "shoulder stiffness", "hip girdle pain"], ["CRP", "ESR", "FBC", "U&E", "Liver Function Tests (LFT)"]],
  ["Giant cell arteritis concern", "Autoimmune / Emergency", ["temporal arteritis", "jaw claudication", "new headache older adult"], ["CRP", "ESR", "FBC"]],
  ["Pregnancy booking bloods", "Antenatal / Pregnancy", ["antenatal booking", "prenatal bloods", "first visit pregnancy"], ["Antenatal Screen (ANTINV)", "FBC", "Blood Group & Rh", "HIV ELISA", "RPR (Syphilis Screen)", "Hepatitis B Surface Antigen (HBsAg)"]],
  ["Early pregnancy bleeding", "Pregnancy / Emergency", ["threatened miscarriage", "miscarriage bleeding", "ectopic pregnancy concern"], ["BHCG (Beta-HCG)", "FBC", "Blood Group & Rh", "Blood Bank / Transfusion"]],
  ["Ectopic pregnancy concern", "Pregnancy / Emergency", ["ectopic", "pregnancy abdominal pain", "positive pregnancy pain"], ["BHCG (Beta-HCG)", "FBC", "Blood Group & Rh", "U&E"]],
  ["Pre-eclampsia concern", "Antenatal / Pregnancy / Emergency", ["preeclampsia", "hypertension pregnancy", "proteinuria pregnancy"], ["FBC", "U&E", "Creatinine", "Liver Function Tests (LFT)", "Uric Acid", "Protein:Creatinine Ratio (Random Urine)"]],
  ["Gestational diabetes screening", "Antenatal / Pregnancy / Endocrine", ["GDM", "pregnancy diabetes", "antenatal OGTT"], ["OGTT Pregnancy (fasting, 1hr, 2hr)"]],
  ["Reduced foetal movements concern", "Antenatal / Pregnancy", ["reduced fetal movements", "RFM", "baby not moving"], ["FBC", "Blood Group & Rh", "Urine Dipstick / Urinalysis"]],
  ["Postpartum haemorrhage", "Pregnancy / Emergency / Haematology", ["postpartum hemorrhage", "PPH", "bleeding after delivery"], ["FBC", "Coagulation Studies", "Fibrinogen", "Blood Bank / Transfusion"]],
  ["Neonatal jaundice", "Paediatric / Neonatal", ["newborn jaundice", "yellow baby", "neonate bilirubin"], ["Total Serum Bilirubin (TSB)", "Conjugated Bilirubin (Direct)", "FBC", "Blood Group & Rh"]],
  ["Neonatal sepsis concern", "Paediatric / Neonatal / Infection", ["newborn sepsis", "temperature instability newborn", "poor feeding neonate"], ["FBC", "CRP", "Blood Culture", "Lactate"]],
  ["Child with unexplained bruising", "Paediatric / Haematology", ["paediatric bruising", "pediatric bruising", "child purpura"], ["FBC", "Coagulation Studies", "Peripheral Blood Smear / Blood Film"]],
  ["Child with pallor and fatigue", "Paediatric / Haematology", ["child anaemia", "child anemia", "pale child"], ["FBC", "Ferritin", "Peripheral Blood Smear / Blood Film"]],
  ["Possible childhood leukaemia", "Paediatric / Oncology / Haematology", ["child leukemia", "child leukaemia", "bone pain bruising fever"], ["FBC", "Peripheral Blood Smear / Blood Film", "CRP", "U&E"]],
  ["Unintentional weight loss", "Oncology / General", ["weight loss", "cachexia", "loss of weight"], ["FBC", "CRP", "U&E", "Liver Function Tests (LFT)", "TSH", "HIV ELISA"]],
  ["Night sweats", "Infection / Oncology", ["drenching sweats", "B symptoms", "sweats at night"], ["FBC", "CRP", "ESR", "HIV ELISA", "Sputum MCS / TB testing as indicated"]],
  ["Lymphadenopathy", "Oncology / Infection", ["swollen glands", "enlarged lymph nodes", "lymph nodes"], ["FBC", "Peripheral Blood Smear / Blood Film", "CRP", "HIV ELISA"]],
  ["Suspected myeloma", "Oncology / Haematology", ["multiple myeloma", "paraprotein", "bone pain anaemia renal"], ["FBC", "U&E", "Calcium", "Protein Electrophoresis with Immunofixation", "Bence-Jones Protein (Urine)"]],
  ["Hypercalcaemia with malignancy concern", "Oncology / Chemistry", ["cancer high calcium", "malignancy hypercalcemia", "malignancy hypercalcaemia"], ["Calcium", "Albumin", "Phosphate", "U&E", "FBC"]],
  ["Colorectal cancer screening concern", "Oncology / GIT", ["bowel cancer concern", "change in bowel habit", "occult blood"], ["FBC", "Faecal Occult Blood", "Ferritin"]],
  ["Prostate symptoms", "Oncology / Urology", ["LUTS", "urinary hesitancy", "prostate cancer concern"], ["PSA", "U&E", "Urine MCS"]],
  ["Ovarian cancer concern", "Oncology / Gynaecology", ["abdominal bloating ovarian", "pelvic mass", "CA125"], ["CA 125", "FBC", "U&E", "Liver Function Tests (LFT)"]],
  ["STI screen", "Infection / Sexual health", ["STD", "sexual exposure", "chlamydia gonorrhoea"], ["STD PCR", "HIV ELISA", "RPR (Syphilis Screen)", "Hepatitis B Surface Antigen (HBsAg)", "Hepatitis C Antibody"]],
  ["Urethral discharge", "Infection / Sexual health", ["penile discharge", "gonorrhoea", "gonorrhea"], ["STD PCR", "Urine MCS", "HIV ELISA", "RPR (Syphilis Screen)"]],
  ["Vaginal discharge", "Infection / Sexual health", ["cervicitis", "vaginitis", "BV"], ["STD PCR", "Bacterial Vaginosis PCR", "HIV ELISA", "RPR (Syphilis Screen)"]],
  ["Genital ulcer", "Infection / Sexual health", ["herpes ulcer", "syphilis chancre", "genital sore"], ["Genital Ulcer PCR", "RPR (Syphilis Screen)", "HIV ELISA"]],
  ["Occupational needlestick exposure", "Infection / Occupational health", ["needle stick", "sharps injury", "blood exposure"], ["HIV ELISA", "Hepatitis B Surface Antigen (HBsAg)", "Hepatitis B Surface Antibody (HBsAb)", "Hepatitis C Antibody"]],
  ["Rash with fever", "Infection / General", ["febrile rash", "measles concern", "viral exanthem"], ["FBC", "CRP", "Blood Culture"]],
  ["Cellulitis", "Infection / Skin", ["skin infection", "erysipelas", "red hot leg"], ["FBC", "CRP", "Blood Culture", "Wound / Site Swab MCS"]],
  ["Wound infection", "Infection / Skin", ["infected wound", "pus wound", "surgical site infection"], ["FBC", "CRP", "Wound / Site Swab MCS"]],
  ["Rhabdomyolysis concern", "Chemistry / Emergency", ["rhabdo", "dark urine muscle pain", "high CK"], ["CK Total", "U&E", "Creatinine", "Potassium", "Calcium"]],
  ["Acute confusion", "Emergency / Neurology", ["delirium", "altered mental state", "AMS"], ["Random Glucose", "FBC", "CRP", "U&E", "Liver Function Tests (LFT)", "TSH"]],
  ["Seizure first episode", "Emergency / Neurology", ["new seizure", "fit", "convulsion"], ["Random Glucose", "U&E", "Calcium", "Magnesium", "FBC"]],
  ["Stroke-like symptoms", "Emergency / Neurology", ["TIA", "facial droop", "weakness speech"], ["Random Glucose", "FBC", "U&E", "INR", "HbA1c", "Lipid Profile / Lipogram"]],
  ["Headache with jaw claudication", "Autoimmune / Emergency", ["temporal headache", "GCA", "vision symptoms headache"], ["CRP", "ESR", "FBC"]],
  ["Medication toxicity baseline", "Chemistry / Monitoring", ["drug monitoring", "toxicity monitoring", "baseline labs"], ["FBC", "U&E", "Liver Function Tests (LFT)"]],
  ["Statin muscle symptoms", "Chemistry / Monitoring", ["statin myalgia", "muscle pain statin", "CK statin"], ["CK Total", "Liver Function Tests (LFT)", "U&E"]],
  ["Hypertension baseline", "Cardiac / Renal / Chronic disease monitoring", ["blood pressure workup", "BP baseline", "hypertension screening"], ["U&E", "Creatinine", "HbA1c", "Lipid Profile / Lipogram", "Urine Dipstick / Urinalysis"]],
  ["Dyslipidaemia monitoring", "Cardiac / Chronic disease monitoring", ["dyslipidemia", "cholesterol check", "lipogram"], ["Lipid Profile / Lipogram", "HbA1c", "Liver Function Tests (LFT)"]],
  ["HIV monitoring baseline", "Infection / Chronic disease monitoring", ["new HIV", "HIV baseline", "ART baseline"], ["HIV Viral Load", "FBC", "U&E", "Liver Function Tests (LFT)", "Hepatitis B Surface Antigen (HBsAg)", "Hepatitis C Antibody"]],
  ["Anaemia in pregnancy", "Antenatal / Haematology", ["anemia pregnancy", "low Hb antenatal", "haemoglobin pregnancy"], ["FBC", "Ferritin", "Fe Studies"]],
  ["Itching in pregnancy", "Antenatal / Liver", ["cholestasis pregnancy", "pruritus pregnancy", "obstetric cholestasis"], ["Liver Function Tests (LFT)", "Total Serum Bilirubin (TSB)"]],
  ["Postnatal fever", "Pregnancy / Infection", ["postpartum fever", "puerperal sepsis", "fever after birth"], ["FBC", "CRP", "Blood Culture", "Urine MCS"]],
  ["Failure to thrive", "Paediatric / General", ["poor growth", "weight faltering", "growth concern"], ["FBC", "U&E", "Liver Function Tests (LFT)", "TSH", "Celiac Screen", "Ferritin"]],
  ["Paediatric abdominal pain", "Paediatric / GIT", ["child abdominal pain", "tummy pain", "appendicitis concern"], ["FBC", "CRP", "U&E", "Urine MCS"]],
  ["Paediatric diarrhoea dehydration", "Paediatric / GIT / Emergency", ["child diarrhea", "child diarrhoea", "dehydrated child"], ["U&E", "Random Glucose", "FBC", "Stool MCS / PCR as indicated"]],
  ["Sickle cell crisis support", "Haematology / Emergency", ["sickle crisis", "vaso-occlusive crisis", "sickle pain"], ["FBC", "Reticulocyte Count", "U&E", "CRP", "Blood Culture"]],
  ["Polycythaemia", "Haematology", ["polycythemia", "high haemoglobin", "high hemoglobin"], ["FBC", "U&E", "Liver Function Tests (LFT)"]],
  ["Leukocytosis", "Haematology / Infection", ["high white cells", "high WCC", "neutrophilia"], ["FBC", "Peripheral Blood Smear / Blood Film", "CRP"]],
  ["Leukopenia", "Haematology", ["low white cells", "low WCC", "neutropenia"], ["FBC", "Peripheral Blood Smear / Blood Film", "Vitamin B12", "Folate"]],
  ["Raised inflammatory markers", "General / Inflammation", ["high CRP", "high ESR", "inflammation"], ["FBC", "CRP", "ESR", "U&E", "Liver Function Tests (LFT)"]],
  ["Perioperative baseline labs", "Emergency / Preoperative", ["pre-op bloods", "surgery baseline", "operation bloods"], ["FBC", "U&E", "Coagulation Studies", "Blood Bank / Transfusion"]],
  ["Transfusion request support", "Haematology / Blood bank", ["crossmatch", "group and screen", "blood transfusion"], ["Blood Bank / Transfusion", "FBC"]],
  ["Lead exposure concern", "Toxicology / Occupational health", ["lead poisoning", "plumbism", "occupational lead"], ["Lead", "FBC"]],
  ["Trace element concern", "Chemistry / Special tests", ["zinc copper", "trace elements", "nutritional trace"], ["Trace Elements / Heavy Metals"]],
  ["Ammonia / encephalopathy concern", "Liver / Emergency / Special handling", ["hepatic encephalopathy", "high ammonia", "drowsy cirrhosis"], ["Ammonia", "Liver Function Tests (LFT)", "U&E", "Random Glucose"]],
  ["Lactic acidosis concern", "Chemistry / Emergency / Special handling", ["high lactate", "shock lactate", "metabolic acidosis"], ["Lactate", "Blood Gases", "U&E", "Random Glucose"]],
  ["Allergic disease screen", "Immunology / Allergy", ["atopy", "allergy", "wheeze eczema allergy"], ["IgE Total", "Phadiatop Inhalant Screen", "Pediatric Food Screen"]],
  ["Urticaria recurrent", "Immunology / Allergy", ["hives", "chronic urticaria", "allergic rash"], ["FBC", "CRP", "TSH", "IgE Total"]],
  ["Eczema with infection concern", "Skin / Infection / Allergy", ["dermatitis infected", "eczema flare", "weeping eczema"], ["FBC", "CRP", "IgE Total", "Wound / Site Swab MCS"]]
];

function normalizeName(testName) {
  const key = String(testName || "").trim().toLowerCase();
  return testAliases.get(key) || testName;
}

function getTest(testName) {
  const normalized = normalizeName(testName);
  return testByName.get(String(normalized).toLowerCase()) || manualTests[normalized] || manualTests[testName] || {
    name: normalized,
    tubeColor: "Confirm with local laboratory protocol",
    specimen: "Confirm with local laboratory protocol",
    notes: "Tube and handling vary by laboratory."
  };
}

function getPriority(testName, category) {
  const normalized = getTest(testName).name;
  if (priorityByTest[normalized]) return priorityByTest[normalized];
  const found = priorityByCategory.find(([needle]) => category.includes(needle));
  return found ? found[1] : "Routine/Urgent depending on presentation";
}

function buildSuggestedTest(testName, category) {
  const test = getTest(testName);
  const tube = getTubeForTest(test);
  const specialNotes = [
    test.notes || "",
    test.criticalPrep || "",
    requiresProtocolConfirmation(tube, test.name) ? "Confirm with local laboratory protocol." : ""
  ].filter(Boolean).join(" ");
  return {
    test_name: test.name,
    reason: reasonByTest[test.name] || `Commonly requested as a supportive investigation for ${category.toLowerCase()} presentations when clinically indicated.`,
    tube,
    department: inferDepartment(test.name, category),
    priority: getPriority(test.name, category),
    notes: specialNotes
  };
}

function normalizeTube(tubeColor) {
  const tube = String(tubeColor || "").trim();
  const map = [
    [/^(gold|yellow)$/i, "SST / Yellow top"],
    [/light blue/i, "Citrate / Blue top"],
    [/purple|lavender/i, "EDTA / Purple top"],
    [/gray|grey/i, "Fluoride / Grey top"],
    [/green|heparin/i, "Heparin / Green top"],
    [/pink/i, "EDTA / Pink top blood bank tube"],
    [/pearl|white/i, "PPT / Pearl or white top"],
    [/tan/i, "Tan or special trace-element tube"],
    [/blood culture/i, "Blood culture bottles"],
    [/urine/i, "Urine container"],
    [/stool|faecal|fecal/i, "Stool container"],
    [/swab/i, "Swab transport medium"],
    [/sputum/i, "Sterile sputum container"],
    [/fluid|csf/i, "Sterile container / CSF tubes"]
  ];
  const matched = map.find(([pattern]) => pattern.test(tube));
  return matched ? matched[1] : tube || "Confirm with local laboratory protocol";
}

function getTubeForTest(test) {
  const name = String(test.name || "");
  if (/^(FBC|HbA1c|ESR|Malaria Smear|Malaria Profile|Peripheral Blood Smear|Reticulocytes)/i.test(name)) return "EDTA / Purple top";
  if (/^(INR|Prothrombin Time|Partial Thromboplastin|Coagulation|Fibrinogen|DIC Screen|XDP|D-Dimer|Von Willebrand)/i.test(name)) return "Citrate / Blue top";
  if (/^(Random Glucose|Fasting Glucose|Lactate|OGTT)/i.test(name)) return "Fluoride / Grey top";
  if (/Blood Culture/i.test(name)) return "Blood culture bottles";
  if (/Blood Bank|Transfusion|Group.*Rh|Crossmatch/i.test(name)) return "EDTA / Pink/Pearl/Tan depending on local blood bank protocol";
  if (/Lead|Trace Elements|Heavy Metals/i.test(name)) return "Tan or special trace-element tube";
  if (/Ammonia/i.test(name)) return "Heparin / Green top with urgent special handling";
  if (/NT-proBNP/i.test(name)) return "Heparin / Green top or SST / Yellow top";
  if (/Urine|Bence-Jones|Albumin:Creatinine|Protein:Creatinine/i.test(name)) return "Urine container";
  if (/Stool|Faecal|Fecal|H\. pylori/i.test(name)) return "Stool container";
  if (/Swab|Genital Ulcer|Bacterial Vaginosis|STD PCR|Chlamydia|gonorrhoeae|Trichomonas|Mycoplasma/i.test(name)) return "Swab transport medium or first-catch urine depending on request";
  if (/CSF|Meningitis|Cryptococcal|Oligoclonal/i.test(name)) return "Sterile CSF tubes / special local CSF protocol";
  if (/Blood Gases/i.test(name)) return "Heparin blood gas syringe / local blood gas protocol";
  if (/Troponin|Cardiac Profile|U&E|Creatinine|Liver Function|CRP|Procalcitonin|TSH|Free T4|Free T3|Thyroid|Lipid|Lipogram|Calcium|Phosphate|Magnesium|Potassium|Sodium|Chloride|Uric Acid|Albumin|Bilirubin|Lipase|Amylase|Cortisol|PSA|CA 125|Ferritin|Fe Studies|Iron|Transferrin|TIBC|Vitamin|Folate|Protein Electrophoresis|Light Chains|HIV|Hepatitis|RPR|Syphilis|ANA|ENA|Rheumatoid|Anti-CCP|IgE|Celiac|Coeliac|Parathyroid|BHCG|Beta-hCG/i.test(name)) {
    return "SST / Yellow top";
  }
  return normalizeTube(test.tubeColor);
}

function requiresProtocolConfirmation(tube, testName) {
  return /confirm|special|trace|ammonia|lactate|blood bank|pink|csf|swab|stool|sputum|culture|urine|OGTT|cortisol|ACTH/i.test(`${tube} ${testName}`);
}

function inferDepartment(testName, category) {
  const nameText = String(testName || "").toLowerCase();
  const text = `${testName} ${category}`.toLowerCase();
  if (/antenatal screen/.test(nameText)) return "Multi-department / Antenatal profile";
  if (/blood bank|transfusion|group|crossmatch|rh/.test(nameText)) return "Blood Bank";
  if (/inr|coag|d-dimer|fibrinogen|ptt|thrombin|dic|factor|von willebrand/.test(nameText)) return "Coagulation";
  if (/fbc|film|smear|reticulocyte/.test(nameText)) return "Haematology";
  if (/u&e|creatinine|liver function|crp|procalcitonin|troponin|cardiac|nt-probnp|glucose|hba1c|lipid|lipogram|calcium|phosphate|magnesium|potassium|sodium|chloride|bilirubin|lipase|amylase|cortisol|thyroid|tsh|free t4|free t3|psa|ca 125|protein electrophoresis|light chains|bence-jones|lead|trace|ferritin|iron|transferrin|tibc|b12|folate|vitamin|parathyroid|bhcg|beta-hcg|ammonia|lactate|ck total/.test(nameText)) return "Chemistry";
  if (/ana|ena|rf|ccp|ige|allergy|immunology|rheumatology|celiac|coeliac/.test(nameText)) return "Immunology";
  if (/culture|mcs|pcr|hiv|hepatitis|rpr|syphilis|malaria|tb|std|chlamydia|gonorr|blood culture|csf|sputum|swab|stool/.test(nameText)) return "Microbiology / Virology";
  if (/culture|mcs|pcr|hiv|hepatitis|rpr|syphilis|malaria|tb|std|chlamydia|gonorr|blood culture|csf|sputum|swab|stool/.test(text)) return "Microbiology / Virology";
  if (/fbc|film|smear|reticulocyte|ferritin|iron|b12|folate|anaemia|hematology|haematology/.test(text)) return "Haematology";
  if (/inr|coag|d-dimer|fibrinogen|ptt|thrombin|dic|factor|von willebrand/.test(text)) return "Coagulation";
  if (/blood bank|transfusion|group|crossmatch|rh/.test(text)) return "Blood Bank";
  if (/ana|ena|rf|ccp|ige|allergy|immunology|rheumatology/.test(text)) return "Immunology";
  if (/cytology|histology|oncology/.test(text)) return "Anatomical Pathology / Cytology";
  return "Chemistry";
}

function classifyUrgency(category, tests) {
  if (/Emergency|Sepsis|Cardiac/.test(category) || tests.some((test) => /Urgent/.test(test.priority))) return "Urgent or same-day depending on presentation";
  if (/Chronic disease monitoring|Monitoring/.test(category)) return "Routine";
  return "Routine/Urgent depending on presentation";
}

function sourceKeysForCategory(category) {
  const keys = new Set(["LTO_STYLE"]);
  categorySourceKeys.forEach(([needle, sourceKeys]) => {
    if (category.includes(needle)) sourceKeys.forEach((key) => keys.add(key));
  });
  return [...keys].map((key) => sourceLibrary[key]);
}

function categoryFromRecord(record, fallback) {
  if (record.category) return titleCaseCategory(record.category);
  const body = record.bodySystem || "General";
  const type = fallback === "symptoms" ? "Symptom" : fallback === "signs" ? "Clinical sign" : "Clinical concern";
  return `${body} / ${type}`;
}

function titleCaseCategory(category) {
  return String(category || "General").replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanArray(value) {
  return [...new Set((value || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function slug(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildRecord({ concern, category, aliases, tests, warning, sourceType }) {
  const labTests = cleanArray(tests).filter((test) => !/^(ecg|x-ray|xray|ct|ultrasound|mri)$/i.test(test));
  const suggested_tests = labTests.slice(0, 8).map((test) => buildSuggestedTest(test, category));
  const tubes_involved = cleanArray(suggested_tests.map((test) => test.tube));
  const localFlags = suggested_tests.some((test) => requiresProtocolConfirmation(test.tube, test.test_name));
  const urgent = classifyUrgency(category, suggested_tests);
  return {
    id: slug(`${sourceType || "concern"}-${concern}`),
    concern,
    category,
    aliases: cleanArray(aliases),
    suggested_tests,
    tubes_involved,
    urgency: urgent,
    clinical_notes: "Suggested tests are supportive only and should be selected according to the clinical picture, severity, comorbidities, medicines, pregnancy status, and local pathway.",
    local_protocol_notes: localFlags ? DEFAULT_LOCAL_PROTOCOL_NOTE : "Confirm local specimen handling and test availability before collection.",
    warning: warning || `This does not diagnose ${concern}. Interpret with clinical findings and local protocols.`,
    disclaimer: DEFAULT_DISCLAIMER,
    sources: sourceKeysForCategory(category)
  };
}

function recordsFromExistingDictionary() {
  const dictionary = JSON.parse(fs.readFileSync(dictionaryPath, "utf8"));
  const rows = [];
  ["symptoms", "signs", "concerns"].forEach((bucket) => {
    (dictionary[bucket] || []).forEach((item) => {
      const concern = item.term || item.label;
      const associatedTests = cleanArray(item.associatedTests || item.relatedTests);
      if (!concern || !associatedTests.length) return;
      rows.push(buildRecord({
        concern,
        category: categoryFromRecord(item, bucket),
        aliases: cleanArray([...(item.synonyms || []), ...(item.aliases || []), ...(item.keywords || [])]).filter((alias) => alias !== concern).slice(0, 14),
        tests: associatedTests,
        warning: item.redFlagNote ? `${item.redFlagNote} This tool is reference-only and does not make diagnoses.` : "",
        sourceType: bucket.replace(/s$/, "")
      }));
    });
  });
  return rows;
}

function supplementalDataset() {
  return supplementalRecords.map(([concern, category, aliases, tests]) => buildRecord({
    concern,
    category,
    aliases,
    tests,
    sourceType: "curated"
  }));
}

function dedupeRecords(records) {
  const seen = new Set();
  const output = [];
  records.forEach((record) => {
    const key = slug(record.concern);
    if (seen.has(key)) return;
    seen.add(key);
    output.push(record);
  });
  return output;
}

function writeJson(records) {
  const payload = {
    version: "2026-04-27.1",
    schema_version: "find-my-test-clinical-support-v1",
    intended_use: "Clinical laboratory support reference for suggesting common laboratory investigations and specimen tubes. Not a diagnostic tool.",
    disclaimer: DEFAULT_DISCLAIMER,
    local_protocol_note: DEFAULT_LOCAL_PROTOCOL_NOTE,
    record_count: records.length,
    source_library: sourceLibrary,
    records
  };
  fs.writeFileSync(outputJsonPath, `${JSON.stringify(payload, null, 2)}\n`);
}

function writeSummary(records) {
  const lines = [
    "# Find My Test clinical dataset summary",
    "",
    `Generated: 2026-04-27`,
    `Records: ${records.length}`,
    "",
    "> Reference-only laboratory support. This does not diagnose or exclude disease. Confirm local laboratory protocol for tube, timing, transport, and repeat testing.",
    "",
    "## Source set",
    "",
    ...Object.values(sourceLibrary).map((source) => `- [${source.name}](${source.url})`),
    "",
    "## Table summary",
    "",
    "| Concern | Category | Suggested tests | Tubes involved | Urgency |",
    "|---|---|---|---|---|"
  ];

  records.forEach((record) => {
    lines.push(`| ${escapeMd(record.concern)} | ${escapeMd(record.category)} | ${escapeMd(record.suggested_tests.map((test) => test.test_name).join(", "))} | ${escapeMd(record.tubes_involved.join(", "))} | ${escapeMd(record.urgency)} |`);
  });

  lines.push(
    "",
    "## Implementation notes",
    "",
    "- Store aliases separately or in a JSONB/FTS column so autocomplete can match lay terms, abbreviations, and spelling variants.",
    "- Treat `tubes_involved` as a derived display field; the authoritative tube mapping should remain on each suggested test.",
    "- Any record involving blood bank, cultures, CSF, swabs, stool, sputum, ammonia, lactate, trace elements, or pregnancy pathways should display the local-protocol warning prominently.",
    "- Ranking should boost exact concern matches, then alias matches, then category/test matches, with emergency records visually flagged but not automatically diagnosing the patient."
  );

  fs.writeFileSync(outputSummaryPath, `${lines.join("\n")}\n`);
}

function escapeMd(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

const records = dedupeRecords([...recordsFromExistingDictionary(), ...supplementalDataset()]);
writeJson(records);
writeSummary(records);

console.log(`Wrote ${records.length} records`);
console.log(outputJsonPath);
console.log(outputSummaryPath);
