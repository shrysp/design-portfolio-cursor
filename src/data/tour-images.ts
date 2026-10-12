/**
 * The tour's photo library, ported from an earlier prototype
 * (Pip_Portfolio_Trial) that tried to rank these by substring-matching
 * keywords against tags, and separately by an embedding search that was
 * never finished (a literal `query_embedding: null` stub). Neither ever
 * shipped a correct match.
 *
 * `description` here is not decoration — it IS the Jev criteria value in
 * `api/tour/route.ts`. Jev is text-only and never sees the actual photo;
 * relevance is entirely this caption being a good description of what's
 * in frame. A vague or generic description makes a photo unfindable no
 * matter how good the model is.
 *
 * One entry (`sunset4`) was dropped: the source library referenced a file
 * (`Sunset4.jpeg`) that doesn't exist on disk (an unreferenced `Sunset5.jpeg`
 * sits next to it instead) — a leftover mismatch from the original project,
 * not reproduced here.
 */
export type TourImage = {
  id: string;
  path: string;
  /**
   * As DISPLAYED, not as stored. Nine of these are iPhone shots saved
   * sideways with an EXIF rotation tag (orientation=upper-right): the file's
   * pixels are 1600×1200, the browser shows 1200×1600. TourCard sizes the card
   * from these numbers but the image lays out at its displayed shape, so a
   * stored-size entry made the card a landscape box holding a portrait photo —
   * a third taller than FOCUS_MAX allows. `sips` misses the tag; `file` shows it.
   */
  width: number;
  height: number;
  description: string;
  /**
   * Near-duplicates of one moment share a group — four shots of the same
   * aurora, four of the same snowy campus. A sentence that mentions the
   * moment matches all of them equally, and spotlighting all four in a row
   * shows the same thing four times; /api/tour keeps only the best of each.
   */
  group?: string;
};

