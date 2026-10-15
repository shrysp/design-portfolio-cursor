/**
 * The tour's photo library, ported from an earlier prototype
 * (Pip_Portfolio_Trial) that tried to rank these by substring-matching
 * keywords against tags, and separately by an embedding search that was
 * never finished (a literal `query_embedding: null` stub). Neither ever
 * shipped a correct match.
 *
 * `description` here is not decoration — it IS what Jev reads to decide
 * whether a sentence names this photo (lib/tour/server/read-sentence.ts), and
 * what PIP is told when a visitor points at it. So it says plainly what is in
 * frame — who, what, where — and nothing about how it felt. A mood word
 * ("representing renewal", "moments of reflection") is something a sentence
 * can match without naming anything in the photo, and what is actually in
 * frame goes unsaid: the tulip photo never mentioned the dog standing in
 * front of the tulips, so a sentence about his dog found nothing. And
 * whatever is written here, PIP may say aloud, so nothing goes in that
 * isn't true.
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
  { id: 'california-sunset', path: '/tour/images/california-sunset.jpg', width: 1600, height: 1200, description: 'The sun setting over the Pacific Ocean, seen from a rocky cliff on the California coast, with rocks in the surf below and a cypress tree on the bluff' },
  { id: 'config-2024-design-team', path: '/tour/images/config-2024-design-team.jpg', width: 1200, height: 1600, description: 'Shreyas with three people from the Figma design team, Vincent, Jordan Singer and Tejas Athare, standing in a row in Config 2024 lanyards inside the Moscone Center, the year Figma AI launched' },
  { id: 'config-2024-james', path: '/tour/images/config-2024-james.jpg', width: 900, height: 1600, description: 'Shreyas with James McDonald, both wearing Config 2024 lanyards, in a busy hall at the Moscone Center' },
  { id: 'config-2024-marco', path: '/tour/images/config-2024-marco.jpg', width: 1200, height: 1600, description: 'Shreyas with Marco, both in Config 2024 lanyards, standing side by side in front of the colourful Config stage set' },
  { id: 'config-2024-miggi', path: '/tour/images/config-2024-miggi.jpg', width: 1200, height: 1600, description: 'Shreyas with Miggi on the lawn outside the Moscone Center at Config 2024, Miggi in a black cap making a peace sign, with yellow umbrellas and a crowd behind' },
  { id: 'config-2024-tejas', path: '/tour/images/config-2024-tejas.jpg', width: 900, height: 1600, description: 'Shreyas with Tejas Athare outside the Moscone Center at Config 2024, both in lanyards, with green Figma signs on the building behind them' },
  { id: 'config-2024-venue', path: '/tour/images/config-2024-venue.jpg', width: 900, height: 1600, description: 'The outside of the Moscone Center in San Francisco during Config 2024, with giant yellow "Config" letters across its glass front' },
  { id: 'golden-gate-bridge', path: '/tour/images/golden-gate-bridge.jpg', width: 1200, height: 1600, description: 'The Golden Gate Bridge in San Francisco under a clear blue sky, seen from the hills at its north end, with the bay below' },
  { id: 'rit-graduation-with-mascot', path: '/tour/images/rit-graduation-with-mascot.jpg', width: 1200, height: 1600, description: 'Shreyas on graduation day at RIT in a navy gown and gold stole, sitting beside the bronze statue of Ritchie the Tiger, RIT\'s mascot, after finishing his MS in HCI', group: 'rit-graduation' },
  { id: 'headshot-winter', path: '/tour/images/headshot-winter.jpg', width: 1200, height: 1600, description: 'Shreyas smiling in a navy winter parka with a fur hood, in front of Bethesda Fountain and its angel statue in Central Park, New York, in winter 2024' },
  { id: 'kayaking-adventure', path: '/tour/images/kayaking-adventure.jpg', width: 1203, height: 1600, description: 'Shreyas and a friend paddling a red two-person kayak in life jackets, with another kayaker in a blue kayak behind them and tall reeds along the water' },
  { id: 'mission-peak-silhouette', path: '/tour/images/mission-peak-silhouette.jpg', width: 1200, height: 1600, description: 'Shreyas seen from behind at the top of Mission Peak at sunset, looking out over the valley and the bay far below', group: 'mission-peak' },
  { id: 'mission-peak-top', path: '/tour/images/mission-peak-top.jpg', width: 1200, height: 1600, description: 'Shreyas standing next to the summit post at the top of Mission Peak, with green hills rolling away behind him', group: 'mission-peak' },
  { id: 'mission-peak-landscape', path: '/tour/images/mission-peak-landscape.jpg', width: 1200, height: 1600, description: 'Green grassy hills and ridges on the trail up Mission Peak, under a blue sky with streaks of cloud', group: 'mission-peak' },
  { id: 'post-hike-reflection', path: '/tour/images/post-hike-reflection.jpg', width: 1600, height: 900, description: 'Shreyas in a blue jacket seen from behind after a hike, looking out at layers of misty blue mountains' },
  { id: 'rit-graduation-cap-throw', path: '/tour/images/rit-graduation-cap-throw.jpg', width: 1200, height: 1600, description: 'Shreyas in his graduation gown throwing his cap into the air at RIT, in front of a curved glass building with red trim', group: 'rit-graduation' },
  { id: 'rit-winter-with-ritchie', path: '/tour/images/rit-winter-with-ritchie.jpg', width: 1200, height: 1600, description: 'Shreyas crouching in a winter puffer jacket next to the bronze statue of Ritchie the Tiger, RIT\'s mascot, with snow on the ground and glass campus buildings behind' },
  { id: 'san-francisco-piers', path: '/tour/images/san-francisco-piers.jpg', width: 1200, height: 1600, description: 'The view out over San Francisco Bay from the piers, calm water and pier posts, with Alcatraz Island far off in the haze' },
  { id: 'scuba-diving-adventure', path: '/tour/images/scuba-diving-adventure.jpg', width: 1600, height: 1600, description: 'Shreyas scuba diving underwater in December 2019, in a mask and gear, surrounded by a school of small yellow fish in blue water' },
  { id: 'rit-waterway-winter', path: '/tour/images/rit-waterway-winter.jpg', width: 1200, height: 1600, description: 'A canal at RIT on a clear winter day, with a wooden dock along the bank, bare trees, blue sky and a bridge in the distance' },
  { id: 'rit-lake-swans', path: '/tour/images/rit-lake-swans.jpg', width: 1200, height: 1600, description: 'Two white swans and three grey cygnets swimming in a line across a calm lake at RIT, with reeds and trees on the far shore' },
  { id: 'spring-tulips-dog', path: '/tour/images/spring-tulips-dog.jpg', width: 1200, height: 1600, description: 'His friend\'s small fluffy apricot poodle on a blue leash standing on the grass in front of rows of yellow, pink and red tulips, on a spring day in Rochester' },
  { id: 'boardwalk-marshland', path: '/tour/images/boardwalk-marshland.jpg', width: 1200, height: 1600, description: 'A long, straight wooden boardwalk with railings crossing a green marsh near Rochester, with trees on the horizon and a blue summer sky' },
  { id: 'beautiful-sky1', path: '/tour/images/beautiful-sky1.jpg', width: 1200, height: 1600, description: 'A single airplane contrail across a deep blue sky in Rochester, with a couple of birds and the edge of a tree' },
  { id: 'beautiful-sky2', path: '/tour/images/beautiful-sky2.jpg', width: 900, height: 1600, description: 'The floodlights of the sports fields at RIT switched on at dusk, tall light poles against a dark blue sky with an orange glow on the horizon' },
  { id: 'fall-colors', path: '/tour/images/fall-colors.jpg', width: 1600, height: 1200, description: 'Autumn trees in red, orange and yellow reflected in a still pond in Rochester, under a cloudy sky' },
  { id: 'frozen-tree', path: '/tour/images/frozen-tree.jpg', width: 1200, height: 1600, description: 'A bare tree dusted with snow at night, lit orange by streetlights, on a snowy lawn in Rochester', group: 'rochester-snow' },
  { id: 'northern-lights1', path: '/tour/images/northern-lights1.jpg', width: 1200, height: 1600, description: 'The northern lights over RIT, looking straight up past autumn trees into a dark sky glowing green', group: 'northern-lights' },
  { id: 'northern-lights2', path: '/tour/images/northern-lights2.jpg', width: 1600, height: 1200, description: 'Green and pink beams of the northern lights rising over autumn trees at RIT', group: 'northern-lights' },
  { id: 'northern-lights3', path: '/tour/images/northern-lights3.jpg', width: 900, height: 1600, description: 'Pink and green northern lights filling the sky above a tree line and a grassy field at RIT', group: 'northern-lights' },
  { id: 'northern-lights4', path: '/tour/images/northern-lights4.jpg', width: 1200, height: 1600, description: 'Pink and green northern lights directly overhead at RIT, with a dark line of trees at the edge of the sky', group: 'northern-lights' },
  { id: 'snow-covered-rit', path: '/tour/images/snow-covered-rit.jpg', width: 1200, height: 1600, description: 'RIT campus covered in snow, seen from high up, with snowy lawns, curving paths, lamp posts and buildings', group: 'rochester-snow' },
  { id: 'snow-covered', path: '/tour/images/snow-covered.jpg', width: 1200, height: 1600, description: 'A snow-covered road and median on the RIT campus, seen from above on a grey winter day', group: 'rochester-snow' },
  { id: 'winter-sun-shadows', path: '/tour/images/winter-sun-shadows.jpg', width: 1200, height: 1600, description: 'The sun shining through bare trees, casting long blue shadows across fresh snow, with a lamp post, in Rochester in winter', group: 'rochester-snow' },
  { id: 'snow-storm', path: '/tour/images/snow-storm.jpg', width: 1200, height: 1600, description: 'A parking lot at night in Rochester during a snowstorm, cars buried in snow under orange streetlights and thick fog' },
  { id: 'sunset1', path: '/tour/images/sunset1.jpg', width: 1600, height: 1200, description: 'Pink and orange streaks of cloud at sunset over a road in Rochester, with cars, dark trees and buildings below', group: 'rochester-sunset' },
  { id: 'sunset2', path: '/tour/images/sunset2.jpg', width: 1600, height: 1200, description: 'An orange and pink sunset glowing along the horizon over Rochester, seen from up high, with dark rooftops below', group: 'rochester-sunset' },
  { id: 'sunset3', path: '/tour/images/sunset3.jpg', width: 1200, height: 1600, description: 'Long streaks of pink and orange cloud at sunset over dark bare trees and a streetlight, seen from the road near Rochester', group: 'rochester-sunset' },
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
