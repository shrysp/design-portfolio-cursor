import InvitePreview from '@/app/dev/tour-invite/InvitePreview';

export const metadata = { title: 'Tour invitation' };

/**
 * The invitation ticket, for review: what /dev/tour-invite shows, but live, so
 * Inflight's widget (this folder's layout) can be pinned to it. One link per
 * version: `?name=Jordan&no=7&note=…`. Tearing only ever prints it again —
 * no way into the tour from here.
 */
export default function DiveInvitePage() {
  return <InvitePreview printOnly />;
}
