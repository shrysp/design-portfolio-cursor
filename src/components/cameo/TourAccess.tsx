'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * The way into the tour. The code is checked on the server, which answers
 * with a cookie this script cannot read; nothing here decides who gets in.
 */
export default function TourAccess({ unlocked }: { unlocked: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (unlocked) {
    // A browser stays unlocked for a week, so there has to be a way back to
    // the form — for a shared computer, or to come in as someone else.
    const lock = async () => {
      await fetch('/api/tour/unlock', { method: 'DELETE' }).catch(() => {});
      router.refresh();
    };
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => router.push('/projects/cameo/tour')}>Open the tour</Button>
        <button type="button" onClick={lock} className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-800">
          Use a different code
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/tour/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.push('/projects/cameo/tour');
        return;
      }
      setError((await res.json().catch(() => null))?.error ?? 'Something went wrong. Try again.');
    } catch {
      setError('Something went wrong. Try again.');
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-2">
      <label htmlFor="tour-code" className="text-subheader">
        Access code
      </label>
      <div className="flex gap-2">
        <Input
          id="tour-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="XXXX-XXXX-XXXX"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={!!error}
          aria-describedby={error ? 'tour-code-error' : undefined}
          className="bg-white font-mono uppercase tracking-wider"
        />
        <Button type="submit" disabled={busy || !code.trim()}>
          {busy ? 'Checking…' : 'Enter'}
        </Button>
      </div>
      {error && (
        <p id="tour-code-error" role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
