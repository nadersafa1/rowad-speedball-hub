import { faker } from '@faker-js/faker';
import { db } from './connection';
import { players, tests, testResults } from './schema';

// Configure faker for Arabic/Middle Eastern names but keep English for dates and numbers
faker.seed(12345); // For consistent data generation

// Seed configuration
const SEED_CONFIG = {
  players: 25,
  tests: 8,
  resultsPerTest: 12, // Average results per test
};

// Arabic names for more realistic Rowad club data
const ARABIC_FIRST_NAMES = {
  male: [
    'أحمد', 'محمد', 'عبدالله', 'خالد', 'سالم', 'فهد', 'عبدالعزيز', 'سعد', 'ناصر', 'عبدالرحمن',
    'يوسف', 'إبراهيم', 'عمر', 'علي', 'حسن', 'طارق', 'وليد', 'ماجد', 'بندر', 'تركي'
  ],
  female: [
    'فاطمة', 'نورا', 'سارة', 'ريم', 'هند', 'منال', 'أمل', 'رانيا', 'دانة', 'لينا',
    'شهد', 'جود', 'رؤى', 'غلا', 'مريم', 'زينب', 'هيا', 'نوف', 'رهف', 'ندى'
  ]
};

const ARABIC_LAST_NAMES = [
  'الأحمد', 'العتيبي', 'الشمري', 'القحطاني', 'الحربي', 'الدوسري', 'المطيري', 'العنزي',
  'الشهري', 'الغامدي', 'الزهراني', 'العسيري', 'الجهني', 'الخالدي', 'السعيد', 'الراشد',
  'البلوي', 'الثقفي', 'الصاعدي', 'النفيعي'
];

// Test names and descriptions
const TEST_DATA = [
  {
    name: 'بطولة الربيع للسرعة',
    description: 'بطولة فصلية لقياس سرعة الأداء في كرة السرعة',
    testType: '60_30' as const
  },
  {
    name: 'اختبار التحمل الصيفي',
    description: 'اختبار تحمل عالي الكثافة خلال فصل الصيف',
    testType: '30_30' as const
  },
  {
    name: 'تقييم المبتدئين الشهري',
    description: 'تقييم شهري للاعبين الجدد مع فترات راحة مناسبة',
    testType: '30_60' as const
  },
  {
    name: 'بطولة نهاية العام',
    description: 'البطولة السنوية الكبرى لنادي رواد',
    testType: '60_30' as const
  },
  {
    name: 'اختبار الدوري المحلي',
    description: 'اختبار تأهيلي للدوري المحلي',
    testType: '30_30' as const
  },
  {
    name: 'تجارب الفريق الوطني',
    description: 'اختبارات تجارب الانضمام للفريق الوطني',
    testType: '60_30' as const
  },
  {
    name: 'دورة التطوير الشتوية',
    description: 'دورة تدريبية تطويرية خلال فصل الشتاء',
    testType: '30_60' as const
  },
  {
    name: 'اختبار منتصف الموسم',
    description: 'تقييم منتصف الموسم لجميع المستويات',
    testType: '30_30' as const
  }
];

// Helper function to generate realistic age distributions
function generateRealisticAge(): Date {
  const ageRanges = [
    { min: 8, max: 12, weight: 20 },   // Youth
    { min: 13, max: 17, weight: 30 },  // Teens
    { min: 18, max: 25, weight: 25 },  // Young adults
    { min: 26, max: 35, weight: 20 },  // Adults
    { min: 36, max: 45, weight: 5 }    // Masters
  ];

  const totalWeight = ageRanges.reduce((sum, range) => sum + range.weight, 0);
  const randomWeight = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const range of ageRanges) {
    currentWeight += range.weight;
    if (randomWeight <= currentWeight) {
      const age = faker.number.int({ min: range.min, max: range.max });
      return faker.date.birthdate({ min: age, max: age, mode: 'age' });
    }
  }
  
  return faker.date.birthdate({ min: 18, max: 25, mode: 'age' });
}

// Helper function to generate realistic scores based on age and test type
function generateRealisticScore(age: number, testType: string, position: string): number {
  // Base score ranges by test type
  const baseRanges = {
    '60_30': { min: 15, max: 45 }, // High intensity
    '30_30': { min: 20, max: 50 }, // Balanced
    '30_60': { min: 25, max: 55 }  // Recovery focused
  };

  const range = baseRanges[testType as keyof typeof baseRanges] || baseRanges['30_30'];
  
  // Age factor (peak performance around 18-25)
  let ageFactor = 1.0;
  if (age < 12) ageFactor = 0.6;
  else if (age < 16) ageFactor = 0.8;
  else if (age < 18) ageFactor = 0.9;
  else if (age <= 25) ageFactor = 1.0;
  else if (age <= 30) ageFactor = 0.95;
  else if (age <= 35) ageFactor = 0.9;
  else ageFactor = 0.8;

  // Position factor (slight variations)
  const positionFactors = {
    'leftHand': 0.95,
    'rightHand': 1.0,
    'forehand': 1.05,
    'backhand': 0.9
  };

  const positionFactor = positionFactors[position as keyof typeof positionFactors] || 1.0;
  
  // Calculate base score with some randomness
  const baseScore = faker.number.int({ 
    min: Math.floor(range.min * ageFactor * positionFactor), 
    max: Math.floor(range.max * ageFactor * positionFactor) 
  });

  // Add performance variance (some players perform better/worse on specific days)
  const variance = faker.number.float({ min: 0.8, max: 1.2 });
  
  return Math.max(1, Math.floor(baseScore * variance));
}

