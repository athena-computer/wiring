import type { Entity } from '@voxelified/kel';

import type { Connection } from './components/signal/connection';
export interface Wire {
	connections: [Entity?, Entity?]
}

export interface Signal {
	value: string
	origin: Entity
	stepsTaken: number
	connectionName: string
}

export type SignalReceiverCallback = (signal: Signal, connection: [Connection, Entity]) => void