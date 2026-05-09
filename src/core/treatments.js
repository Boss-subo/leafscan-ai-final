/**
 * LEAFSCAN AI — TREATMENT KNOWLEDGE BASE v1.0
 * Complete treatment protocols for all 102 specialist classes
 * Save as: src/core/treatments.js
 */

export const TREATMENTS = {

  // ── TOMATO ────────────────────────────────────────────────────
  'Tomato Bacterial Spot': {
    severity: 'medium',
    description: 'Bacterial infection causing dark, water-soaked spots on leaves and fruit.',
    organic: ['Copper-based sprays (copper hydroxide)', 'Neem oil spray every 7 days', 'Remove and destroy infected leaves immediately'],
    chemical: ['Copper oxychloride 50% WP @ 3g/L', 'Streptomycin sulfate 90% SP @ 0.5g/L', 'Mancozeb 75% WP @ 2.5g/L'],
    prevention: ['Use certified disease-free seeds', 'Avoid overhead irrigation', 'Maintain 60cm plant spacing', 'Rotate crops every 2 seasons'],
    urgency: 'Act within 3-5 days',
  },
  'Tomato Early Blight': {
    severity: 'high',
    description: 'Fungal disease causing concentric ring lesions on older leaves, leading to defoliation.',
    organic: ['Neem oil + baking soda spray (5ml + 5g per litre)', 'Compost tea foliar spray', 'Remove lower infected leaves'],
    chemical: ['Mancozeb 75% WP @ 2.5g/L', 'Chlorothalonil 75% WP @ 2g/L', 'Iprodione 50% WP @ 1g/L'],
    prevention: ['Mulch around plants to prevent soil splash', 'Water at base, not on leaves', 'Ensure good air circulation'],
    urgency: 'Treat immediately',
  },
  'Tomato Late Blight': {
    severity: 'critical',
    description: 'Highly destructive oomycete disease causing rapid brown lesions — can destroy entire crop in days.',
    organic: ['Copper sulfate + lime (Bordeaux mixture) spray', 'Remove and burn all infected plant parts'],
    chemical: ['Metalaxyl + Mancozeb @ 2.5g/L', 'Cymoxanil 8% + Mancozeb 64% WP @ 3g/L', 'Dimethomorph 50% WP @ 1g/L'],
    prevention: ['Plant resistant varieties', 'Avoid planting in low-lying areas', 'Destroy volunteer plants', 'Do not compost infected material'],
    urgency: '🚨 URGENT — treat within 24 hours',
  },
  'Tomato Leaf Mold': {
    severity: 'medium',
    description: 'Fungal disease causing yellow patches on upper leaf surface with olive-green mold below.',
    organic: ['Improve ventilation immediately', 'Neem oil spray weekly', 'Reduce humidity below 85%'],
    chemical: ['Chlorothalonil 75% WP @ 2g/L', 'Mancozeb 75% WP @ 2.5g/L', 'Copper oxychloride @ 3g/L'],
    prevention: ['Plant resistant varieties', 'Ensure good greenhouse ventilation', 'Avoid wetting foliage'],
    urgency: 'Treat within 5-7 days',
  },
  'Tomato Mosaic Virus': {
    severity: 'high',
    description: 'Viral disease causing mosaic-pattern discoloration and leaf distortion. No cure — prevention only.',
    organic: ['Remove and destroy infected plants immediately', 'Control aphid vectors with neem oil', 'Wash hands before handling plants'],
    chemical: ['No chemical cure exists', 'Imidacloprid @ 0.5ml/L to control aphid vectors', 'Thiamethoxam 25% WG @ 0.3g/L for vector control'],
    prevention: ['Use virus-free certified seeds', 'Control insects rigorously', 'Disinfect tools with bleach solution'],
    urgency: 'Remove infected plants immediately',
  },
  'Tomato Septoria': {
    severity: 'medium',
    description: 'Fungal disease causing small circular spots with dark borders and light centers on leaves.',
    organic: ['Remove infected lower leaves', 'Copper-based fungicide spray', 'Neem oil every 7-10 days'],
    chemical: ['Chlorothalonil 75% WP @ 2g/L', 'Mancozeb 75% WP @ 2.5g/L', 'Azoxystrobin 23% SC @ 1ml/L'],
    prevention: ['Mulch soil surface', 'Avoid working with wet plants', 'Space plants for airflow'],
    urgency: 'Treat within 5 days',
  },
  'Tomato Spider Mites Two Spotted Mite': {
    severity: 'medium',
    description: 'Tiny mites causing stippling, bronzing, and webbing on leaves. Worse in hot dry conditions.',
    organic: ['Neem oil spray @ 5ml/L weekly', 'Insecticidal soap spray', 'Release predatory mites (Phytoseiulus persimilis)', 'Strong water jet to dislodge mites'],
    chemical: ['Abamectin 1.8% EC @ 0.5ml/L', 'Spiromesifen 22.9% SC @ 1ml/L', 'Hexythiazox 5% WP @ 1g/L'],
    prevention: ['Maintain adequate soil moisture', 'Avoid excessive nitrogen fertilization', 'Monitor weekly in hot weather'],
    urgency: 'Treat within 3-5 days',
  },
  'Tomato Target Spot': {
    severity: 'medium',
    description: 'Fungal disease causing brown circular target-like spots on leaves, stems, and fruit.',
    organic: ['Neem oil spray @ 5ml/L', 'Remove infected leaves', 'Copper fungicide spray'],
    chemical: ['Azoxystrobin 23% SC @ 1ml/L', 'Chlorothalonil 75% WP @ 2g/L', 'Boscalid + Pyraclostrobin @ 1.5ml/L'],
    prevention: ['Stake plants for airflow', 'Avoid overhead irrigation', 'Remove crop debris after harvest'],
    urgency: 'Treat within 5-7 days',
  },
  'Tomato Yellowleaf Curl Virus': {
    severity: 'critical',
    description: 'Devastating viral disease transmitted by whiteflies. Causes severe yellowing, curling, and stunting.',
    organic: ['Remove and destroy infected plants', 'Yellow sticky traps for whiteflies', 'Neem oil to control whitefly vectors', 'Reflective mulch to repel whiteflies'],
    chemical: ['No cure — control vectors only', 'Imidacloprid 17.8% SL @ 0.5ml/L for whiteflies', 'Thiamethoxam 25% WG @ 0.2g/L'],
    prevention: ['Plant resistant varieties (HM 1882, Naveen)', 'Use insect-proof nets in nursery', 'Remove weeds that host whiteflies'],
    urgency: '🚨 URGENT — remove infected plants within 24 hours',
  },
  'Tomato Healthy': {
    severity: 'none',
    description: 'Plant is healthy with no signs of disease.',
    organic: ['Continue regular neem oil preventive spray every 14 days', 'Maintain balanced NPK fertilization'],
    chemical: ['No treatment required'],
    prevention: ['Regular monitoring every 3-4 days', 'Maintain proper plant spacing', 'Keep field weed-free'],
    urgency: 'No action required — maintain monitoring',
  },

  // ── WHEAT ─────────────────────────────────────────────────────
  'Wheat Rust': {
    severity: 'critical',
    description: 'Fungal disease causing orange-brown pustules on leaves and stems. Can destroy entire crop.',
    organic: ['Apply wood ash + water spray', 'Remove and burn infected plant material'],
    chemical: ['Propiconazole 25% EC @ 1ml/L', 'Tebuconazole 25.9% EC @ 1ml/L', 'Mancozeb 75% WP @ 2.5g/L'],
    prevention: ['Plant resistant varieties (HD 2967, GW 322)', 'Early sowing to avoid rust season', 'Avoid dense sowing'],
    urgency: '🚨 URGENT — treat immediately',
  },
  'Wheat Septoria': {
    severity: 'high',
    description: 'Fungal disease causing tan lesions with dark borders. Spreads from lower to upper leaves.',
    organic: ['Remove infected lower leaves', 'Copper-based spray @ 3g/L'],
    chemical: ['Propiconazole 25% EC @ 1ml/L', 'Tebuconazole 25.9% EC @ 1ml/L', 'Epoxiconazole 12.5% SC @ 1.5ml/L'],
    prevention: ['Use certified seeds', 'Avoid late sowing', 'Crop rotation with non-cereals'],
    urgency: 'Treat within 3-5 days',
  },
  'Wheat Healthy': {
    severity: 'none',
    description: 'Crop is healthy with no disease symptoms.',
    organic: ['Preventive neem-based spray during flag leaf stage'],
    chemical: ['No treatment required'],
    prevention: ['Monitor weekly', 'Balanced fertilization', 'Timely irrigation'],
    urgency: 'No action required',
  },

  // ── RICE ──────────────────────────────────────────────────────
  'Rice Blast': {
    severity: 'critical',
    description: 'Most destructive rice disease. Diamond-shaped lesions on leaves, neck rot causing empty panicles.',
    organic: ['Silicon-based soil amendment strengthens cell walls', 'Trichoderma viride biocontrol @ 5g/L'],
    chemical: ['Tricyclazole 75% WP @ 0.6g/L', 'Isoprothiolane 40% EC @ 1.5ml/L', 'Carbendazim 50% WP @ 1g/L'],
    prevention: ['Use resistant varieties (IR-64, Pusa Basmati)', 'Avoid excess nitrogen', 'Drain fields periodically'],
    urgency: '🚨 URGENT — spray at first symptom',
  },
  'Rice Brown Spot': {
    severity: 'high',
    description: 'Fungal disease causing oval brown spots with yellow halo. Linked to potassium deficiency.',
    organic: ['Apply potassium-rich organic matter', 'Trichoderma-based biocontrol'],
    chemical: ['Edifenphos 50% EC @ 1ml/L', 'Mancozeb 75% WP @ 2.5g/L', 'Carbendazim 50% WP @ 1g/L'],
    prevention: ['Balanced NPK fertilization', 'Improve soil drainage', 'Use disease-free seeds with hot water treatment'],
    urgency: 'Treat within 3 days',
  },
  'Rice Tungro': {
    severity: 'critical',
    description: 'Viral disease transmitted by green leafhopper. Causes yellow-orange discoloration and stunting.',
    organic: ['Remove and destroy infected plants', 'Light traps for leafhopper control'],
    chemical: ['No cure — control vector only', 'Cartap hydrochloride 50% SP @ 1g/L for leafhoppers', 'Imidacloprid 17.8% SL @ 0.3ml/L'],
    prevention: ['Plant resistant varieties', 'Synchronous planting in a region', 'Avoid ratoon crops'],
    urgency: '🚨 URGENT — remove infected plants',
  },
  'Rice Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['Preventive Trichoderma application at tillering stage'],
    chemical: ['No treatment required'],
    prevention: ['Weekly field monitoring', 'Balanced fertilization', 'Proper water management'],
    urgency: 'No action required',
  },

  // ── CORN / MAIZE ──────────────────────────────────────────────
  'Corn Common Rust': {
    severity: 'high',
    description: 'Fungal disease causing cinnamon-brown pustules on both leaf surfaces.',
    organic: ['Neem oil spray @ 5ml/L', 'Remove heavily infected leaves'],
    chemical: ['Propiconazole 25% EC @ 1ml/L', 'Azoxystrobin 23% SC @ 1ml/L', 'Mancozeb 75% WP @ 2.5g/L'],
    prevention: ['Plant resistant hybrids', 'Early planting', 'Avoid dense stands'],
    urgency: 'Treat within 3-5 days',
  },
  'Corn Gray Leaf Spot': {
    severity: 'high',
    description: 'Fungal disease causing rectangular gray-tan lesions parallel to leaf veins.',
    organic: ['Crop rotation', 'Remove infected debris', 'Neem oil preventive spray'],
    chemical: ['Azoxystrobin 23% SC @ 1ml/L', 'Propiconazole 25% EC @ 1ml/L', 'Trifloxystrobin + Propiconazole @ 0.5ml/L'],
    prevention: ['Minimum tillage to reduce debris', 'Plant tolerant varieties', 'Adequate plant spacing'],
    urgency: 'Treat within 5 days',
  },
  'Corn Blight': {
    severity: 'critical',
    description: 'Northern or Southern corn leaf blight causing large cigar-shaped tan lesions.',
    organic: ['Remove infected leaves', 'Crop rotation with non-grasses'],
    chemical: ['Mancozeb 75% WP @ 2.5g/L', 'Chlorothalonil 75% WP @ 2g/L', 'Azoxystrobin @ 1ml/L'],
    prevention: ['Plant resistant hybrids', 'Avoid late planting', 'Deep plow infected residue'],
    urgency: '🚨 URGENT — treat immediately',
  },
  'Corn Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['Preventive neem spray at knee-high stage'],
    chemical: ['No treatment required'],
    prevention: ['Scout weekly', 'Balanced NPK', 'Weed control'],
    urgency: 'No action required',
  },

  // ── GRAPE ─────────────────────────────────────────────────────
  'Grape Black Rot': {
    severity: 'high',
    description: 'Fungal disease causing brown circular leaf spots and shriveled black mummified berries.',
    organic: ['Copper-based spray (Bordeaux mixture)', 'Remove mummified berries and infected leaves'],
    chemical: ['Myclobutanil 10% WP @ 1g/L', 'Mancozeb 75% WP @ 2.5g/L', 'Captan 50% WP @ 2g/L'],
    prevention: ['Prune for good air circulation', 'Remove all mummified fruit', 'Train vines properly'],
    urgency: 'Treat within 3 days',
  },
  'Grape Esca': {
    severity: 'high',
    description: 'Fungal trunk disease causing tiger-stripe leaf pattern and internal wood decay.',
    organic: ['Wound paste on pruning cuts', 'Remove and burn infected canes'],
    chemical: ['No curative treatment', 'Fosetyl-Al preventive spray @ 2.5g/L', 'Tebuconazole for foliar symptoms'],
    prevention: ['Protect pruning wounds immediately', 'Disinfect pruning tools', 'Avoid large pruning wounds'],
    urgency: 'Consult viticulture expert',
  },
  'Grape Leaf Blight': {
    severity: 'medium',
    description: 'Fungal disease causing brown irregular lesions at leaf margins and tips.',
    organic: ['Neem oil spray @ 5ml/L', 'Copper sulfate spray'],
    chemical: ['Mancozeb 75% WP @ 2.5g/L', 'Captan 50% WP @ 2g/L', 'Carbendazim 50% WP @ 1g/L'],
    prevention: ['Canopy management for air circulation', 'Avoid wetting leaves during irrigation'],
    urgency: 'Treat within 5 days',
  },
  'Grape Healthy': {
    severity: 'none',
    description: 'Vine is healthy.',
    organic: ['Preventive Bordeaux mixture before monsoon'],
    chemical: ['No treatment required'],
    prevention: ['Regular canopy management', 'Weekly scouting'],
    urgency: 'No action required',
  },

  // ── POTATO ────────────────────────────────────────────────────
  'Potato Early Blight': {
    severity: 'medium',
    description: 'Fungal disease causing dark concentric ring lesions on older leaves.',
    organic: ['Neem oil + baking soda spray', 'Remove infected lower leaves', 'Compost tea spray'],
    chemical: ['Mancozeb 75% WP @ 2.5g/L', 'Chlorothalonil 75% WP @ 2g/L', 'Azoxystrobin 23% SC @ 1ml/L'],
    prevention: ['Avoid overhead irrigation', 'Crop rotation', 'Balanced fertilization'],
    urgency: 'Treat within 5 days',
  },
  'Potato Late Blight': {
    severity: 'critical',
    description: 'Same pathogen as the Irish Famine. Water-soaked lesions spreading rapidly in cool wet weather.',
    organic: ['Bordeaux mixture spray', 'Remove and destroy infected foliage'],
    chemical: ['Metalaxyl + Mancozeb @ 2.5g/L', 'Cymoxanil + Mancozeb @ 3g/L', 'Dimethomorph 50% WP @ 1g/L'],
    prevention: ['Plant certified seed tubers', 'Ridge properly to protect tubers', 'Destroy volunteer plants'],
    urgency: '🚨 URGENT — treat within 24 hours',
  },
  'Potato Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['Preventive Bordeaux mixture spray every 10 days in wet weather'],
    chemical: ['No treatment required'],
    prevention: ['Monitor twice weekly', 'Earthing up timely', 'Avoid overhead irrigation'],
    urgency: 'No action required',
  },

  // ── APPLE ─────────────────────────────────────────────────────
  'Apple Black Rot': {
    severity: 'high',
    description: 'Fungal disease causing frog-eye leaf spots and rotting fruit with concentric rings.',
    organic: ['Remove mummified fruit and cankers', 'Copper-based spray during dormancy'],
    chemical: ['Captan 50% WP @ 2g/L', 'Myclobutanil 10% WP @ 1g/L', 'Thiophanate-methyl 70% WP @ 1.5g/L'],
    prevention: ['Prune dead wood aggressively', 'Remove all mummified fruit', 'Ensure good air circulation'],
    urgency: 'Treat within 3-5 days',
  },
  'Apple Cedar Rust': {
    severity: 'medium',
    description: 'Fungal disease causing bright orange spots on upper leaf surface with tube-like structures below.',
    organic: ['Remove nearby juniper/cedar hosts', 'Neem oil spray at bud break'],
    chemical: ['Myclobutanil 10% WP @ 1g/L', 'Propiconazole 25% EC @ 1ml/L', 'Mancozeb 75% WP @ 2.5g/L'],
    prevention: ['Plant resistant varieties', 'Remove juniper trees within 300m', 'Spray at pink bud stage'],
    urgency: 'Treat during wet spring weather',
  },
  'Apple Scab': {
    severity: 'high',
    description: 'Most common apple disease. Olive-green to black velvety scabs on leaves and fruit.',
    organic: ['Lime sulfur spray at bud break', 'Copper hydroxide spray', 'Remove fallen leaves'],
    chemical: ['Captan 50% WP @ 2g/L', 'Myclobutanil 10% WP @ 1g/L', 'Thiophanate-methyl 70% WP @ 1.5g/L'],
    prevention: ['Plant scab-resistant varieties', 'Rake and destroy fallen leaves', 'Prune for airflow'],
    urgency: 'Treat from green tip to petal fall',
  },
  'Apple Healthy': {
    severity: 'none',
    description: 'Tree is healthy.',
    organic: ['Preventive lime sulfur spray during dormancy'],
    chemical: ['No treatment required'],
    prevention: ['Annual pruning', 'Remove fallen leaves', 'Monitor weekly'],
    urgency: 'No action required',
  },

  // ── BANANA ────────────────────────────────────────────────────
  'Banana Sigatoka': {
    severity: 'high',
    description: 'Fungal disease causing yellow streaks that turn brown-black, reducing photosynthesis by up to 50%.',
    organic: ['Remove and destroy infected leaves', 'Improve drainage', 'Neem oil spray'],
    chemical: ['Propiconazole 25% EC @ 1ml/L', 'Mancozeb 75% WP @ 2.5g/L', 'Chlorothalonil 75% WP @ 2g/L'],
    prevention: ['Remove old dead leaves', 'Adequate spacing between plants', 'Avoid waterlogging'],
    urgency: 'Treat within 5 days',
  },
  'Banana Fusarium Wilt': {
    severity: 'critical',
    description: 'Panama disease — soil-borne fungus with NO cure. Causes internal browning and plant collapse.',
    organic: ['No cure exists', 'Trichoderma soil treatment as preventive', 'Remove and quarantine infected plants'],
    chemical: ['No fungicide is effective against Fusarium wilt', 'Soil fumigation before replanting'],
    prevention: ['Plant resistant varieties (FHIA, Cavendish)', 'Never replant bananas in infected soil', 'Disinfect tools with bleach'],
    urgency: '🚨 CRITICAL — quarantine infected area',
  },
  'Banana Healthy': {
    severity: 'none',
    description: 'Plant is healthy.',
    organic: ['Regular Trichoderma soil application as preventive'],
    chemical: ['No treatment required'],
    prevention: ['Maintain good drainage', 'Regular leaf removal', 'Monitor weekly'],
    urgency: 'No action required',
  },

  // ── COTTON ────────────────────────────────────────────────────
  'Cotton Bacterial Blight': {
    severity: 'high',
    description: 'Bacterial disease causing angular water-soaked lesions with yellow halo on leaves.',
    organic: ['Copper-based spray @ 3g/L', 'Remove infected plant parts'],
    chemical: ['Streptomycin sulfate @ 0.5g/L', 'Copper oxychloride 50% WP @ 3g/L', 'Bactericidal copper compounds'],
    prevention: ['Use certified disease-free seeds', 'Seed treatment with Streptocycline', 'Avoid overhead irrigation'],
    urgency: 'Treat within 3-5 days',
  },
  'Cotton Verticillium Wilt': {
    severity: 'critical',
    description: 'Soil-borne fungal wilt causing yellowing between leaf veins and internal stem browning.',
    organic: ['Trichoderma harzianum soil application', 'Biofumigation with brassica crops'],
    chemical: ['No effective curative fungicide', 'Carbendazim seed treatment @ 2g/kg'],
    prevention: ['Plant resistant varieties', '4-year crop rotation', 'Improve soil drainage', 'Avoid wounding roots'],
    urgency: 'Consult agricultural expert',
  },
  'Cotton Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['Neem seed kernel extract spray preventively'],
    chemical: ['No treatment required'],
    prevention: ['Monitor twice weekly', 'Balanced fertilization', 'Timely irrigation'],
    urgency: 'No action required',
  },

  // ── SUGARCANE ─────────────────────────────────────────────────
  'Sugarcane Red Rot': {
    severity: 'critical',
    description: 'Most destructive sugarcane disease. Internal red discoloration with white patches. Spreads through infected setts.',
    organic: ['Destroy infected clumps immediately', 'Hot water seed treatment (50°C for 2 hours)'],
    chemical: ['Carbendazim 50% WP sett treatment @ 1g/L', 'Propiconazole 25% EC @ 1ml/L foliar spray'],
    prevention: ['Use resistant varieties (Co 0238)', 'Treat setts before planting', 'Rogue infected plants early'],
    urgency: '🚨 URGENT — remove infected clumps immediately',
  },
  'Sugarcane Smut': {
    severity: 'high',
    description: 'Fungal disease producing black whip-like structures replacing the growing tip.',
    organic: ['Remove and destroy smutted shoots', 'Hot water sett treatment'],
    chemical: ['Carbendazim sett treatment @ 1g/L', 'Propiconazole 25% EC @ 1ml/L'],
    prevention: ['Use disease-free seed material', 'Plant resistant varieties', 'Roguing infected tillers'],
    urgency: 'Remove infected plants within 2 days',
  },
  'Sugarcane Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['Preventive carbendazim sett treatment before planting'],
    chemical: ['No treatment required'],
    prevention: ['Use certified disease-free setts', 'Rogue periodically', 'Monitor weekly'],
    urgency: 'No action required',
  },

  // ── COFFEE ────────────────────────────────────────────────────
  'Coffee Leaf Rust': {
    severity: 'critical',
    description: 'Most important coffee disease worldwide. Orange powdery pustules on leaf undersides cause massive defoliation.',
    organic: ['Bordeaux mixture spray @ 1%', 'Remove heavily infected leaves'],
    chemical: ['Copper oxychloride 50% WP @ 3g/L', 'Propiconazole 25% EC @ 1ml/L', 'Triadimefon 25% WP @ 1g/L'],
    prevention: ['Plant resistant varieties (Catimor, Sarchimor)', 'Shade management', 'Avoid over-cropping'],
    urgency: '🚨 URGENT — spray before and after rains',
  },
  'Coffee Cercospora': {
    severity: 'medium',
    description: 'Fungal disease causing circular brown spots with gray centers on leaves and berries.',
    organic: ['Copper-based spray', 'Remove infected berries and leaves'],
    chemical: ['Carbendazim 50% WP @ 1g/L', 'Mancozeb 75% WP @ 2.5g/L', 'Copper oxychloride @ 3g/L'],
    prevention: ['Weed management', 'Shade regulation', 'Balanced fertilization'],
    urgency: 'Treat within 5-7 days',
  },
  'Coffee Healthy': {
    severity: 'none',
    description: 'Plant is healthy.',
    organic: ['Preventive Bordeaux mixture spray at onset of rains'],
    chemical: ['No treatment required'],
    prevention: ['Regular pruning', 'Monitor monthly', 'Balanced shade management'],
    urgency: 'No action required',
  },

  // ── STRAWBERRY ────────────────────────────────────────────────
  'Strawberry Leaf Scorch': {
    severity: 'medium',
    description: 'Fungal disease causing irregular purple spots that enlarge to give a scorched appearance.',
    organic: ['Remove infected leaves', 'Neem oil spray @ 5ml/L', 'Copper-based spray'],
    chemical: ['Captan 50% WP @ 2g/L', 'Myclobutanil 10% WP @ 1g/L', 'Thiophanate-methyl @ 1.5g/L'],
    prevention: ['Use certified transplants', 'Avoid overhead irrigation', 'Remove old foliage after harvest'],
    urgency: 'Treat within 5 days',
  },
  'Strawberry Healthy': {
    severity: 'none',
    description: 'Plant is healthy.',
    organic: ['Preventive copper spray every 2 weeks'],
    chemical: ['No treatment required'],
    prevention: ['Remove old leaves', 'Drip irrigation only', 'Scout weekly'],
    urgency: 'No action required',
  },

  // ── PEACH ─────────────────────────────────────────────────────
  'Peach Bacterial Spot': {
    severity: 'high',
    description: 'Bacterial disease causing water-soaked spots on leaves, fruit and twigs with shot-hole appearance.',
    organic: ['Copper hydroxide spray @ 3g/L', 'Remove infected twigs', 'Bordeaux mixture dormant spray'],
    chemical: ['Copper oxychloride 50% WP @ 3g/L', 'Oxytetracycline 3.4% SP @ 1g/L', 'Streptomycin sulfate @ 0.5g/L'],
    prevention: ['Plant resistant varieties', 'Windbreaks to reduce spread', 'Prune infected wood during dry weather'],
    urgency: 'Treat within 3-5 days',
  },
  'Peach Healthy': {
    severity: 'none',
    description: 'Tree is healthy.',
    organic: ['Preventive copper spray at leaf fall and bud swell'],
    chemical: ['No treatment required'],
    prevention: ['Annual pruning', 'Scout weekly', 'Remove fallen leaves'],
    urgency: 'No action required',
  },

  // ── CHERRY ────────────────────────────────────────────────────
  'Cherry Powdery Mildew': {
    severity: 'medium',
    description: 'Fungal disease causing white powdery coating on young leaves and shoots.',
    organic: ['Baking soda spray (5g/L + few drops dish soap)', 'Neem oil spray @ 5ml/L', 'Milk spray (1:9 dilution)'],
    chemical: ['Sulfur 80% WP @ 3g/L', 'Myclobutanil 10% WP @ 1g/L', 'Trifloxystrobin @ 0.5ml/L'],
    prevention: ['Prune for good airflow', 'Avoid excess nitrogen', 'Plant resistant varieties'],
    urgency: 'Treat within 5-7 days',
  },
  'Cherry Healthy': {
    severity: 'none',
    description: 'Tree is healthy.',
    organic: ['Preventive sulfur spray before flowering'],
    chemical: ['No treatment required'],
    prevention: ['Regular pruning', 'Scout weekly', 'Weed management'],
    urgency: 'No action required',
  },

  // ── PEPPER ────────────────────────────────────────────────────
  'Pepper Bacterial Spot': {
    severity: 'high',
    description: 'Bacterial disease causing water-soaked spots with yellow halo on leaves and fruit.',
    organic: ['Copper hydroxide spray @ 3g/L', 'Remove infected plant material'],
    chemical: ['Copper oxychloride 50% WP @ 3g/L', 'Streptomycin sulfate @ 0.5g/L', 'Mancozeb 75% WP @ 2.5g/L'],
    prevention: ['Use certified disease-free seeds', 'Avoid overhead irrigation', 'Crop rotation'],
    urgency: 'Treat within 3-5 days',
  },
  'Pepper Healthy': {
    severity: 'none',
    description: 'Plant is healthy.',
    organic: ['Preventive neem oil spray every 14 days'],
    chemical: ['No treatment required'],
    prevention: ['Monitor weekly', 'Balanced fertilization', 'Drip irrigation'],
    urgency: 'No action required',
  },

  // ── SOYBEAN ───────────────────────────────────────────────────
  'Soybean Frogeye Leaf Spot': {
    severity: 'medium',
    description: 'Fungal disease causing circular gray-brown spots with reddish-purple border — resembling frog eyes.',
    organic: ['Crop rotation with non-legumes', 'Remove infected debris'],
    chemical: ['Azoxystrobin 23% SC @ 1ml/L', 'Thiophanate-methyl 70% WP @ 1.5g/L', 'Pyraclostrobin @ 1ml/L'],
    prevention: ['Use resistant varieties', 'Avoid dense planting', 'Deep plow infected debris'],
    urgency: 'Treat within 5-7 days',
  },
  'Soybean Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['Preventive Trichoderma seed treatment'],
    chemical: ['No treatment required'],
    prevention: ['Scout twice weekly', 'Balanced NPK', 'Weed management'],
    urgency: 'No action required',
  },

  // ── WATERMELON ────────────────────────────────────────────────
  'Watermelon Downy Mildew': {
    severity: 'high',
    description: 'Oomycete disease causing angular yellow spots on upper leaf surface with purple-gray mold below.',
    organic: ['Copper-based spray', 'Improve air circulation', 'Avoid wet foliage'],
    chemical: ['Metalaxyl + Mancozeb @ 2.5g/L', 'Cymoxanil + Mancozeb @ 3g/L', 'Fosetyl-Al 80% WP @ 2.5g/L'],
    prevention: ['Use resistant varieties', 'Drip irrigation only', 'Good row spacing'],
    urgency: 'Treat within 3 days',
  },
  'Watermelon Anthracnose': {
    severity: 'high',
    description: 'Fungal disease causing dark sunken lesions on leaves, stems, and fruit.',
    organic: ['Copper-based spray @ 3g/L', 'Remove infected plant material'],
    chemical: ['Mancozeb 75% WP @ 2.5g/L', 'Chlorothalonil 75% WP @ 2g/L', 'Azoxystrobin @ 1ml/L'],
    prevention: ['Use disease-free seeds', 'Avoid working in wet fields', 'Crop rotation'],
    urgency: 'Treat within 3-5 days',
  },
  'Watermelon Healthy': {
    severity: 'none',
    description: 'Plant is healthy.',
    organic: ['Preventive copper spray every 10-14 days'],
    chemical: ['No treatment required'],
    prevention: ['Monitor weekly', 'Drip irrigation', 'Weed management'],
    urgency: 'No action required',
  },

  // ── ORANGE ────────────────────────────────────────────────────
  'Orange Haunglongbing': {
    severity: 'critical',
    description: 'Citrus greening — the most devastating citrus disease. NO CURE. Caused by bacteria spread by psyllid insects.',
    organic: ['Remove and destroy ALL infected trees', 'Control Asian citrus psyllid with neem oil'],
    chemical: ['No cure exists', 'Imidacloprid for psyllid control @ 0.5ml/L', 'Drenching with systemic insecticides'],
    prevention: ['Use certified disease-free nursery stock', 'Rigorous psyllid monitoring and control', 'Quarantine infected areas'],
    urgency: '🚨 CRITICAL — report to agricultural department',
  },

  // ── BEANS ─────────────────────────────────────────────────────
  'Beans Leaf Spot': {
    severity: 'medium',
    description: 'Fungal disease causing angular brown spots on leaves with yellow halo.',
    organic: ['Copper-based spray @ 3g/L', 'Remove infected leaves', 'Neem oil spray'],
    chemical: ['Mancozeb 75% WP @ 2.5g/L', 'Carbendazim 50% WP @ 1g/L', 'Chlorothalonil @ 2g/L'],
    prevention: ['Use certified seeds', 'Avoid overhead irrigation', 'Crop rotation'],
    urgency: 'Treat within 5 days',
  },
  'Beans Anthracnose': {
    severity: 'high',
    description: 'Fungal disease causing dark sunken lesions on pods, seeds, and leaves.',
    organic: ['Copper-based spray @ 3g/L', 'Hot water seed treatment (55°C for 15 min)'],
    chemical: ['Mancozeb 75% WP @ 2.5g/L', 'Thiophanate-methyl @ 1.5g/L', 'Carbendazim @ 1g/L'],
    prevention: ['Use certified disease-free seeds', 'Crop rotation', 'Avoid working in wet conditions'],
    urgency: 'Treat within 3-5 days',
  },
  'Beans Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['Preventive copper spray every 14 days'],
    chemical: ['No treatment required'],
    prevention: ['Monitor weekly', 'Crop rotation', 'Avoid waterlogging'],
    urgency: 'No action required',
  },

  // ── AMLA ──────────────────────────────────────────────────────
  'Amla General Pathogen': {
    severity: 'medium',
    description: 'Fungal or bacterial infection affecting amla leaves and fruit.',
    organic: ['Bordeaux mixture spray @ 1%', 'Neem oil spray @ 5ml/L', 'Remove infected parts'],
    chemical: ['Copper oxychloride 50% WP @ 3g/L', 'Mancozeb 75% WP @ 2.5g/L', 'Carbendazim @ 1g/L'],
    prevention: ['Prune for airflow', 'Avoid waterlogging', 'Balanced fertilization'],
    urgency: 'Treat within 5-7 days',
  },
  'Amla Healthy': {
    severity: 'none',
    description: 'Tree is healthy.',
    organic: ['Annual Bordeaux mixture spray'],
    chemical: ['No treatment required'],
    prevention: ['Regular pruning', 'Weed management', 'Balanced NPK'],
    urgency: 'No action required',
  },

  // ── AMARANTH ─────────────────────────────────────────────────
  'Amaranth General Pathogen': {
    severity: 'medium',
    description: 'Fungal infection causing leaf spots and stem rot on amaranth.',
    organic: ['Neem oil spray @ 5ml/L', 'Remove infected plants', 'Improve drainage'],
    chemical: ['Mancozeb 75% WP @ 2g/L', 'Copper oxychloride @ 3g/L'],
    prevention: ['Proper spacing', 'Avoid waterlogging', 'Crop rotation'],
    urgency: 'Treat within 5-7 days',
  },
  'Amaranth Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['No treatment required'],
    chemical: ['No treatment required'],
    prevention: ['Monitor weekly', 'Good drainage'],
    urgency: 'No action required',
  },

  // ── COLOCASIA ─────────────────────────────────────────────────
  'Colocasia General Pathogen': {
    severity: 'medium',
    description: 'Leaf blight or corm rot affecting colocasia (arbi/taro).',
    organic: ['Bordeaux mixture spray @ 1%', 'Remove infected leaves', 'Improve drainage'],
    chemical: ['Metalaxyl + Mancozeb @ 2.5g/L', 'Copper oxychloride @ 3g/L'],
    prevention: ['Use disease-free corms', 'Avoid waterlogging', 'Adequate spacing'],
    urgency: 'Treat within 5 days',
  },
  'Colocasia Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['Preventive Bordeaux spray before monsoon'],
    chemical: ['No treatment required'],
    prevention: ['Good drainage', 'Monitor weekly'],
    urgency: 'No action required',
  },

  // ── JACKFRUIT ─────────────────────────────────────────────────
  'Jackfruit Rhizopus Rot': {
    severity: 'high',
    description: 'Post-harvest fungal rot causing rapid softening and white cottony mold on fruit.',
    organic: ['Harvest at proper maturity', 'Handle fruit carefully to avoid wounds', 'Store in cool dry conditions'],
    chemical: ['Thiabendazole post-harvest dip', 'Carbendazim 50% WP @ 1g/L pre-harvest spray'],
    prevention: ['Avoid fruit injuries', 'Good orchard sanitation', 'Timely harvest'],
    urgency: 'Treat within 2-3 days',
  },
  'Jackfruit Pink Disease': {
    severity: 'high',
    description: 'Fungal disease causing pink to white coating on branches causing dieback.',
    organic: ['Scrape infected bark and apply Bordeaux paste', 'Remove infected branches'],
    chemical: ['Copper oxychloride paste on wounds', 'Carbendazim spray @ 1g/L'],
    prevention: ['Prune infected branches below disease line', 'Paint wounds with Bordeaux paste immediately'],
    urgency: 'Treat within 3-5 days',
  },
  'Jackfruit Healthy': {
    severity: 'none',
    description: 'Tree is healthy.',
    organic: ['Annual Bordeaux mixture spray'],
    chemical: ['No treatment required'],
    prevention: ['Regular pruning', 'Remove dead branches', 'Monitor monthly'],
    urgency: 'No action required',
  },

  // ── TURNIP ────────────────────────────────────────────────────
  'Turnip General Pathogen': {
    severity: 'medium',
    description: 'Fungal infection causing leaf spots or root rot on turnip.',
    organic: ['Neem oil spray @ 5ml/L', 'Remove infected plants', 'Improve soil drainage'],
    chemical: ['Mancozeb 75% WP @ 2g/L', 'Carbendazim @ 1g/L'],
    prevention: ['Crop rotation', 'Avoid waterlogging', 'Use disease-free seeds'],
    urgency: 'Treat within 5-7 days',
  },
  'Turnip Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['No treatment required'],
    chemical: ['No treatment required'],
    prevention: ['Monitor weekly', 'Good drainage', 'Proper spacing'],
    urgency: 'No action required',
  },

  // ── YAM ───────────────────────────────────────────────────────
  'Yam General Pathogen': {
    severity: 'medium',
    description: 'Anthracnose or leaf spot affecting yam leaves and tubers.',
    organic: ['Bordeaux mixture spray @ 1%', 'Remove infected vines', 'Improve drainage'],
    chemical: ['Mancozeb 75% WP @ 2.5g/L', 'Carbendazim @ 1g/L', 'Copper oxychloride @ 3g/L'],
    prevention: ['Use disease-free seed yams', 'Crop rotation', 'Stake vines for airflow'],
    urgency: 'Treat within 5 days',
  },
  'Yam Healthy': {
    severity: 'none',
    description: 'Crop is healthy.',
    organic: ['Preventive Bordeaux spray before vine growth'],
    chemical: ['No treatment required'],
    prevention: ['Use certified seed material', 'Monitor weekly'],
    urgency: 'No action required',
  },

};

