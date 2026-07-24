export interface BranchData {
  id: string;
  name: string;
  locations: string[];
}

export const branchesData: BranchData[] = [
  {
    id: 'branch-1',
    name: 'M.A Bakers 1 — Dhamra Road',
    locations: [
      'Dhamra Road / Camp No. 2',
      'Housing Society',
      'Airport Colony',
      'Azeem Colony',
      'Fauji Colony',
      'Ghareebabad',
      'Haqani Colony',
      'University Town',
      'Mehran City',
      'Mehran Colony',
    ],
  },
  {
    id: 'branch-2',
    name: 'M.A Bakers 2 — Jam Sahib Road',
    locations: [
      'Jam Sahib Road',
      'Katchery Road',
      'Hospital Road',
      'Liaquat Market',
      'Mohni Bazar',
      'Masjid Road',
      'Old Nawabshah / Sanghar Road',
      'Jamali Colony',
      'Madina Town',
      'Rajput Town',
      'Rehman City',
      'Santa Singh',
      'Shehmir Bhangwar',
      'Sugar Mill Colony',
      'Syed Ghulam Rasool Shah',
      'Taj Colony',
    ],
  },
];

export function parseOrderLocation(location: string): { branchId: string; area: string } {
  if (location.includes(': ')) {
    const [branchId, area] = location.split(': ');
    return { branchId, area };
  }
  return { branchId: '', area: location };
}

export function getAreasForBranch(branchId: string): string[] {
  return branchesData.find((b) => b.id === branchId)?.locations ?? [];
}
