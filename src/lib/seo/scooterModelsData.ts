export interface ScooterModelSEO {
  slug: string;
  name: string;
  brand: string;
  engine: string;
  category: 'Compact Automatic' | 'Maxi Scooter' | 'Adventure Scooter' | 'Retro Italian';
  title: string;
  metaDescription: string;
  heroHeadline: string;
  description: string;
  specs: {
    engineCc: string;
    fuelTank: string;
    underSeatStorage: string;
    transmission: string;
    weight: string;
    fuelEfficiency: string;
  };
  pricingEst: {
    daily: string;
    weekly: string;
    monthly: string;
  };
  pros: string[];
  bestFor: string;
  recommendedAreas: string[];
  faqs: { question: string; answer: string }[];
}

export const SCOOTER_MODELS: ScooterModelSEO[] = [
  {
    slug: 'honda-scoopy',
    name: 'Honda Scoopy',
    brand: 'Honda',
    engine: '110cc eSP',
    category: 'Compact Automatic',
    title: 'Honda Scoopy Rental Bali | Compare Rates, Specs & Free Delivery',
    metaDescription: 'Rent a stylish Honda Scoopy in Bali. Lightweight, retro design, superb fuel economy (59 km/L) & phone charging port. Compare daily, weekly & monthly rates.',
    heroHeadline: 'Honda Scoopy Rental in Bali',
    description: 'The Honda Scoopy is Bali’s most popular lifestyle scooter. Featuring an iconic retro-modern design, comfortable wide seat, built-in USB charger, and nimble handling, the Scoopy is the perfect companion for cruising between beach clubs, cafes, and coastal sunsets.',
    specs: {
      engineCc: '109.5cc 4-Stroke SOHC eSP',
      fuelTank: '4.2 Liters',
      underSeatStorage: '15.4 Liters (Fits open-face helmet)',
      transmission: 'Automatic V-Matic',
      weight: '95 kg (Lightweight & easy to balance)',
      fuelEfficiency: '~59 km/Liter'
    },
    pricingEst: {
      daily: 'IDR 75,000 - IDR 90,000',
      weekly: 'IDR 450,000 - IDR 550,000',
      monthly: 'IDR 1,400,000 - IDR 1,700,000'
    },
    pros: [
      'Extremely lightweight and effortless to park in tight spots',
      'Class-leading fuel efficiency saving you money on road trips',
      'Built-in USB power charger to keep your phone navigation active',
      'Iconic retro aesthetic perfect for Bali photos'
    ],
    bestFor: 'Solo riders, couples for short coastal rides, beginners, and digital nomads in Canggu, Ubud & Seminyak.',
    recommendedAreas: ['Canggu', 'Seminyak', 'Ubud', 'Sanur', 'Kuta', 'Berawa', 'Pererenan'],
    faqs: [
      {
        question: 'Is the Honda Scoopy suitable for carrying two people in Bali?',
        answer: 'Yes! The Honda Scoopy comfortably carries two adults for city, beach, and coastal cruising. For long-distance mountain climbs (like Bedugul or Kintamani with two riders), a 150cc scooter like the NMAX is recommended.'
      },
      {
        question: 'How far can a Honda Scoopy go on a full tank of fuel?',
        answer: 'With its 4.2-liter tank and remarkable 59 km/L fuel economy, a single full tank (costing roughly IDR 45,000) provides approximately 220–240 km of riding.'
      }
    ]
  },
  {
    slug: 'yamaha-nmax',
    name: 'Yamaha NMAX 155',
    brand: 'Yamaha',
    engine: '155cc VVA Blue Core',
    category: 'Maxi Scooter',
    title: 'Yamaha NMAX Rental Bali | Compare 155cc Maxi-Scooters & Delivery',
    metaDescription: 'Rent a powerful Yamaha NMAX 155 in Bali. Maximum comfort, spacious 24L luggage storage, dual ABS & superior hill-climbing power. Book with free villa delivery.',
    heroHeadline: 'Yamaha NMAX 155 Rental in Bali',
    description: 'The Yamaha NMAX 155 is the undisputed king of Bali road trips. Equipped with a punchy 155cc Variable Valve Actuation (VVA) engine, spacious footboards that let you stretch your legs, and a huge 24-liter under-seat trunk, the NMAX handles two passengers and steep Bali hills with effortless comfort.',
    specs: {
      engineCc: '155cc Liquid-Cooled 4-Stroke SOHC VVA',
      fuelTank: '7.1 Liters',
      underSeatStorage: '24 Liters (Fits full-face helmet + bag)',
      transmission: 'Automatic V-Belt',
      weight: '131 kg',
      fuelEfficiency: '~42 km/Liter'
    },
    pricingEst: {
      daily: 'IDR 130,000 - IDR 160,000',
      weekly: 'IDR 800,000 - IDR 950,000',
      monthly: 'IDR 2,400,000 - IDR 2,900,000'
    },
    pros: [
      'Effortless power for two adults on steep hills (Uluwatu, Bedugul, Kintamani)',
      'Dual ergonomic riding positions (sit upright or stretch legs forward)',
      'Massive 24L luggage compartment for daypacks and shopping',
      'Dual-channel ABS braking and rear sub-tank suspension for maximum safety'
    ],
    bestFor: 'Couples, travelers doing island road trips, luggage transport, and hilly destinations like Uluwatu, Munduk, and Sidemen.',
    recommendedAreas: ['Uluwatu', 'Ubud', 'Munduk', 'Bedugul', 'Amed', 'Sidemen', 'Canggu'],
    faqs: [
      {
        question: 'Why choose a Yamaha NMAX over a Honda Scoopy in Bali?',
        answer: 'The Yamaha NMAX offers significantly more horsepower (155cc vs 110cc), a larger chassis for 2-up riding comfort, superior suspension, and a larger fuel tank, making it far superior for cross-island journeys and hilly terrains.'
      }
    ]
  },
  {
    slug: 'honda-vario',
    name: 'Honda Vario 125 / 160',
    brand: 'Honda',
    engine: '125cc / 160cc eSP+',
    category: 'Compact Automatic',
    title: 'Honda Vario Rental Bali | Compare 125cc & 160cc Rental Rates',
    metaDescription: 'Rent a sporty Honda Vario 125 or 160 in Bali. Sleek aerodynamic design, great luggage hook, LED headlights & powerful acceleration. Daily, weekly & monthly deals.',
    heroHeadline: 'Honda Vario Rental in Bali',
    description: 'The Honda Vario is the sharp, sporty daily commuter trusted by locals and travelers alike. Offering the perfect blend of athletic acceleration, flat front footboard for bags, and sharp cornering agility, it is one of the most reliable and balanced scooters in Indonesia.',
    specs: {
      engineCc: '124.8cc / 156.9cc 4-Valve eSP+',
      fuelTank: '5.5 Liters',
      underSeatStorage: '18 Liters',
      transmission: 'Automatic V-Matic',
      weight: '112 kg - 117 kg',
      fuelEfficiency: '~50 km/Liter'
    },
    pricingEst: {
      daily: 'IDR 80,000 - IDR 120,000',
      weekly: 'IDR 480,000 - IDR 720,000',
      monthly: 'IDR 1,500,000 - IDR 2,200,000'
    },
    pros: [
      'Flat floorboard allows easy transport of groceries and daypacks',
      'Sharp handling with punchy acceleration off traffic lights',
      'Modern digital instrument cluster and smart key system',
      'Great fuel economy with 5.5L tank capacity'
    ],
    bestFor: 'Everyday commuting, city riding, medium road trips, and practical riders wanting a balance of power and agility.',
    recommendedAreas: ['Denpasar', 'Kuta', 'Seminyak', 'Sanur', 'Ubud', 'Canggu'],
    faqs: [
      {
        question: 'What is the difference between Vario 125 and Vario 160?',
        answer: 'The Vario 125 is ultra-nimble and fuel-efficient for solo and city riding, while the Vario 160 features a 4-valve 160cc engine with rear disc brakes, providing more passing power on highways.'
      }
    ]
  },
  {
    slug: 'honda-pcx',
    name: 'Honda PCX 160',
    brand: 'Honda',
    engine: '160cc 4-Valve eSP+',
    category: 'Maxi Scooter',
    title: 'Honda PCX 160 Rental Bali | Luxury Maxi Scooter Hire & Delivery',
    metaDescription: 'Rent the luxury Honda PCX 160 in Bali. Ultra-smooth riding, 30L underseat storage, Honda Selectable Torque Control (HSTC) & keyless smart entry.',
    heroHeadline: 'Honda PCX 160 Rental in Bali',
    description: 'The Honda PCX 160 is the gold standard of luxury scooter touring. With an expansive 30-liter storage trunk (the largest in its class), whisper-quiet 4-valve eSP+ engine, and sophisticated styling, the PCX delivers first-class comfort on every Bali mile.',
    specs: {
      engineCc: '156.9cc 4-Valve Liquid Cooled eSP+',
      fuelTank: '8.1 Liters',
      underSeatStorage: '30 Liters (Gigantic class-leading trunk)',
      transmission: 'Automatic V-Matic',
      weight: '132 kg',
      fuelEfficiency: '~45 km/Liter'
    },
    pricingEst: {
      daily: 'IDR 135,000 - IDR 165,000',
      weekly: 'IDR 820,000 - IDR 980,000',
      monthly: 'IDR 2,450,000 - IDR 3,000,000'
    },
    pros: [
      'Huge 30-liter under-seat storage fits helmets and backpacks with ease',
      'Massive 8.1L fuel tank offering 350+ km range per fill',
      'HSTC traction control prevents rear wheel slipping on wet roads',
      'Plush, wide dual seat with exceptional passenger back support'
    ],
    bestFor: 'Couples, luxury travelers, long-distance touring, and riders prioritizing smooth comfort and luggage capacity.',
    recommendedAreas: ['Nusa Dua', 'Sanur', 'Seminyak', 'Uluwatu', 'Ubud', 'Candidasa'],
    faqs: [
      {
        question: 'Is Honda PCX 160 or Yamaha NMAX better for Bali?',
        answer: 'Both are top-tier maxi scooters. The PCX 160 has a slightly softer, more luxurious ride and larger 30L luggage storage, while the NMAX has a sportier feel and aggressive stance.'
      }
    ]
  },
  {
    slug: 'honda-adv',
    name: 'Honda ADV 160',
    brand: 'Honda',
    engine: '160cc eSP+ Adventure',
    category: 'Adventure Scooter',
    title: 'Honda ADV 160 Rental Bali | Adventure Touring Scooter Hire',
    metaDescription: 'Rent the rugged Honda ADV 160 in Bali. High ground clearance, adjustable windshield, Showa twin sub-tank suspension & all-terrain semi-knobby tires.',
    heroHeadline: 'Honda ADV 160 Rental in Bali',
    description: 'The Honda ADV 160 is designed for the adventurous spirit who wants to explore beyond the paved roads. With high 165mm ground clearance, Showa rear shock absorbers, an adjustable 2-position windscreen, and all-terrain tires, it tackles rough village lanes and gravel tracks with supreme confidence.',
    specs: {
      engineCc: '156.9cc 4-Valve eSP+',
      fuelTank: '8.1 Liters',
      underSeatStorage: '30 Liters',
      transmission: 'Automatic V-Matic',
      weight: '133 kg',
      fuelEfficiency: '~45 km/Liter'
    },
    pricingEst: {
      daily: 'IDR 140,000 - IDR 175,000',
      weekly: 'IDR 850,000 - IDR 1,050,000',
      monthly: 'IDR 2,500,000 - IDR 3,200,000'
    },
    pros: [
      'High ground clearance protects chassis over bumps and potholes',
      'Showa suspension absorbs uneven volcanic cobblestones with ease',
      'Adjustable windscreen deflects highway wind and rain',
      'Aggressive adventure styling with emergency stop signal (ESS)'
    ],
    bestFor: 'Adventurous riders exploring northern waterfalls, East Bali coastal paths, and Bukit cliff tracks.',
    recommendedAreas: ['Uluwatu', 'Munduk', 'Amed', 'Bedugul', 'Sidemen', 'Jatiluwih'],
    faqs: [
      {
        question: 'Can the Honda ADV 160 handle off-road tracks in Bali?',
        answer: 'The ADV 160 easily handles gravel roads, broken village paths, and dirt trails to hidden beaches and waterfalls that lower city scooters struggle with.'
      }
    ]
  },
  {
    slug: 'yamaha-fazzio',
    name: 'Yamaha Fazzio 125',
    brand: 'Yamaha',
    engine: '125cc Blue Core Hybrid',
    category: 'Compact Automatic',
    title: 'Yamaha Fazzio Rental Bali | Hybrid Retro Scooter Hire & Delivery',
    metaDescription: 'Rent the Yamaha Fazzio 125 Hybrid in Bali. Classy neo-retro aesthetic, electric power assist, smart key & double carabiner luggage hooks.',
    heroHeadline: 'Yamaha Fazzio 125 Hybrid Rental in Bali',
    description: 'The Yamaha Fazzio 125 is the trendy neo-retro sensation in Bali. Powered by Yamaha’s Blue Core Hybrid system, the electric motor assists initial acceleration from a standstill, delivering a snappy, whisper-quiet start around town.',
    specs: {
      engineCc: '124.86cc Blue Core Hybrid SOHC',
      fuelTank: '5.1 Liters',
      underSeatStorage: '17.8 Liters',
      transmission: 'Automatic V-Belt',
      weight: '95 kg',
      fuelEfficiency: '~55 km/Liter'
    },
    pricingEst: {
      daily: 'IDR 80,000 - IDR 100,000',
      weekly: 'IDR 480,000 - IDR 600,000',
      monthly: 'IDR 1,450,000 - IDR 1,800,000'
    },
    pros: [
      'Hybrid electric assist provides smooth, instantaneous launch',
      'Dual carabiner hooks make carrying tote bags and surf ponchos easy',
      'Unique European neo-retro styling stands out in beach clubs',
      'Spacious footboard and light handling'
    ],
    bestFor: 'Cafe hoppers, lifestyle travelers, digital nomads, and city cruisers in Canggu, Seminyak & Ubud.',
    recommendedAreas: ['Canggu', 'Berawa', 'Seminyak', 'Pererenan', 'Ubud', 'Sanur'],
    faqs: [
      {
        question: 'How does the hybrid system in Yamaha Fazzio work?',
        answer: 'The Smart Motor Generator (SMG) acts as an electric power assist for the first 3 seconds when accelerating from a stop, boosting torque while reducing fuel consumption.'
      }
    ]
  },
  {
    slug: 'yamaha-aerox',
    name: 'Yamaha Aerox 155',
    brand: 'Yamaha',
    engine: '155cc VVA Liquid Cooled',
    category: 'Maxi Scooter',
    title: 'Yamaha Aerox 155 Rental Bali | Sport Maxi Scooter Hire & Delivery',
    metaDescription: 'Rent the sporty Yamaha Aerox 155 in Bali. Superbike-inspired styling, VVA power, wide rear tire & sharp sports handling. Book online with delivery.',
    heroHeadline: 'Yamaha Aerox 155 Rental in Bali',
    description: 'The Yamaha Aerox 155 is the ultimate sports scooter in Bali. Engineered with superbike racing DNA, wide 140mm rear tire, and the identical 155cc VVA powerplant as the R15 sportbike, the Aerox provides thrilling acceleration and razor-sharp handling on Bali’s coastal highways.',
    specs: {
      engineCc: '155cc Liquid Cooled SOHC 4-Valve VVA',
      fuelTank: '5.5 Liters',
      underSeatStorage: '25 Liters',
      transmission: 'Automatic V-Belt',
      weight: '122 kg',
      fuelEfficiency: '~43 km/Liter'
    },
    pricingEst: {
      daily: 'IDR 100,000 - IDR 135,000',
      weekly: 'IDR 600,000 - IDR 800,000',
      monthly: 'IDR 1,800,000 - IDR 2,400,000'
    },
    pros: [
      'Sportiest handling and most aggressive acceleration in the 150cc class',
      'Generous 25-liter under-seat storage',
      'Wide rear tire delivers superior grip when leaning into turns',
      'Striking aerodynamic bodywork'
    ],
    bestFor: 'Solo riders and sport enthusiasts who want high-performance thrills and aggressive road presence.',
    recommendedAreas: ['Kuta', 'Seminyak', 'Canggu', 'Sanur', 'Denpasar', 'Uluwatu'],
    faqs: [
      {
        question: 'Is Yamaha Aerox good for long road trips in Bali?',
        answer: 'Yes! The 155cc VVA engine offers plenty of passing power on open highways like Sunset Road and Ida Bagus Mantra By Pass.'
      }
    ]
  },
  {
    slug: 'vespa-primavera',
    name: 'Vespa Primavera 150',
    brand: 'Vespa',
    engine: '150cc i-get ABS',
    category: 'Retro Italian',
    title: 'Vespa Primavera 150 Rental Bali | Italian Luxury Scooter Hire',
    metaDescription: 'Rent an authentic Vespa Primavera 150 in Bali. Full steel monocoque body, Italian styling, ABS braking & premium leather saddle. Fast villa delivery.',
    heroHeadline: 'Vespa Primavera 150 Rental in Bali',
    description: 'The Vespa Primavera 150 is the epitome of timeless Italian elegance on Bali’s tropical streets. Built with a genuine pressed-steel monocoque body and powered by Piaggio’s smooth 150cc 3-valve i-get engine, riding a Primavera turns every ride into a cinematic experience.',
    specs: {
      engineCc: '154.8cc 4-Stroke 3-Valve i-get',
      fuelTank: '7.0 Liters',
      underSeatStorage: '16.5 Liters',
      transmission: 'Automatic CVT',
      weight: '120 kg (All-steel body)',
      fuelEfficiency: '~40 km/Liter'
    },
    pricingEst: {
      daily: 'IDR 180,000 - IDR 250,000',
      weekly: 'IDR 1,100,000 - IDR 1,500,000',
      monthly: 'IDR 3,500,000 - IDR 4,800,000'
    },
    pros: [
      'Unmatched prestige, beauty, and timeless Italian design',
      'Sturdy pressed-steel chassis provides rock-solid stability',
      'Smooth i-get engine with signature gentle exhaust note',
      'Front wheel ABS disc braking'
    ],
    bestFor: 'Style-conscious travelers, photo shoots, luxury villa stays, and romantic sunset cruising in Seminyak & Canggu.',
    recommendedAreas: ['Seminyak', 'Canggu', 'Berawa', 'Ubud', 'Uluwatu', 'Pererenan'],
    faqs: [
      {
        question: 'Is renting a Vespa more expensive than a Japanese scooter in Bali?',
        answer: 'Yes, genuine Vespas carry a slight premium due to their imported Italian heritage, full-steel construction, and high prestige value, starting around IDR 180,000/day.'
      }
    ]
  },
  {
    slug: 'vespa-sprint',
    name: 'Vespa Sprint 150',
    brand: 'Vespa',
    engine: '150cc i-get ABS',
    category: 'Retro Italian',
    title: 'Vespa Sprint 150 Rental Bali | Sport Classic Italian Scooter Hire',
    metaDescription: 'Rent a Vespa Sprint 150 in Bali. Iconic rectangular headlight, 12-inch sport alloy rims, 150cc i-get engine & front ABS. Book with doorstep villa delivery.',
    heroHeadline: 'Vespa Sprint 150 Rental in Bali',
    description: 'The Vespa Sprint 150 combines classic 1960s Italian racing heritage with modern technology. Distinguished by its signature angular headlight, 12-inch multi-spoke alloy wheels, and sporty saddle stitching, the Sprint delivers an exhilarating and undeniably stylish ride.',
    specs: {
      engineCc: '154.8cc 4-Stroke 3-Valve i-get',
      fuelTank: '7.0 Liters',
      underSeatStorage: '16.5 Liters',
      transmission: 'Automatic CVT',
      weight: '120 kg',
      fuelEfficiency: '~40 km/Liter'
    },
    pricingEst: {
      daily: 'IDR 190,000 - IDR 260,000',
      weekly: 'IDR 1,150,000 - IDR 1,600,000',
      monthly: 'IDR 3,600,000 - IDR 5,000,000'
    },
    pros: [
      'Striking rectangular headlight and aggressive sport accents',
      'Large 12-inch sport wheels improve high-speed stability',
      'All-steel body shell for durability and solid road feel',
      'USB phone charging port inside the front glove compartment'
    ],
    bestFor: 'Design lovers, luxury travelers, and riders seeking a prestigious, high-energy ride in Bali’s trendy hotspots.',
    recommendedAreas: ['Canggu', 'Seminyak', 'Berawa', 'Pererenan', 'Ubud', 'Uluwatu'],
    faqs: [
      {
        question: 'Do verified vendors provide helmets with Vespa rentals?',
        answer: 'Yes! All verified vendors on THE BIKE RENTAL BALI provide two clean, sanitized helmets (often color-matched vintage or modern open-face helmets) with every Vespa booking.'
      }
    ]
  }
];

export function getScooterModelBySlug(slug: string): ScooterModelSEO | undefined {
  const cleanSlug = slug.toLowerCase().replace('-rental-bali', '').replace('rent-', '').trim();
  return SCOOTER_MODELS.find(m => m.slug === cleanSlug || m.slug === slug);
}
