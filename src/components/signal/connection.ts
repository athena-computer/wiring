import { Component } from '@voxelified/kel';
import type { Entity } from '@voxelified/kel';

import type { Wire } from '../../types';
import { ConnectionType } from '../../enums';
export default Component<Connection>();

export interface Connection {
	name: string
	grid: Entity
	type: ConnectionType
	panel: Entity
	wires: Wire[]
	maxWires: number
	attachment: Attachment
}