import { world, query } from '@voxelified/kel';
import { Signal as Beacon } from '@rbxts/beacon';
import type { Entity, CreatedComponent } from '@voxelified/kel';

import type { Wire, Signal, SignalReceiverCallback } from './types';

import Connection from './components/signal/connection';
import SignalReceiver from './components/signal/signalReceiver';
import ConnectionPanel from './components/signal/connectionPanel';
import Powered, { GridInfo } from './components/power/powered';

export * from './types';
export { Powered, GridInfo, Connection, SignalReceiver, ConnectionPanel };
export function sendSignal(origin: Entity, value: string, connectionName: string) {
	const sig = {
		value,
		origin,
		stepsTaken: 1,
		connectionName
	} satisfies Signal;
	//print(`attempting to send signal containing [${value}] to "${connectionName}"`);
	for (const [connection, entity] of origin.queryChildren([Connection, 'ENTITY'] as const))
		if (connection.name === connectionName)
			for (const wire of connection.wires) {
				const recipient = getOtherWireConnection(wire, entity);
				if (recipient) {
					const component = recipient.getComponent(Connection);
					recipient.parent!.getComponent(SignalReceiver)?.data(sig, [component!.data, recipient]);
				}
			}
}

export function getOtherWireConnection({ connections }: Wire, whosAsking: Entity) {
	if (whosAsking === connections[0])
		return connections[1];
	else if (whosAsking === connections[1])
		return connections[0];
	return undefined;
}

export function connect(connection1: Entity, connection2: Entity) {
	const conn1 = connection1.getComponent(Connection)!.data;
	const conn2 = connection2.getComponent(Connection)!.data;
	const wire = {
		connections: [connection1, connection2]
	} satisfies Wire;
	conn1.wires.push(wire);
	conn2.wires.push(wire);

	const rope = new Instance('RopeConstraint');
	rope.Length = conn1.attachment.Position.sub(conn2.attachment.Position).Magnitude + 2;//6;
	rope.Visible = true;
	rope.Attachment0 = conn1.attachment;
	rope.Attachment1 = conn2.attachment;
	rope.Parent = conn1.attachment;
}

const PENDING_RECIPIENTS: [Entity, Attachment][] = [];
const CONNECTION_CREATED = new Beacon<[Entity, Attachment]>();
export function createConnectionPanel(instance: BasePart, components: CreatedComponent[], signalReceiverCallback?: SignalReceiverCallback) {
	const connections: Entity[] = [];
	if (signalReceiverCallback)
		components.unshift(SignalReceiver(signalReceiverCallback));

	const panel = world.add(
		ConnectionPanel({
			connections
		}),
		...components
	);

	const gridConnections: Entity[] = [];
	const grid = world.add(
		GridInfo({
			load: 0,
			power: 0,
			voltage: 0,
			connections: gridConnections
		})
	);

	for (const child of instance.GetChildren()) {
		const [childType, name] = child.Name.split(':');
		if (childType === 'connection' && name) {
			const entity = world.add(
				Connection({
					name,
					grid,
					type: instance.GetAttribute('type') as number,
					panel,
					wires: [],
					maxWires: 5,
					attachment: child as Attachment
				})
			);
			panel.addChildren([entity]);

			for (const child2 of child.GetChildren())
				if (child2.Name === 'initialRecipient' && child2.IsA('ObjectValue')) {
					const connectToRecipient = (instance: Instance) => {
						for (const [ent, recipient] of query(['ENTITY', Connection] as const))
							if (recipient.attachment === instance) {
								connect(entity, ent);
								return;
							}
	
						PENDING_RECIPIENTS.push([entity, instance as Attachment]);
					};
	
					const value = child2.Value;
					if (value)
						connectToRecipient(value);
					else
						child2.GetPropertyChangedSignal('Value')
							.Once(() => connectToRecipient(child2.Value!));
				}

			for (let i = 0; i < PENDING_RECIPIENTS.size(); i++) {
				const [ent, instance] = PENDING_RECIPIENTS[i];
				if (instance === child) {
					connect(ent, entity);
					PENDING_RECIPIENTS.remove(i);
					break;
				}
			}

			CONNECTION_CREATED.FireDeferred(entity, child as Attachment);
		}
	}

	for (const connection of connections)
		gridConnections.push(connection);
	return panel;
}