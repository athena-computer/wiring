import { Component } from '@voxelified/kel';
import type { Entity } from '@voxelified/kel';

const GRIDS = new Array<Entity>();
export default Component<{
	load: number
	power: number
	voltage: number
	powerIn: Entity
	powerOut: Entity
	minVoltage: number
	powerConsumption: number
	currPowerConsumption: number
}>();

export const GridInfo = Component<{
	load: number
	power: number
	voltage: number
	connections: Entity[]
}>();