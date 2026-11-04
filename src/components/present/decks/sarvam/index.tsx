'use client';

import Deck, { type DeckSlide } from '../../Deck';
import { ThemeContext } from '../../primitives';
import { sarvam } from './theme';
import { About, Cover, SelectedWork } from './intro';
import { CAMEO_BRANCHES, CAMEO_SLIDES } from './cameo';
import * as Q from './quinn';
import { ThankYou, WhySarvam } from './closing';

/**
 * The deck for the Sarvam AI portfolio round: the intro, Cameo, Quinn and a close.
 * Order here is the order on screen; a section name is what the footer shows beside the number.
 */
const SLIDES: DeckSlide[] = [
  { section: '', render: () => <Cover /> },
  { section: 'Intro', render: () => <About /> },
  { section: 'Intro', render: () => <SelectedWork /> },

  // Cameo as beats; its branches open with B from the voice beat and the tour
  ...CAMEO_SLIDES,

  ...[
    Q.QuinnOpener,
    Q.QuinnOverview,
    Q.QuinnProblem,
    Q.QuinnCoreProblems,
    Q.QuinnSpreadsheet,
    Q.QuinnInsight,
    Q.QuinnFirstDirection,
    Q.QuinnPivot,
    Q.QuinnPantry,
    Q.QuinnFramework,
    Q.QuinnMasterTable,
    Q.QuinnInteractionDetails,
    Q.QuinnSearchToGroup,
    Q.QuinnResearch,
    Q.QuinnPlaybooks,
    Q.QuinnQScore,
    Q.QuinnPrecedent,
    Q.QuinnLearned,
  ].map((Slide) => ({ section: 'Quinn', render: () => <Slide /> })),

  { section: '', render: () => <WhySarvam /> },
  { section: '', render: () => <ThankYou /> },
];

export default function SarvamDeck() {
  return (
    <ThemeContext.Provider value={sarvam}>
      <Deck slides={SLIDES} branches={CAMEO_BRANCHES} />
    </ThemeContext.Provider>
  );
}
