'use client';

import { Users } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gebruikers</h1>
        <p className="text-muted-foreground">Beheer gebruikersaccounts</p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-12 text-center">
        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Gebruikersbeheer</h3>
        <p className="text-muted-foreground">
          Deze functionaliteit wordt binnenkort toegevoegd
        </p>
      </div>
    </div>
  );
}

