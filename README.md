# Athena Wiring
A basic [roblox-ts](https://github.com/roblox-ts/roblox-ts) wiring system for the [kel framework](https://github.com/voxelified/kel), based off of [Barotrauma](https://github.com/Regalis11/Barotrauma)'s wiring.
```sh
yarn add @athena-computer/wiring
```

```ts
import { Workspace } from '@rbxts/services';
import { createConnectionPanel } from '@athena-computer/wiring';

const part = Workspace.Part;
createConnectionPanel(part, [], (signal, [connection]) => {
	if (connection.name === 'set_state')
		part.Transparency = signal.value !== '0' ? 0 : 1;
});
```

here's an accommodating [Studio Plugin](https://create.roblox.com/marketplace/asset/14782494874/Wiring-Library-Assist)!