export const TOUR_IMAGES: TourImage[] = [
  { id: 'california-sunset', path: '/tour/images/california-sunset.jpg', width: 1600, height: 1200, description: 'A beautiful sunset captured on the west coast of California, representing moments of inspiration and reflection' },
  { id: 'config-2024-design-team', path: '/tour/images/config-2024-design-team.jpg', width: 1200, height: 1600, description: 'At Config 2024 with the Figma design team including Vincent, Jordan Singer, and Tejas Athare, celebrating the Figma AI launch' },
  { id: 'config-2024-james', path: '/tour/images/config-2024-james.jpg', width: 900, height: 1600, description: 'Meeting with James McDonald at Config 2024 design conference' },
  { id: 'config-2024-marco', path: '/tour/images/config-2024-marco.jpg', width: 1200, height: 1600, description: 'Networking with Marco at Config 2024 design conference' },
  { id: 'config-2024-miggi', path: '/tour/images/config-2024-miggi.jpg', width: 1200, height: 1600, description: 'Meeting with Miggi at Config 2024 design conference' },
  { id: 'config-2024-tejas', path: '/tour/images/config-2024-tejas.jpg', width: 900, height: 1600, description: 'With Tejas Athare at Config 2024 design conference' },
  { id: 'config-2024-venue', path: '/tour/images/config-2024-venue.jpg', width: 900, height: 1600, description: 'The impressive Moscone Center venue for Config 2024 design conference' },
  { id: 'golden-gate-bridge', path: '/tour/images/golden-gate-bridge.jpg', width: 1200, height: 1600, description: 'The iconic Golden Gate Bridge in San Francisco on a beautiful sunny day' },
  { id: 'rit-graduation-with-mascot', path: '/tour/images/rit-graduation-with-mascot.jpg', width: 1200, height: 1600, description: 'Graduation day at RIT with Ritchie the Tiger mascot, celebrating the completion of my MS in HCI on a sunny day in Rochester' },
  { id: 'headshot-winter', path: '/tour/images/headshot-winter.jpg', width: 1200, height: 1600, description: 'Professional headshot taken in Washington Square Park, New York during winter 2024, showing a warm smile' },
  { id: 'kayaking-adventure', path: '/tour/images/kayaking-adventure.jpg', width: 1203, height: 1600, description: 'Enjoying a kayaking adventure, showcasing my love for outdoor activities and water sports' },
  { id: 'mission-peak-silhouette', path: '/tour/images/mission-peak-silhouette.jpg', width: 1200, height: 1600, description: 'Silhouette view from the top of Mission Peak with the beautiful bay area visible below, capturing the triumph of reaching the summit', group: 'mission-peak' },
  { id: 'mission-peak-top', path: '/tour/images/mission-peak-top.jpg', width: 1200, height: 1600, description: 'Standing at the highest point of Mission Peak next to the summit pole, marking another successful hiking achievement', group: 'mission-peak' },
  { id: 'mission-peak-landscape', path: '/tour/images/mission-peak-landscape.jpg', width: 1200, height: 1600, description: 'Panoramic landscape view of Mission Peak showcasing the beautiful California hill country', group: 'mission-peak' },
  { id: 'post-hike-reflection', path: '/tour/images/post-hike-reflection.jpg', width: 1600, height: 900, description: 'A peaceful moment of reflection after a challenging hike, taking in the breathtaking layered mountain vista with misty peaks stretching into the distance' },
  { id: 'rit-graduation-cap-throw', path: '/tour/images/rit-graduation-cap-throw.jpg', width: 1200, height: 1600, description: 'Celebrating graduation from RIT by throwing my cap in front of the modern campus infrastructure, marking the completion of my HCI journey' },
  { id: 'rit-winter-with-ritchie', path: '/tour/images/rit-winter-with-ritchie.jpg', width: 1200, height: 1600, description: 'Posing with RIT\'s mascot Ritchie the Tiger on a snowy winter day, with the modern glass and steel campus architecture in the background' },
  { id: 'san-francisco-piers', path: '/tour/images/san-francisco-piers.jpg', width: 1200, height: 1600, description: 'Exploring the San Francisco piers with Alcatraz Island visible in the distant bay' },
  { id: 'scuba-diving-adventure', path: '/tour/images/scuba-diving-adventure.jpg', width: 1600, height: 1600, description: 'Scuba diving underwater in December 2019, fully geared up and surrounded by a beautiful school of yellow tropical fish in the blue underwater world' },
  { id: 'rit-waterway-winter', path: '/tour/images/rit-waterway-winter.jpg', width: 1200, height: 1600, description: 'A peaceful waterway view at RIT during one of Rochester\'s rare clear winter days, showcasing the beautiful bridges and calm waters that made the campus special' },
  { id: 'rit-lake-swans', path: '/tour/images/rit-lake-swans.jpg', width: 1200, height: 1600, description: 'Swans and ducks enjoying the peaceful lake at RIT, capturing the serene wildlife moments that made campus walks so enjoyable during warmer months' },
  { id: 'spring-tulips-dog', path: '/tour/images/spring-tulips-dog.jpg', width: 1200, height: 1600, description: 'A joyful spring moment with vibrant tulips in full bloom, representing the renewal and beauty that came with warmer weather in Rochester' },
  { id: 'boardwalk-marshland', path: '/tour/images/boardwalk-marshland.jpg', width: 1200, height: 1600, description: 'A wooden boardwalk extending through Rochester\'s marshlands, representing the many hiking trails and nature walks that made the area so special for outdoor exploration' },
  { id: 'beautiful-sky1', path: '/tour/images/beautiful-sky1.jpg', width: 1200, height: 1600, description: 'A dramatic rocket or aircraft contrail cutting through Rochester\'s clear blue sky, capturing one of those rare atmospheric moments that made looking up worthwhile' },
  { id: 'beautiful-sky2', path: '/tour/images/beautiful-sky2.jpg', width: 900, height: 1600, description: 'RIT\'s illuminated sports fields during evening hours, capturing the active campus life and community spirit that defined student experiences' },
  { id: 'fall-colors', path: '/tour/images/fall-colors.jpg', width: 1600, height: 1200, description: 'Stunning fall foliage reflected in calm water, perfectly capturing why Rochester was absolutely beautiful during autumn with its vibrant red, orange, and yellow colors' },
  { id: 'frozen-tree', path: '/tour/images/frozen-tree.jpg', width: 1200, height: 1600, description: 'A snow-covered tree illuminated at night, representing how Rochester\'s harsh winters could still create moments of striking beauty despite the challenging conditions', group: 'rochester-snow' },
  { id: 'northern-lights1', path: '/tour/images/northern-lights1.jpg', width: 1200, height: 1600, description: 'Magnificent northern lights dancing over RIT\'s campus - one of the most incredible and rare experiences, capturing the aurora borealis from the campus lawns', group: 'northern-lights' },
  { id: 'northern-lights2', path: '/tour/images/northern-lights2.jpg', width: 1600, height: 1200, description: 'Stunning vertical beams of aurora borealis over RIT, part of the unforgettable northern lights experience that became one of the highlights of time in Rochester', group: 'northern-lights' },
  { id: 'northern-lights3', path: '/tour/images/northern-lights3.jpg', width: 900, height: 1600, description: 'A wide display of northern lights filling the sky above RIT, showcasing the full majesty of this once-in-a-lifetime aurora event captured from campus', group: 'northern-lights' },
  { id: 'northern-lights4', path: '/tour/images/northern-lights4.jpg', width: 1200, height: 1600, description: 'Aurora borealis directly overhead at RIT, completing the sequence of this extraordinary northern lights display that made for an unforgettable Rochester experience', group: 'northern-lights' },
  { id: 'snow-covered-rit', path: '/tour/images/snow-covered-rit.jpg', width: 1200, height: 1600, description: 'An aerial view of RIT campus blanketed in snow, showing how the harsh Rochester winters transformed the entire campus into a white wonderland', group: 'rochester-snow' },
  { id: 'snow-covered', path: '/tour/images/snow-covered.jpg', width: 1200, height: 1600, description: 'Snow-covered campus roads at RIT, illustrating the daily challenges and adaptations required during Rochester\'s harsh winter months', group: 'rochester-snow' },
  { id: 'winter-sun-shadows', path: '/tour/images/winter-sun-shadows.jpg', width: 1200, height: 1600, description: 'Dramatic winter shadows cast by bare trees on snow, with bright sun creating beautiful contrast - showing how even harsh winters had their artistic moments', group: 'rochester-snow' },
  { id: 'snow-storm', path: '/tour/images/snow-storm.jpg', width: 1200, height: 1600, description: 'A moody foggy night scene in Rochester, capturing the atmospheric weather conditions that were part of the diverse climate experience' },
  { id: 'sunset1', path: '/tour/images/sunset1.jpg', width: 1600, height: 1200, description: 'A dramatic sunset over Rochester with stunning pink and orange clouds, representing the incredible sunsets that made Rochester special despite the often cloudy weather', group: 'rochester-sunset' },
  { id: 'sunset2', path: '/tour/images/sunset2.jpg', width: 1600, height: 1200, description: 'A beautifully layered sunset with multiple cloud formations, showcasing the complex and stunning evening skies that made Rochester\'s sunsets so memorable', group: 'rochester-sunset' },
  { id: 'sunset3', path: '/tour/images/sunset3.jpg', width: 1200, height: 1600, description: 'A spectacular sunset viewed from the road with dramatic cloud formations, capturing the beauty that could be found during travels around Rochester', group: 'rochester-sunset' },
];

