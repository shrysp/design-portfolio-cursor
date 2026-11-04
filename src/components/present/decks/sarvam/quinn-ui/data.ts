// The people in Quinn's screens, as they appear in the Paper file

export const AVATARS = '/present/sarvam/quinn';

export type Channel = 'whatsapp' | 'gmail' | 'linkedin' | 'x';

export type Person = {
  id: string;
  name: string;
  strength: number;
  activity: string;
  company: string;
  role: string;
  /** The last conversation: where it happened, what it was about, and when */
  last: { via: Channel; subject: string; when: string; days: number };
  channels: Channel[];
  /** Whether they follow on LinkedIn, or are a connection there */
  linkedin?: 'connection' | 'follower';
  location: string;
  kind: 'founder' | 'investor' | 'designer';
  /** What research finds about their company's latest round; null when nothing public turns up */
  funding?: { round: string; amount: string; date: string } | null;
};

export const PEOPLE: Person[] = [
  {
    id: 'soleio',
    name: 'Soleio Cuervo',
    strength: 96,
    activity: 'Appeared on "Cults & Culture" podcast discussing design philosophy and venture strategy',
    company: 'South Park Commons',
    role: 'Visiting Partner',
    last: { via: 'whatsapp', subject: 'Design philosophy discussion', when: '2 months ago', days: 60 },
    channels: ['whatsapp', 'gmail', 'linkedin', 'x'],
    linkedin: 'connection',
    location: 'San Francisco',
    kind: 'investor',
  },
  {
    id: 'jordan',
    name: 'Jordan Singer',
    strength: 90,
    activity: 'Raised $5.5M seed round for Mainframe (December 2024), developing Cobot AI assistant, co-led by Lachy Groom and Stellation',
    company: 'Mainframe',
    role: 'Co-founder & CEO',
    last: { via: 'gmail', subject: 'Congrats on the seed round!', when: '5 hours ago', days: 0 },
    channels: ['whatsapp', 'gmail', 'linkedin', 'x'],
    linkedin: 'connection',
    location: 'New York',
    kind: 'founder',
  },
  {
    id: 'aditya',
    name: 'Aditya Agarwal',
    strength: 72,
    activity: 'Announced South Park Commons Fund III ($275M) in May 2025, actively promoting Founder Fellowship applications',
    company: 'South Park Commons',
    role: 'Partner',
    last: { via: 'linkedin', subject: 'Partnership opportunity at SPC', when: '15 minutes ago', days: 0 },
    channels: ['gmail', 'linkedin', 'x'],
    linkedin: 'follower',
    location: 'San Francisco',
    kind: 'investor',
  },
  {
    id: 'sambhav',
    name: 'Sambhav Anand',
    strength: 64,
    activity: 'Fulcrum launched on Microsoft AppSource, actively serving insurance clients including Heffernan and Newfront with AI automation tools',
    company: 'Fulcrum',
    role: 'Co-founder',
    last: { via: 'gmail', subject: 'Fulcrum AppSource launch discussion', when: '2 months ago', days: 60 },
    channels: ['gmail', 'linkedin'],
    linkedin: 'connection',
    location: 'San Francisco',
    kind: 'founder',
    funding: null,
  },
  {
    id: 'adam',
    name: 'Adam Behrens',
    strength: 84,
    activity: 'New Generation emerged from stealth with $4.5M seed round (2024), launched AI-native commerce platform for conversational shopping',
    company: 'New Generation',
    role: 'Co-founder & CEO',
    last: { via: 'linkedin', subject: 'New Generation funding celebration', when: '5 months ago', days: 150 },
    channels: ['whatsapp', 'gmail', 'linkedin'],
    linkedin: 'connection',
    location: 'San Francisco',
    kind: 'founder',
    funding: { round: 'Seed', amount: '$4.5M', date: '2024' },
  },
  {
    id: 'jonathan',
    name: 'Jonathan Arena',
    strength: 51,
    activity: 'Co-launched New Generation with Adam Behrens, focusing on AI-native storefronts and conversational commerce experiences',
    company: 'New Generation',
    role: 'Co-founder',
    last: { via: 'gmail', subject: 'Startup collaboration ideas', when: '1 month ago', days: 30 },
    channels: ['gmail', 'linkedin'],
    linkedin: 'follower',
    location: 'San Francisco',
    kind: 'founder',
    funding: { round: 'Seed', amount: '$4.5M', date: '2024' },
  },
  {
    id: 'dylan',
    name: 'Dylan Field',
    strength: 45,
    activity: "Hosted Config 2025 in June, launched Figma Make, Sites, Draw and Buzz, doubling Figma's product lineup with AI-powered features",
    company: 'Figma',
    role: 'Co-founder & CEO',
    last: { via: 'x', subject: 'Figma roadmap insights', when: '2 months ago', days: 60 },
    channels: ['gmail', 'linkedin', 'x'],
    linkedin: 'follower',
    location: 'San Francisco',
    kind: 'founder',
    funding: { round: 'IPO', amount: '$1.2B', date: 'Jul 2025' },
  },
  {
    id: 'julie',
    name: 'Julie Zhuo',
    strength: 78,
    activity: "Keynote speaker at Upscale Conf 2025 (May), discussed AI's impact on design, actively building Sundial analytics platform",
    company: 'Sundial',
    role: 'Co-founder',
    last: { via: 'x', subject: 'Design leadership advice', when: '5 hours ago', days: 0 },
    channels: ['whatsapp', 'gmail', 'linkedin', 'x'],
    linkedin: 'connection',
    location: 'San Francisco',
    kind: 'founder',
    funding: null,
  },
  {
    id: 'tobias',
    name: 'Tobias van Schneider',
    strength: 55,
    activity: 'Active with HOVS studio, continuing mymind development, featured in privacy-focused tool interviews and design leadership discussions',
    company: 'HOVS & mymind',
    role: 'Founder',
    last: { via: 'x', subject: 'Mymind product feedback', when: '2 weeks ago', days: 14 },
    channels: ['gmail', 'linkedin'],
    linkedin: 'follower',
    location: 'New York',
    kind: 'designer',
  },
  {
    id: 'artiom',
    name: 'Artiom Dashinsky',
    strength: 32,
    activity: 'Published multiple UX career books, relocated between Tel Aviv and Berlin, active in design community with sustainable corporate swag business',
    company: 'Independent',
    role: 'Designer & Author',
    last: { via: 'gmail', subject: 'UX book recommendation', when: '2 months ago', days: 60 },
    channels: ['gmail', 'linkedin'],
    linkedin: 'connection',
    location: 'Berlin',
    kind: 'designer',
  },
  {
    id: 'sophia',
    name: 'Sophia Wilson',
    strength: 96,
    activity: 'Joined a local art collective to collaborate with other talented designers.',
    company: 'Innovatech Solutions',
    role: 'Data Analyst',
    last: { via: 'gmail', subject: 'Subject of the Email', when: '2 weeks ago', days: 14 },
    channels: ['whatsapp', 'gmail', 'linkedin'],
    location: 'New York',
    kind: 'designer',
  },
];

export const byId = (id: string) => PEOPLE.find((p) => p.id === id)!;

/** The colour a strength score is drawn in: green when strong, amber in the middle, red when weak */
export const strengthColor = (n: number) => (n >= 75 ? '#17B26A' : n >= 50 ? '#F79009' : '#F04438');
