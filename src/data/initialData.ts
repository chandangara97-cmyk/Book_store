import { Book, StageInfo } from '../types';
import { bookCover, photo } from '../utils/images';
import TOY_COVER from '../assets/images/futuristic_learning_toy_1793017195881.jpg';

export const STAGES: StageInfo[] = [
  {
    name: 'Ages 0 to 3',
    minAge: 0,
    maxAge: 3,
    color: 'var(--sun)',
    hex: '#ffc83d',
    description: 'Short, bright pages for sharing out loud: first words, shapes and daily routines.',
    image: photo('baby,toddler,toys', 101, '/img/stage-0.svg', 480, 320),
  },
  {
    name: 'Ages 4 to 7',
    minAge: 4,
    maxAge: 7,
    color: 'var(--pink)',
    hex: '#ff7aa2',
    description: 'Letters, numbers and simple stories that turn learning into a daily habit.',
    image: photo('children,reading', 102, '/img/stage-1.svg', 480, 320),
  },
  {
    name: 'Ages 8 to 12',
    minAge: 8,
    maxAge: 12,
    color: 'var(--sky)',
    hex: '#6cb8ff',
    description: 'Tutorials that stretch curiosity, from problem solving to how the world works.',
    image: photo('kids,science,learning', 103, '/img/stage-2.svg', 480, 320),
  },
  {
    name: 'Ages 13 to 15',
    minAge: 13,
    maxAge: 15,
    color: 'var(--mint)',
    hex: '#4fd6a6',
    description: 'Practical guides for study skills, planning and growing independence.',
    image: photo('teenager,studying', 104, '/img/stage-3.svg', 480, 320),
  },
];

// Interactive tutorial books shown on the age finder
export const TUTORIAL_BOOKS: Book[] = [
  {
    id: 'my-first-words',
    title: 'My First Words',
    author: 'Kiddie Bloom Studio',
    price: 299,
    printedPrice: 299,
    digitalPrice: 149,
    cover: photo('baby,toy', 11, undefined, 480, 320),
    emoji: '📖',
    category: 'children',
    minAge: 0,
    maxAge: 3,
    blurb: 'Everyday words, colours and shapes for babies and toddlers.',
    description: 'Designed specifically for little fingers and growing vocabularies. High-contrast shapes and everyday objects encourage shared bonding moments.',
    tags: ['Ages 0-3', 'Early Learning', 'First Words'],
    type: 'book'
  },
  {
    id: 'little-hands-big-ideas',
    title: 'Little Hands, Big Ideas',
    author: 'Kiddie Bloom Studio',
    price: 349,
    printedPrice: 349,
    digitalPrice: 179,
    cover: photo('toddler,play', 12, undefined, 480, 320),
    emoji: '🎨',
    category: 'children',
    minAge: 1,
    maxAge: 3,
    blurb: 'Simple activities that build early movement and counting skills.',
    description: 'Hands-on sensory games and gentle motor skill exercises crafted to develop early spatial awareness and curiosity.',
    tags: ['Ages 0-3', 'Sensory Play', 'Counting'],
    type: 'book'
  },
  {
    id: 'learn-and-play-4-7',
    title: 'Learn and Play 4 to 7',
    author: 'Kiddie Bloom Studio',
    price: 399,
    printedPrice: 399,
    digitalPrice: 199,
    cover: photo('children,puzzle', 13, undefined, 480, 320),
    emoji: '🧩',
    category: 'children',
    minAge: 4,
    maxAge: 7,
    blurb: 'Letters, numbers and short stories to practise together.',
    description: 'Fun phonics and counting games woven directly into endearing bedtime tales parents and children can read side-by-side.',
    tags: ['Ages 4-7', 'Phonics', 'Storytime'],
    type: 'book'
  },
  {
    id: 'reading-steps',
    title: 'Reading Steps',
    author: 'Kiddie Bloom Studio',
    price: 379,
    printedPrice: 379,
    digitalPrice: 189,
    cover: photo('child,reading,book', 14, undefined, 480, 320),
    emoji: '📚',
    category: 'children',
    minAge: 5,
    maxAge: 7,
    blurb: 'A gentle guide to reading and writing, one small step at a time.',
    description: 'Step-by-step reading confidence booster featuring guided vocabulary ladders and cheerful achievements.',
    tags: ['Ages 4-7', 'Early Reader', 'Writing'],
    type: 'book'
  },
  {
    id: 'think-and-solve',
    title: 'Think and Solve',
    author: 'Kiddie Bloom Studio',
    price: 449,
    printedPrice: 449,
    digitalPrice: 229,
    cover: photo('kids,learning', 15, undefined, 480, 320),
    emoji: '💡',
    category: 'learning',
    minAge: 8,
    maxAge: 12,
    blurb: 'Puzzles and tutorials that grow reasoning and confidence.',
    description: 'Riddles, logic labyrinths and approachable real-world problems that turn trial and error into a thrilling adventure.',
    tags: ['Ages 8-12', 'Puzzles', 'Logic'],
    type: 'book'
  },
  {
    id: 'explore-the-world',
    title: 'Explore the World',
    author: 'Kiddie Bloom Studio',
    price: 429,
    printedPrice: 429,
    digitalPrice: 219,
    cover: photo('world,map,globe', 16, undefined, 480, 320),
    emoji: '🌍',
    category: 'learning',
    minAge: 8,
    maxAge: 12,
    blurb: 'Science, maps and big questions explained clearly.',
    description: 'From ocean depths to outer space constellations, discover foundational science and geography through rich illustrations.',
    tags: ['Ages 8-12', 'Science', 'Geography'],
    type: 'book'
  },
  {
    id: 'study-smart',
    title: 'Study Smart',
    author: 'Kiddie Bloom Studio',
    price: 499,
    printedPrice: 499,
    digitalPrice: 249,
    cover: photo('student,studying', 17, undefined, 480, 320),
    emoji: '📝',
    category: 'learning',
    minAge: 13,
    maxAge: 15,
    blurb: 'Practical routines for notes, exams and focus.',
    description: 'Evidence-based study techniques: Feynman method, spaced repetition, distraction management, and calm exam preparation.',
    tags: ['Ages 13-15', 'Study Skills', 'Focus'],
    type: 'book'
  },
  {
    id: 'skills-for-tomorrow',
    title: 'Skills for Tomorrow',
    author: 'Kiddie Bloom Studio',
    price: 479,
    printedPrice: 479,
    digitalPrice: 239,
    cover: photo('teenager,laptop', 18, undefined, 480, 320),
    emoji: '🚀',
    category: 'learning',
    minAge: 13,
    maxAge: 15,
    blurb: 'Communication, money basics and planning for teens.',
    description: 'Life skills simplified: budgeting, effective interpersonal communication, self-advocacy, and setting achievable teenage goals.',
    tags: ['Ages 13-15', 'Life Skills', 'Finance'],
    type: 'book'
  },
];