/**
 * Where in his life a photo belongs. The stage can lay the library out by
 * these instead of scattering it, so a visitor can see what there is to ask
 * about. Read off the ids rather than stored per photo: the ids already say it.
 *
 * The order here is the order the chapters arrive on stage: top left, top
 * right, then down the two sides.
 */
export const CHAPTERS = [
  { id: 'rit', label: 'RIT' },
  { id: 'rochester', label: 'Rochester' },
  { id: 'config', label: 'Config 2024' },
  { id: 'bay-area', label: 'Bay Area' },
  { id: 'elsewhere', label: 'Elsewhere' },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]['id'];

const ELSEWHERE = ['kayaking-adventure', 'scuba-diving-adventure', 'post-hike-reflection', 'headshot-winter'];
const BAY_AREA = ['golden-gate-bridge', 'san-francisco-piers', 'california-sunset'];

export function chapterOf(id: string): ChapterId {
  if (id.startsWith('config-')) return 'config';
  if (id.startsWith('mission-peak') || BAY_AREA.includes(id)) return 'bay-area';
  if (ELSEWHERE.includes(id)) return 'elsewhere';
  // beautiful-sky2 is RIT's sports fields, whatever its name says.
  if (/^(rit-|northern-lights|snow-covered)/.test(id) || id === 'beautiful-sky2') return 'rit';
  return 'rochester';
}
