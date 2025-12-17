'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Instellingen</h1>
        <p className="text-muted-foreground">Beheer systeeminstellingen</p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-12 text-center">
        <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Systeeminstellingen</h3>
        <p className="text-muted-foreground">
          Deze functionaliteit wordt binnenkort toegevoegd
        </p>
      </div>
    </div>
  );
}

