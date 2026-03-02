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
  }
];