// Full store catalogue books
export const INITIAL_BOOKS: Book[] = [
  // Fiction
  {
    id: 'the-silent-patient',
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    price: 399,
    cover: bookCover('9781250301697', 'the-silent-patient'),
    category: 'fiction',
    description: 'A shocking psychological thriller of a woman’s act of violence against her husband—and of the therapist obsessed with uncovering her motive.',
    tags: ['Thriller', 'Mystery', 'Bestseller'],
    type: 'book'
  },
  {
    id: 'where-the-crawdads-sing',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    price: 399,
    cover: bookCover('9780735219090', 'where-the-crawdads-sing'),
    category: 'fiction',
    description: 'A painfully beautiful first novel that is at once an exquisite ode to the natural world, a heartbreaking coming-of-age story, and a surprising tale of possible murder.',
    tags: ['Coming-of-Age', 'Nature', 'Mystery'],
    type: 'book'
  },
  {
    id: 'the-book-thief',
    title: 'The Book Thief',
    author: 'Markus Zusak',
    price: 429,
    cover: bookCover('9780375842207', 'the-book-thief'),
    category: 'fiction',
    minAge: 13,
    maxAge: 15,
    description: 'Set during World War II in Germany, Markus Zusak’s groundbreaking novel is the story of Liesel Meminger, a foster girl living outside of Munich who scratches out a meager existence by stealing.',
    tags: ['Historical', 'Heartwarming', 'Classic'],
    type: 'book'
  },
  {
    id: 'the-night-circus',
    title: 'The Night Circus',
    author: 'Erin Morgenstern',
    price: 429,
    cover: bookCover('9780307744432', 'the-night-circus'),
    category: 'fiction',
    description: 'The circus arrives without warning. It is simply there, when yesterday it was not. Behind the scenes, a fierce competition is underway—a duel between two young magicians.',
    tags: ['Fantasy', 'Magic', 'Romance'],
    type: 'book'
  },
  {
    id: 'the-fault-in-our-stars',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    price: 379,
    cover: bookCover('9780525478812', 'the-fault-in-our-stars'),
    category: 'fiction',
    minAge: 13,
    maxAge: 15,
    description: 'Despite the tumor-shrinking medical miracle that has bought her a few years, Hazel has never been anything but terminal. But when a gorgeous plot twist named Augustus Waters suddenly appears, Hazel’s story is about to be completely rewritten.',
    tags: ['Young Adult', 'Romance', 'Drama'],
    type: 'book'
  },
  {
    id: 'little-women',
    title: 'Little Women',
    author: 'Louisa May Alcott',
    price: 349,
    cover: bookCover('9780147514011', 'little-women'),
    category: 'fiction',
    minAge: 10,
    maxAge: 15,
    description: 'Chronicles the lives of the four March sisters—Meg, Jo, Beth, and Amy—as they grow from childhood into adulthood during the American Civil War.',
    tags: ['Classic', 'Family', 'Literature'],
    type: 'book'
  },
  {
    id: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    price: 249,
    cover: bookCover('9780141439518', 'pride-and-prejudice'),
    category: 'fiction',
    minAge: 13,
    maxAge: 15,
    description: 'Jane Austen’s wit and insight illuminate Elizabeth Bennet’s complex relationship with the proud Mr. Darcy in this quintessential comedy of manners.',
    tags: ['Classic', 'Romance', 'Timeless'],
    type: 'book'
  },

  // Learning & Growth
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 499,
    cover: bookCover('9780735211292', 'atomic-habits'),
    category: 'learning',
    minAge: 13,
    maxAge: 15,
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving every day.',
    tags: ['Habits', 'Self-Help', 'Productivity'],
    type: 'book'
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    price: 449,
    cover: bookCover('9781455586691', 'deep-work'),
    category: 'learning',
    description: 'Rules for Focused Success in a Distracted World. Deep work is the ability to focus without distraction on a cognitively demanding task.',
    tags: ['Focus', 'Career', 'Productivity'],
    type: 'book'
  },
  {
    id: 'thinking-fast-and-slow',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    price: 549,
    cover: bookCover('9780374533557', 'thinking-fast-and-slow'),
    category: 'learning',
    description: 'Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.',
    tags: ['Psychology', 'Decision-Making', 'Science'],
    type: 'book'
  },
  {
    id: 'the-lean-startup',
    title: 'The Lean Startup',
    author: 'Eric Ries',
    price: 499,
    cover: bookCover('9780307887894', 'the-lean-startup'),
    category: 'learning',
    description: 'How Today’s Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses. A core approach for founders and modern teams.',
    tags: ['Entrepreneurship', 'Business', 'Innovation'],
    type: 'book'
  },

  // Children's Books
  {
    id: 'the-very-hungry-caterpillar',
    title: 'The Very Hungry Caterpillar',
    author: 'Eric Carle',
    price: 299,
    cover: bookCover('9780399226908', 'the-very-hungry-caterpillar'),
    category: 'children',
    minAge: 0,
    maxAge: 5,
    ageGroup: '0-3',
    description: 'The all-time classic story that literally eats its way through the pages. Beloved by generations of early learners.',
    tags: ['Ages 0-3', 'Picture Book', 'Counting'],
    type: 'book'
  },
  {
    id: 'goodnight-moon',
    title: 'Goodnight Moon',
    author: 'Margaret Wise Brown',
    price: 299,
    cover: bookCover('9780060775858', 'goodnight-moon'),
    category: 'children',
    minAge: 0,
    maxAge: 4,
    ageGroup: '0-3',
    description: 'In a great green room, tucked away in bed, is a little bunny. Saying goodnight to all the familiar things in the softly lit room soothingly welcomes sleep.',
    tags: ['Ages 0-3', 'Bedtime', 'Picture Book'],
    type: 'book'
  },
  {
    id: 'where-the-wild-things-are',
    title: 'Where the Wild Things Are',
    author: 'Maurice Sendak',
    price: 349,
    cover: bookCover('9780060254926', 'where-the-wild-things-are'),
    category: 'children',
    minAge: 3,
    maxAge: 7,
    ageGroup: '4-7',
    description: 'One of the most highly acclaimed and best-loved children’s books of all time, celebrating imagination and unconditional family love.',
    tags: ['Ages 4-7', 'Adventure', 'Classics'],
    type: 'book'
  },
  {
    id: 'the-gruffalo',
    title: 'The Gruffalo',
    author: 'Julia Donaldson',
    price: 299,
    cover: bookCover('9780333710937', 'the-gruffalo'),
    category: 'children',
    minAge: 2,
    maxAge: 7,
    ageGroup: '4-7',
    description: 'Walk further into the deep dark wood, and discover what happens when a quick-witted mouse comes face to face with an owl, a snake ... and a hungry Gruffalo!',
    tags: ['Ages 4-7', 'Rhyming', 'Animals'],
    type: 'book'
  },
  {
    id: 'harry-potter-1',
    title: 'Harry Potter and the Philosopher’s Stone',
    author: 'J.K. Rowling',
    price: 499,
    cover: bookCover('9780590353427', 'harry-potter-1'),
    category: 'children',
    minAge: 8,
    maxAge: 13,
    ageGroup: '8-12',
    description: 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. The magic begins here.',
    tags: ['Ages 8-12', 'Magic', 'Fantasy'],
    type: 'book'
  },
  {
    id: 'percy-jackson',
    title: 'Percy Jackson & The Olympians: The Lightning Thief',
    author: 'Rick Riordan',
    price: 399,
    cover: bookCover('9780786838653', 'percy-jackson'),
    category: 'children',
    minAge: 9,
    maxAge: 14,
    ageGroup: '8-12',
    description: 'Percy Jackson is about to be kicked out of boarding school... again. But when mythological monsters come after him, he discovers he is a demigod.',
    tags: ['Ages 8-12', 'Mythology', 'Adventure'],
    type: 'book'
  },
  {
    id: 'the-hate-u-give',
    title: 'The Hate U Give',
    author: 'Angie Thomas',
    price: 399,
    cover: bookCover('9780062498533', 'the-hate-u-give'),
    category: 'children',
    minAge: 13,
    maxAge: 15,
    ageGroup: '13+',
    description: 'Sixteen-year-old Starr Carter moves between two worlds: the poor neighborhood where she lives and the fancy suburban prep school she attends.',
    tags: ['Ages 13+', 'Social Justice', 'Young Adult'],
    type: 'book'
  },

  // Gifts & Special Reads
  {
    id: 'the-alchemist',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    price: 299,
    cover: bookCover('9780062315007', 'the-alchemist'),
    category: 'gifts',
    description: 'Paulo Coelho\'s masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.',
    tags: ['Inspiration', 'Philosophy', 'Gifts'],
    type: 'book'
  },
  {
    id: 'becoming',
    title: 'Becoming',
    author: 'Michelle Obama',
    price: 599,
    cover: bookCover('9781524763138', 'becoming'),
    category: 'gifts',
    description: 'An intimate, powerful, and inspiring memoir by the former First Lady of the United States. An honest accounting of her triumphs and her disappointments.',
    tags: ['Memoir', 'Biography', 'Inspiration'],
    type: 'book'
  },
];