// Helper function to calculate age from birth date
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Check if data already exists
    const existingPlayers = await db.select().from(players).limit(1);
    if (existingPlayers.length > 0) {
      console.log('📊 Database already contains data. Skipping seeding.');
      return;
    }

    // Seed Players
    console.log('👥 Seeding players...');
    const playerRecords = [];
    
    for (let i = 0; i < SEED_CONFIG.players; i++) {
      const gender = faker.helpers.arrayElement(['male', 'female'] as const);
      const firstName = faker.helpers.arrayElement(ARABIC_FIRST_NAMES[gender]);
      const lastName = faker.helpers.arrayElement(ARABIC_LAST_NAMES);
      const birthDate = generateRealisticAge();

      playerRecords.push({
        name: `${firstName} ${lastName}`,
        dateOfBirth: birthDate.toISOString().split('T')[0],
        gender,
        createdAt: faker.date.between({ from: '2023-01-01', to: '2024-12-01' }),
        updatedAt: new Date(),
      });
    }

    const insertedPlayers = await db.insert(players).values(playerRecords).returning();
    console.log(`✅ Created ${insertedPlayers.length} players`);

    // Seed Tests
    console.log('🏆 Seeding tests...');
    const testRecords = [];
    
    for (let i = 0; i < TEST_DATA.length; i++) {
      const testData = TEST_DATA[i];
      const conductedDate = faker.date.between({ 
        from: '2024-01-01', 
        to: '2024-12-31' 
      });

      testRecords.push({
        name: testData.name,
        testType: testData.testType,
        dateConducted: conductedDate.toISOString().split('T')[0],
        description: testData.description,
        createdAt: conductedDate,
        updatedAt: new Date(),
      });
    }

    const insertedTests = await db.insert(tests).values(testRecords).returning();
    console.log(`✅ Created ${insertedTests.length} tests`);

    // Seed Test Results
    console.log('📊 Seeding test results...');
    const resultRecords = [];
    
    for (const test of insertedTests) {
      // Select random players for each test (varying participation)
      const participantCount = faker.number.int({ 
        min: Math.floor(SEED_CONFIG.resultsPerTest * 0.7), 
        max: Math.floor(SEED_CONFIG.resultsPerTest * 1.3) 
      });
      
      const selectedPlayers = faker.helpers.arrayElements(
        insertedPlayers, 
        Math.min(participantCount, insertedPlayers.length)
      );

      for (const player of selectedPlayers) {
        const age = calculateAge(new Date(player.dateOfBirth));
        
        const leftHandScore = generateRealisticScore(age, test.testType, 'leftHand');
        const rightHandScore = generateRealisticScore(age, test.testType, 'rightHand');
        const forehandScore = generateRealisticScore(age, test.testType, 'forehand');
        const backhandScore = generateRealisticScore(age, test.testType, 'backhand');

        resultRecords.push({
          playerId: player.id,
          testId: test.id,
          leftHandScore,
          rightHandScore,
          forehandScore,
          backhandScore,
          createdAt: faker.date.between({ 
            from: test.dateConducted, 
            to: new Date(test.dateConducted + 'T23:59:59') 
          }),
          updatedAt: new Date(),
        });
      }
    }

    const insertedResults = await db.insert(testResults).values(resultRecords).returning();
    console.log(`✅ Created ${insertedResults.length} test results`);

    // Summary statistics
    console.log('\n📈 Seeding Summary:');
    console.log(`👥 Players: ${insertedPlayers.length}`);
    console.log(`🏆 Tests: ${insertedTests.length}`);
    console.log(`📊 Results: ${insertedResults.length}`);
    
    // Age group distribution
    const ageGroups = insertedPlayers.reduce((acc: Record<string, number>, player) => {
      const age = calculateAge(new Date(player.dateOfBirth));
      let ageGroup = 'Senior';
      if (age < 10) ageGroup = 'U10';
      else if (age < 12) ageGroup = 'U12';
      else if (age < 14) ageGroup = 'U14';
      else if (age < 16) ageGroup = 'U16';
      else if (age < 18) ageGroup = 'U18';
      else if (age < 21) ageGroup = 'U21';
      
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
      return acc;
    }, {});

    console.log('👶 Age Group Distribution:');
    Object.entries(ageGroups).forEach(([group, count]) => {
      console.log(`   ${group}: ${count} players`);
    });

    // Gender distribution
    const genderStats = insertedPlayers.reduce((acc: Record<string, number>, player) => {
      acc[player.gender] = (acc[player.gender] || 0) + 1;
      return acc;
    }, {});

    console.log('⚥ Gender Distribution:');
    Object.entries(genderStats).forEach(([gender, count]) => {
      console.log(`   ${gender}: ${count} players`);
    });

    // Test type distribution
    const testTypeStats = insertedTests.reduce((acc: Record<string, number>, test) => {
      acc[test.testType] = (acc[test.testType] || 0) + 1;
      return acc;
    }, {});

    console.log('🏃 Test Type Distribution:');
    Object.entries(testTypeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} tests`);
    });

    console.log('\n🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Only run seeding in development environment
if (process.env.NODE_ENV !== 'production') {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding script failed:', error);
      process.exit(1);
    });
} else {
  console.log('⚠️  Seeding skipped in production environment');
}