// ── GET TREATMENT ─────────────────────────────────────────────────
export function getTreatment(cropName, diseaseLabel) {
  // Try exact match first
  const exactKey = `${cropName} ${diseaseLabel}`;
  if (TREATMENTS[exactKey]) return TREATMENTS[exactKey];

  // Try cleaning underscores
  const cleanKey = exactKey.replace(/___/g, ' ').replace(/_/g, ' ');
  if (TREATMENTS[cleanKey]) return TREATMENTS[cleanKey];

  // Try just the label
  if (TREATMENTS[diseaseLabel]) return TREATMENTS[diseaseLabel];

  // Fuzzy match — find closest key
  const keys = Object.keys(TREATMENTS);
  const fuzzy = keys.find(k =>
    k.toLowerCase().includes(cropName.toLowerCase()) &&
    k.toLowerCase().includes(diseaseLabel.toLowerCase().split(' ')[0])
  );
  if (fuzzy) return TREATMENTS[fuzzy];

  // Default fallback
  return {
    severity: 'unknown',
    description: 'Consult your local agricultural extension officer for diagnosis confirmation.',
    organic: ['General neem oil spray @ 5ml/L as preventive measure'],
    chemical: ['Consult local agricultural officer for specific recommendation'],
    prevention: ['Monitor regularly', 'Maintain field hygiene', 'Crop rotation'],
    urgency: 'Consult agricultural expert',
  };
}

// ── SEVERITY COLOR ────────────────────────────────────────────────
export function getSeverityColor(severity) {
  const colors = {
    none:     '#10b981',
    low:      '#34d399',
    medium:   '#f59e0b',
    high:     '#ef4444',
    critical: '#dc2626',
    unknown:  '#94a3b8',
  };
  return colors[severity] || colors.unknown;
}

export function getSeverityLabel(severity) {
  const labels = {
    none:     '✅ HEALTHY',
    low:      '🟡 LOW RISK',
    medium:   '🟠 MODERATE',
    high:     '🔴 HIGH RISK',
    critical: '🚨 CRITICAL',
    unknown:  '❓ UNKNOWN',
  };
  return labels[severity] || labels.unknown;
}
