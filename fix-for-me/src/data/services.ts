// src/data/services.ts
export type Service = {
  id: string
  name: string
  blurb: string
}

export const SERVICES: Service[] = [
  { id: 'plumbing', name: 'Plumbing & leaks', blurb: 'Dripping taps, burst pipes, blocked drains and geyser issues.' },
  { id: 'electrical', name: 'Electrical', blurb: 'Faulty plugs, tripping breakers, light fittings and rewiring.' },
  { id: 'moving', name: 'Moving & hauling', blurb: 'Local moves, furniture transport and once-off load hauling.' },
  { id: 'handyman', name: 'Handyman & repairs', blurb: 'Small fixes, mounting, sealing, doors and general odd jobs.' },
  { id: 'hvac', name: 'Heating & cooling', blurb: 'Aircon installs, servicing, gas refills and heater repairs.' },
  { id: 'appliance', name: 'Appliance repair', blurb: 'Washing machines, fridges, ovens, dishwashers and dryers.' },
  { id: 'cleaning', name: 'Cleaning', blurb: 'Deep cleans, move-out cleans, carpets and window washing.' },
  { id: 'painting', name: 'Painting', blurb: 'Interior and exterior painting, prep work and touch-ups.' },
  { id: 'carpentry', name: 'Carpentry & assembly', blurb: 'Flat-pack assembly, shelving, cupboards and custom woodwork.' },
  { id: 'locksmith', name: 'Locksmith', blurb: 'Lock changes, keys cut, lockouts and security upgrades.' },
  { id: 'pest', name: 'Pest control', blurb: 'Roaches, rodents, ants and general household pest treatment.' },
  { id: 'roofing', name: 'Roofing & gutters', blurb: 'Leak repairs, tile replacement and gutter cleaning.' },
]

export function serviceName(id: string) {
  return SERVICES.find((s) => s.id === id)?.name ?? id
}