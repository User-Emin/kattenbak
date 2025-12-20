#!/bin/bash
set -e

FILE="frontend/components/products/product-detail.tsx"

# Backup
cp "$FILE" "$FILE.bak"

# Apply changes using ed
ed -s "$FILE" << 'EDSCRIPT'
/SPECIFICATIES - CLEAN & OPVALLEND/c
              {/* SPECIFICATIES - GRID LAYOUT */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <h3 className="font-semibold text-base text-gray-900">Specificaties</h3>
                  </div>
                  <div className="md:col-span-8">
.
wq
EDSCRIPT

echo "✅ Phase 1 done"
