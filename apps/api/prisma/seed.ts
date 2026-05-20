import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MV2 database...');

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.tokenLedger.deleteMany();
  await prisma.localProfile.deleteMany();
  await prisma.application.deleteMany();
  await prisma.tenantMembership.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ───────────────────────────────────────────────────────

  const adminMike = await prisma.user.create({
    data: {
      phone: '+12125551001',
      email: 'mike@brooklynrunclub.com',
      globalDisplayName: 'Coach Mike',
      globalBio: 'Running coach and community builder in Brooklyn.',
      gender: 'Male',
      verificationState: 'VERIFIED',
      dateOfBirth: new Date('1988-03-15'),
    },
  });

  const adminPreeti = await prisma.user.create({
    data: {
      phone: '+12125551002',
      email: 'preeti@techsingles.com',
      globalDisplayName: 'Preeti S.',
      globalBio: 'Tech founder connecting NYC professionals.',
      gender: 'Female',
      verificationState: 'VERIFIED',
      dateOfBirth: new Date('1990-07-22'),
    },
  });

  const adminOmar = await prisma.user.create({
    data: {
      phone: '+12125551003',
      email: 'omar@mprofessionals.com',
      globalDisplayName: 'Omar K.',
      globalBio: 'Building community for Muslim professionals in Manhattan.',
      gender: 'Male',
      verificationState: 'VERIFIED',
      dateOfBirth: new Date('1985-11-08'),
    },
  });

  const adminLena = await prisma.user.create({
    data: {
      phone: '+12125551004',
      email: 'lena@creatives.com',
      globalDisplayName: 'Lena W.',
      globalBio: 'Artist and curator in Williamsburg.',
      gender: 'Female',
      verificationState: 'VERIFIED',
      dateOfBirth: new Date('1992-01-30'),
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        phone: '+12125552001',
        globalDisplayName: 'Sarah M.',
        globalBio: 'Sunset runner & dog mom.',
        gender: 'Female',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1997-06-14'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552002',
        globalDisplayName: 'James L.',
        globalBio: 'Marathon runner and software engineer.',
        gender: 'Male',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1995-09-02'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552003',
        globalDisplayName: 'Aisha R.',
        globalBio: 'Building my startup by day, running by dawn.',
        gender: 'Female',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1998-02-19'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552004',
        globalDisplayName: 'David K.',
        globalBio: 'Product designer who loves trail running.',
        gender: 'Male',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1994-12-05'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552005',
        globalDisplayName: 'Maya T.',
        globalBio: 'Photographer and weekend hiker.',
        gender: 'Female',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1996-04-11'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552006',
        globalDisplayName: 'Chris P.',
        globalBio: 'Startup founder. Coffee enthusiast. 10K PR: 42min.',
        gender: 'Male',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1993-08-27'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552007',
        globalDisplayName: 'Fatima A.',
        globalBio: 'Lawyer by day, artist by night.',
        gender: 'Female',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1995-05-03'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552008',
        globalDisplayName: 'Ryan O.',
        globalBio: 'Architect and amateur chef.',
        gender: 'Male',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1991-10-16'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552009',
        globalDisplayName: 'Nadia H.',
        globalBio: 'Marketing lead. Bookworm. Dog person.',
        gender: 'Female',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1997-01-25'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552010',
        globalDisplayName: 'Alex W.',
        globalBio: 'Painter and gallery curator in Bushwick.',
        gender: 'Male',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1994-07-08'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552011',
        globalDisplayName: 'Priya M.',
        globalBio: 'Data scientist. Love hiking and board games.',
        gender: 'Female',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1996-11-30'),
      },
    }),
    prisma.user.create({
      data: {
        phone: '+12125552012',
        globalDisplayName: 'Marcus J.',
        globalBio: 'Teacher and basketball coach. Family-oriented.',
        gender: 'Male',
        verificationState: 'VERIFIED',
        dateOfBirth: new Date('1990-03-22'),
      },
    }),
  ]);

  // ─── Tenants (Communities) ───────────────────────────────────────

  const brooklynRunClub = await prisma.tenant.create({
    data: {
      slug: 'brooklyn-runners',
      name: 'Brooklyn Run Club Singles',
      description: 'A dating pool for the Brooklyn running community. Lace up and find your match.',
      adminUserId: adminMike.id,
      adminPseudonym: 'Coach Mike',
      geographicAnchor: 'Brooklyn, NY',
      accentColor: '#E63946',
      themeMode: 'DARK',
      layoutType: 'PROMPT_FIRST_FEED',
      anchorLink: 'https://chat.whatsapp.com/brooklynrunclub',
      welcomeMessage: 'Welcome to Brooklyn Run Club Singles! Check out profiles and find someone to run with (and maybe more).',
      pricingType: 'SUBSCRIPTION',
      subscriptionPrice: 9.99,
      acceptsPassport: true,
      gatekeeperQuestions: [
        { id: 'q1', text: 'What is your average pace per mile?', type: 'FREE_TEXT' },
        { id: 'q2', text: 'How long have you been part of BRC?', type: 'MULTIPLE_CHOICE', options: ['< 6 months', '6-12 months', '1-2 years', '2+ years'] },
        { id: 'q3', text: 'Link your Strava profile', type: 'URL' },
      ],
      communityRules: [
        { id: 'r1', text: 'Be respectful in all interactions', order: 1 },
        { id: 'r2', text: 'No unsolicited explicit content', order: 2 },
        { id: 'r3', text: 'Must be an active runner (at least 1 run/week)', order: 3 },
        { id: 'r4', text: 'Report any harassment immediately', order: 4 },
      ],
      customTags: [
        { id: 't1', name: 'Pace', type: 'METRIC', options: ['< 7:00/mi', '7:00-8:30/mi', '8:30-10:00/mi', '10:00+/mi'] },
        { id: 't2', name: 'Distance', type: 'METRIC', options: ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra'] },
        { id: 't3', name: 'Running Style', type: 'CATEGORICAL', options: ['Morning Runner', 'Evening Runner', 'Weekend Warrior', 'Daily Streak'] },
      ],
    },
  });

  const nycTechFounders = await prisma.tenant.create({
    data: {
      slug: 'nyc-tech-founders',
      name: 'NYC Tech Founders Dating',
      description: 'A curated dating pool for tech founders and startup professionals in NYC.',
      adminUserId: adminPreeti.id,
      adminPseudonym: 'Preeti',
      geographicAnchor: 'Manhattan, NY',
      accentColor: '#4F46E5',
      themeMode: 'DARK',
      layoutType: 'CURATED_MATCH_QUEUE',
      anchorLink: 'https://discord.gg/nyctechfounders',
      welcomeMessage: 'Welcome to NYC Tech Founders Dating! Our matchmakers will curate your matches based on compatibility.',
      pricingType: 'FREE',
      matchmakerEnabled: true,
      gatekeeperQuestions: [
        { id: 'q1', text: 'What company are you building or working at?', type: 'FREE_TEXT' },
        { id: 'q2', text: 'Link your LinkedIn profile', type: 'URL' },
      ],
      communityRules: [
        { id: 'r1', text: 'Be genuine about your professional background', order: 1 },
        { id: 'r2', text: 'Respect boundaries and consent', order: 2 },
        { id: 'r3', text: 'No recruiting or business solicitation', order: 3 },
      ],
      customTags: [
        { id: 't1', name: 'Stage', type: 'CATEGORICAL', options: ['Pre-seed', 'Seed', 'Series A+', 'Established'] },
        { id: 't2', name: 'Industry', type: 'CATEGORICAL', options: ['SaaS', 'Fintech', 'Health', 'AI/ML', 'Consumer', 'Other'] },
      ],
    },
  });

  const manhattanMuslim = await prisma.tenant.create({
    data: {
      slug: 'manhattan-muslim-pros',
      name: 'Manhattan Muslim Professionals',
      description: 'A faith-centered matrimonial network for Muslim professionals in Manhattan.',
      adminUserId: adminOmar.id,
      adminPseudonym: 'Omar',
      geographicAnchor: 'Manhattan, NY',
      accentColor: '#059669',
      themeMode: 'DARK',
      layoutType: 'CURATED_MATCH_QUEUE',
      anchorLink: 'https://chat.whatsapp.com/manhattanmuslimpros',
      welcomeMessage: 'Assalamu Alaikum! Welcome to our matrimonial network. May you find your naseeb here.',
      pricingType: 'SUBSCRIPTION',
      subscriptionPrice: 14.99,
      acceptsPassport: true,
      matchmakerEnabled: true,
      gatekeeperQuestions: [
        { id: 'q1', text: 'Tell us about yourself and what you are looking for', type: 'FREE_TEXT' },
        { id: 'q2', text: 'How did you hear about this community?', type: 'MULTIPLE_CHOICE', options: ['Friend referral', 'WhatsApp group', 'Social media', 'Mosque community', 'Other'] },
      ],
      communityRules: [
        { id: 'r1', text: 'Maintain Islamic etiquette in all interactions', order: 1 },
        { id: 'r2', text: 'Be honest about your intentions and background', order: 2 },
        { id: 'r3', text: 'Respect privacy - do not share profiles externally', order: 3 },
        { id: 'r4', text: 'Family involvement is welcomed and encouraged', order: 4 },
        { id: 'r5', text: 'Report any misconduct to the admin immediately', order: 5 },
      ],
      customTags: [
        { id: 't1', name: 'Religiosity', type: 'CATEGORICAL', options: ['Very Practicing', 'Practicing', 'Moderate', 'Cultural'] },
        { id: 't2', name: 'Family Values', type: 'SOCIAL', options: ['Traditional', 'Modern Traditional', 'Progressive'] },
      ],
    },
  });

  const williamsburgCreatives = await prisma.tenant.create({
    data: {
      slug: 'wburg-creatives',
      name: 'Williamsburg Creatives',
      description: 'Dating for artists, musicians, writers, and creative souls in Williamsburg.',
      adminUserId: adminLena.id,
      adminPseudonym: 'Lena',
      geographicAnchor: 'Williamsburg, Brooklyn, NY',
      accentColor: '#D946EF',
      themeMode: 'DARK',
      layoutType: 'GRID_SINGLES_ROSTER',
      anchorLink: 'https://partiful.com/wburgcreatives',
      welcomeMessage: 'Welcome to the creative dating scene! Browse profiles and find your muse.',
      pricingType: 'FREE',
      gatekeeperQuestions: [
        { id: 'q1', text: 'What is your creative medium?', type: 'MULTIPLE_CHOICE', options: ['Visual Art', 'Music', 'Writing', 'Film', 'Photography', 'Design', 'Other'] },
        { id: 'q2', text: 'Share a link to your portfolio or work', type: 'URL' },
      ],
      communityRules: [
        { id: 'r1', text: 'Be authentic and kind', order: 1 },
        { id: 'r2', text: 'No hate speech or discrimination', order: 2 },
        { id: 'r3', text: 'Support fellow creatives', order: 3 },
      ],
      customTags: [
        { id: 't1', name: 'Medium', type: 'CATEGORICAL', options: ['Visual Art', 'Music', 'Writing', 'Film', 'Photography', 'Design'] },
        { id: 't2', name: 'Vibe', type: 'SOCIAL', options: ['Chill', 'Adventurous', 'Intellectual', 'Free-spirited'] },
      ],
    },
  });

  // ─── Memberships + Local Profiles ────────────────────────────────

  const allTenants = [brooklynRunClub, nycTechFounders, manhattanMuslim, williamsburgCreatives];

  // Assign users to communities with memberships and profiles
  const profileData = [
    {
      user: users[0], // Sarah M.
      tenants: [brooklynRunClub, nycTechFounders],
      profiles: {
        [brooklynRunClub.id]: {
          displayName: 'Sarah M.',
          age: 27,
          bio: 'Sunset runner & dog mom. Looking for someone who can keep up on the trail and in conversation.',
          prompts: [
            { question: 'My ideal Sunday is...', answer: 'Long run in Prospect Park, brunch at my favorite spot, then a sunset walk by the river.' },
            { question: 'A dealbreaker for me is...', answer: "Someone who can't laugh at themselves." },
          ],
          customTags: { pace: '8:30/mi', distance: 'Half Marathon', runningStyle: 'Morning Runner' },
        },
        [nycTechFounders.id]: {
          displayName: 'Sarah M.',
          age: 27,
          bio: 'Designer at an early-stage startup. Passionate about building products people love.',
          prompts: [
            { question: 'What excites me about tech is...', answer: 'The ability to create something from nothing and watch it grow.' },
          ],
          customTags: { stage: 'Seed', industry: 'Consumer' },
        },
      },
    },
    {
      user: users[1], // James L.
      tenants: [brooklynRunClub],
      profiles: {
        [brooklynRunClub.id]: {
          displayName: 'James L.',
          age: 29,
          bio: 'Marathon runner and software engineer. Equal parts competitive and nerdy.',
          prompts: [
            { question: 'My ideal Sunday is...', answer: 'Early morning long run, farmers market, then coding a side project.' },
            { question: 'I geek out about...', answer: 'Running data, split times, and whether my VO2 max is improving.' },
          ],
          customTags: { pace: '7:00-8:30/mi', distance: 'Marathon', runningStyle: 'Daily Streak' },
        },
      },
    },
    {
      user: users[2], // Aisha R.
      tenants: [nycTechFounders, manhattanMuslim],
      profiles: {
        [nycTechFounders.id]: {
          displayName: 'Aisha R.',
          age: 26,
          bio: 'Building my startup by day, running by dawn. Community > competition.',
          prompts: [
            { question: 'What excites me about tech is...', answer: 'Using technology to solve real problems for underserved communities.' },
          ],
          customTags: { stage: 'Pre-seed', industry: 'Health' },
        },
        [manhattanMuslim.id]: {
          displayName: 'Aisha R.',
          age: 26,
          bio: 'Founder, community builder, lifelong learner. Looking for a partner who values faith and ambition equally.',
          prompts: [
            { question: 'What matters most to me in a partner is...', answer: 'Kindness, ambition, and a shared commitment to faith and family.' },
            { question: 'My family would describe me as...', answer: 'The driven one who always brings everyone together.' },
          ],
          customTags: { religiosity: 'Practicing', familyValues: 'Modern Traditional' },
        },
      },
    },
    {
      user: users[3], // David K.
      tenants: [brooklynRunClub, williamsburgCreatives],
      profiles: {
        [brooklynRunClub.id]: {
          displayName: 'David K.',
          age: 30,
          bio: 'Product designer who loves trail running. Will design you a custom running playlist.',
          prompts: [
            { question: 'My ideal Sunday is...', answer: 'Trail run upstate, then a cozy afternoon sketching at a cafe.' },
          ],
          customTags: { pace: '8:30-10:00/mi', distance: '10K', runningStyle: 'Weekend Warrior' },
        },
        [williamsburgCreatives.id]: {
          displayName: 'David K.',
          age: 30,
          bio: 'Product designer by trade, illustrator by passion. Always sketching.',
          prompts: [
            { question: 'My creative inspiration is...', answer: 'Architecture, nature, and the chaos of New York City.' },
          ],
          customTags: { medium: 'Design', vibe: 'Chill' },
        },
      },
    },
    {
      user: users[4], // Maya T.
      tenants: [williamsburgCreatives],
      profiles: {
        [williamsburgCreatives.id]: {
          displayName: 'Maya T.',
          age: 28,
          bio: 'Photographer and weekend hiker. I see beauty in the mundane.',
          prompts: [
            { question: 'My creative inspiration is...', answer: 'Light. The way it falls on a city street at golden hour.' },
          ],
          customTags: { medium: 'Photography', vibe: 'Free-spirited' },
        },
      },
    },
    {
      user: users[5], // Chris P.
      tenants: [nycTechFounders, brooklynRunClub],
      profiles: {
        [nycTechFounders.id]: {
          displayName: 'Chris P.',
          age: 31,
          bio: 'Startup founder. Coffee enthusiast. Believer in building things that matter.',
          prompts: [
            { question: 'What excites me about tech is...', answer: 'The relentless pace of innovation and the people I get to build with.' },
          ],
          customTags: { stage: 'Series A+', industry: 'SaaS' },
        },
        [brooklynRunClub.id]: {
          displayName: 'Chris P.',
          age: 31,
          bio: 'Morning runner and startup founder. 10K PR: 42min.',
          prompts: [
            { question: 'My ideal Sunday is...', answer: 'Sub-45 10K in the park, then second breakfast.' },
          ],
          customTags: { pace: '7:00-8:30/mi', distance: '10K', runningStyle: 'Morning Runner' },
        },
      },
    },
    {
      user: users[6], // Fatima A.
      tenants: [manhattanMuslim],
      profiles: {
        [manhattanMuslim.id]: {
          displayName: 'Fatima A.',
          age: 29,
          bio: 'Lawyer by day, artist by night. Looking for someone thoughtful and grounded.',
          prompts: [
            { question: 'What matters most to me in a partner is...', answer: 'Emotional intelligence, a sense of humor, and shared values.' },
            { question: 'My family would describe me as...', answer: 'The quiet, thoughtful one who surprises everyone with her wit.' },
          ],
          customTags: { religiosity: 'Practicing', familyValues: 'Traditional' },
        },
      },
    },
    {
      user: users[7], // Ryan O.
      tenants: [williamsburgCreatives, brooklynRunClub],
      profiles: {
        [williamsburgCreatives.id]: {
          displayName: 'Ryan O.',
          age: 33,
          bio: 'Architect and amateur chef. I design buildings and dinner menus.',
          prompts: [
            { question: 'My creative inspiration is...', answer: 'Brutalist architecture and Japanese ceramics.' },
          ],
          customTags: { medium: 'Design', vibe: 'Intellectual' },
        },
        [brooklynRunClub.id]: {
          displayName: 'Ryan O.',
          age: 33,
          bio: 'Architect who runs to clear his head. Slow and steady wins the race.',
          prompts: [
            { question: 'My ideal Sunday is...', answer: 'Easy jog along the waterfront, then cooking something elaborate.' },
          ],
          customTags: { pace: '10:00+/mi', distance: '5K', runningStyle: 'Evening Runner' },
        },
      },
    },
    {
      user: users[8], // Nadia H.
      tenants: [nycTechFounders, manhattanMuslim],
      profiles: {
        [nycTechFounders.id]: {
          displayName: 'Nadia H.',
          age: 27,
          bio: 'Marketing lead at a fintech startup. Bookworm. Dog person.',
          prompts: [
            { question: 'What excites me about tech is...', answer: 'How it democratizes access to financial services.' },
          ],
          customTags: { stage: 'Seed', industry: 'Fintech' },
        },
        [manhattanMuslim.id]: {
          displayName: 'Nadia H.',
          age: 27,
          bio: 'Marketing professional who loves reading, cooking, and deep conversations about faith.',
          prompts: [
            { question: 'What matters most to me in a partner is...', answer: 'Someone who prays, laughs easily, and values growth.' },
          ],
          customTags: { religiosity: 'Very Practicing', familyValues: 'Traditional' },
        },
      },
    },
    {
      user: users[9], // Alex W.
      tenants: [williamsburgCreatives],
      profiles: {
        [williamsburgCreatives.id]: {
          displayName: 'Alex W.',
          age: 30,
          bio: 'Painter and gallery curator in Bushwick. Always covered in paint.',
          prompts: [
            { question: 'My creative inspiration is...', answer: 'Color theory and the emotional weight of abstract expressionism.' },
          ],
          customTags: { medium: 'Visual Art', vibe: 'Adventurous' },
        },
      },
    },
    {
      user: users[10], // Priya M.
      tenants: [nycTechFounders],
      profiles: {
        [nycTechFounders.id]: {
          displayName: 'Priya M.',
          age: 28,
          bio: 'Data scientist. Love hiking, board games, and building ML models.',
          prompts: [
            { question: 'What excites me about tech is...', answer: 'Making sense of messy data and uncovering patterns that change decisions.' },
          ],
          customTags: { stage: 'Established', industry: 'AI/ML' },
        },
      },
    },
    {
      user: users[11], // Marcus J.
      tenants: [brooklynRunClub],
      profiles: {
        [brooklynRunClub.id]: {
          displayName: 'Marcus J.',
          age: 34,
          bio: 'Teacher and basketball coach. Running is my meditation. Family-oriented.',
          prompts: [
            { question: 'My ideal Sunday is...', answer: 'Church, family brunch, then an easy run in the park with music.' },
            { question: 'A dealbreaker for me is...', answer: 'Someone who is not kind to service workers.' },
          ],
          customTags: { pace: '8:30-10:00/mi', distance: '5K', runningStyle: 'Weekend Warrior' },
        },
      },
    },
  ];

  for (const pd of profileData) {
    for (const tenant of pd.tenants) {
      // Create membership
      await prisma.tenantMembership.create({
        data: {
          userId: pd.user.id,
          tenantId: tenant.id,
          status: 'ACTIVE',
          approvedBy: tenant.adminUserId,
        },
      });

      // Create local profile
      const profile = pd.profiles[tenant.id];
      if (profile) {
        await prisma.localProfile.create({
          data: {
            userId: pd.user.id,
            tenantId: tenant.id,
            displayName: profile.displayName,
            age: profile.age,
            bio: profile.bio,
            prompts: profile.prompts,
            customTags: profile.customTags,
          },
        });
      }
    }
  }

  // ─── Some Pending Applications ───────────────────────────────────

  // Users[10] (Priya) applying to Brooklyn Run Club
  await prisma.application.create({
    data: {
      userId: users[10].id,
      tenantId: brooklynRunClub.id,
      answers: {
        q1: '9:15/mi',
        q2: '< 6 months',
        q3: 'https://strava.com/athletes/priya',
      },
      status: 'PENDING',
    },
  });

  // Users[11] (Marcus) applying to Manhattan Muslim Professionals
  await prisma.application.create({
    data: {
      userId: users[11].id,
      tenantId: manhattanMuslim.id,
      answers: {
        q1: 'Teacher and basketball coach. Family-oriented and faith-driven.',
        q2: 'Friend referral',
      },
      status: 'PENDING',
    },
  });

  // ─── Some Matches ────────────────────────────────────────────────

  await prisma.match.create({
    data: {
      tenantId: brooklynRunClub.id,
      userAId: users[0].id, // Sarah
      userBId: users[1].id, // James
      state: 'MUTUAL',
    },
  });

  await prisma.match.create({
    data: {
      tenantId: nycTechFounders.id,
      userAId: users[2].id, // Aisha
      userBId: users[5].id, // Chris
      state: 'MUTUAL',
    },
  });

  // ─── Some Conversations & Messages ───────────────────────────────

  const conv1 = await prisma.conversation.create({
    data: {
      tenantId: brooklynRunClub.id,
      participantIds: [users[0].id, users[1].id],
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: users[1].id,
        content: 'Hey Sarah! Saw you run the Brooklyn Half last month. What was your time?',
        createdAt: new Date('2026-05-15T10:30:00Z'),
      },
      {
        conversationId: conv1.id,
        senderId: users[0].id,
        content: "Hey James! 1:52 - I was aiming for sub-1:50 but the hills got me. You?",
        createdAt: new Date('2026-05-15T10:45:00Z'),
      },
      {
        conversationId: conv1.id,
        senderId: users[1].id,
        content: "1:38! But I've been training for a full marathon so my mileage base helped. Want to do a training run together sometime?",
        createdAt: new Date('2026-05-15T11:00:00Z'),
      },
      {
        conversationId: conv1.id,
        senderId: users[0].id,
        content: "I'd love that! Saturday morning work? I usually start from Grand Army Plaza around 7am.",
        createdAt: new Date('2026-05-15T11:15:00Z'),
      },
    ],
  });

  const conv2 = await prisma.conversation.create({
    data: {
      tenantId: nycTechFounders.id,
      participantIds: [users[2].id, users[5].id],
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv2.id,
        senderId: users[5].id,
        content: "Hi Aisha! Your healthtech startup sounds really interesting. What problem are you tackling?",
        createdAt: new Date('2026-05-16T14:00:00Z'),
      },
      {
        conversationId: conv2.id,
        senderId: users[2].id,
        content: "Thanks Chris! We're building accessible mental health tools for underserved communities. What's your SaaS about?",
        createdAt: new Date('2026-05-16T14:20:00Z'),
      },
    ],
  });

  // ─── Announcements ───────────────────────────────────────────────

  await prisma.announcement.create({
    data: {
      tenantId: brooklynRunClub.id,
      title: 'Summer Mixer Event',
      body: 'Join us for our first IRL singles mixer at Prospect Park on June 15th! Running + socializing + maybe sparks. RSVP below.',
      isPinned: true,
      ticketUrl: 'https://partiful.com/e/brc-summer-mixer',
    },
  });

  await prisma.announcement.create({
    data: {
      tenantId: manhattanMuslim.id,
      title: 'Community Iftar + Singles Meetup',
      body: 'We are hosting a community iftar and singles meetup at the Islamic Center on July 1st. Families welcome.',
      isPinned: true,
    },
  });

  console.log('Seed complete!');
  console.log(`Created ${4} admins, ${users.length} users, ${allTenants.length} communities`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
