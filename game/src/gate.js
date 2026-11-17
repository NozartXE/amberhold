// The moving swarm gate: which meadow side the pests pour from each flow — east, north, west in a seeded cycle.
import { GATES } from './config.js';

export const GATE_CYCLE = ['EAST', 'NORTH', 'WEST'];
export function gateForFlow(seed, flow) { return GATE_CYCLE[((Number(seed) % 3) + 3 + flow - 1) % 3]; }
export function gateCell(side) { return GATES[side]; }
export function gateName(side) { return side; }