// Toys & Learning Kits
export const INITIAL_TOYS: Book[] = [
  {
    id: 'art-kit',
    title: 'Colouring & Art Kit',
    author: 'Kiddie Bloom Studio',
    price: 249,
    cover: TOY_COVER,
    category: 'toys',
    description: 'Colour pencils, creative prompts and space to bring story characters to life.',
    pairNote: 'Pairs well with picture books',
    tags: ['Creativity', 'Crafts', 'Ages 4+'],
    type: 'toy'
  },
  {
    id: 'thinker-puzzle',
    title: 'Little Thinker Puzzle',
    author: 'Kiddie Bloom Studio',
    price: 399,
    cover: TOY_COVER,
    category: 'toys',
    description: 'A playful wooden puzzle to practise patience, matching and problem-solving.',
    pairNote: 'Pairs well with learning books',
    tags: ['Puzzles', 'Fine Motor', 'Ages 3+'],
    type: 'toy'
  },
  {
    id: 'storytime-toy',
    title: 'Storytime Mini Toy',
    author: 'Kiddie Bloom Studio',
    price: 499,
    cover: '/img/stage-0.svg',
    category: 'toys',
    description: 'A cheerful little plush companion for reading corners, pretend play and gifting.',
    pairNote: 'Pairs well with story adventures',
    tags: ['Plush', 'Bedtime', 'Ages 0+'],
    type: 'toy'
  },
  {
    id: 'imagine-set',
    title: 'Make & Imagine Set',
    author: 'Kiddie Bloom Studio',
    price: 599,
    cover: '/img/stage-2.svg',
    category: 'toys',
    description: 'Simple craft materials and clay for children who love to make their own characters.',
    pairNote: 'Pairs well with creativity books',
    tags: ['Imagination', 'Hands-on', 'Ages 6+'],
    type: 'toy'
  },
];

// Gift rewards unlocked at thresholds
export const REWARD_THRESHOLDS = [
  {
    threshold: 999,
    id: 'gift-colouring-kit',
    title: 'Complimentary Colouring Kit',
    cover: '🎨',
    description: 'Free colouring pencil & workbook bundle when spending ₹999 or more.'
  },
  {
    threshold: 1499,
    id: 'gift-mini-toy',
    title: 'Complimentary Mini Toy',
    cover: '🧸',
    description: 'Free reading companion toy when spending ₹1,499 or more.'
  }
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SGD: 'S$',
  AUD: 'A$',
  CAD: 'C$'
};

export const DEFAULT_FX_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.0118,
  EUR: 0.0109,
  GBP: 0.0094,
  AED: 0.0435,
  SGD: 0.0159,
  AUD: 0.0182,
  CAD: 0.0163
};
