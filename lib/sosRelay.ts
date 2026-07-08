import { Boat, SOSHop } from '@/types';
import { haversineKm } from './boatEngine';

export function computeSOSRelayChain(
  originBoatId: string,
  allBoats: Boat[],
  RADIO_RANGE_KM: number
): string[] {
  // BFS from origin boat to any network-connected boat
  const visited = new Set<string>([originBoatId]);
  const queue: string[][] = [[originBoatId]];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentId = path[path.length - 1];
    const current = allBoats.find((b) => b.id === currentId)!;

    if (current.hasNetwork && current.id !== originBoatId) {
      return path; // Found path to network
    }

    const neighbors = allBoats
      .filter((b) => !visited.has(b.id))
      .filter((b) => haversineKm(current.lat, current.lng, b.lat, b.lng) <= RADIO_RANGE_KM);

    for (const neighbor of neighbors) {
      visited.add(neighbor.id);
      queue.push([...path, neighbor.id]);
    }
  }

  return [originBoatId]; // No path found
}

export function buildSOSHops(
  relayChain: string[],
  allBoats: Boat[],
  h3IndexToShortCode: (idx: string) => string
): SOSHop[] {
  return relayChain.map((boatId, index) => {
    const boat = allBoats.find((b) => b.id === boatId)!;
    return {
      boatId,
      boatName: boat.name,
      cellCode: h3IndexToShortCode(boat.currentCell),
      receivedAtMs: index * 1500, // 1.5 seconds per hop
      lat: boat.lat,
      lng: boat.lng,
      status: 'waiting' as const,
    };
  });
}
