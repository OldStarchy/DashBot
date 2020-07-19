## Command ideas

### `come here`

Walk to within 4 blocks of my current location

`coming-to-you`

### `stand here`

Come to my exact location and face the same way as me

`coming-to-you`

### `follow <me|username>`

Try to stay within 4 blocks of target player until signalled otherwise

`ok`

### `harvest this farm`

Find all the plants (eg. wheat / potatoes) of the same type next to the one I'm standing at, looking at most 2 blocks away from any previously found block.
For each one, harvest any fully grown ones, and replant it.

### `put [<quantifier>] [[of] (the|your)] <item> in <targetInventory>`

quantifier:

-   `all [(the|[of] your)]`
-   `<numericAmount>`
-   `half`
-   `all but <numericAmount>`

item:

-   `<minecraftItemId>`
-   `everything` Everything except your tools and food
-   `literally everything` Everything including tools and food

targetInventory:

-   `(this|that) (chest|minecart|barrel)` `in here`

Put the given quantity of items into the target inventory.
If the person giving the command is looking directly at an inventory block/entity, use it as the target inventory, otherwise find the closest one that matches the one listed. `in here` could be any chest|minecart|barrel. Special inventories (eg. furnaces, hoppers) TBC later.

### `take [<quantifier>] [[of] the] <item> from <targetInventory>`

Works the same as the above but the opposite.

### `kill <quantifier> <entity>`

Kill the given number of target entity.

Quantifiers that consider the current total (like `half`) will consider entities within a 10 block radius square (21x21 centred on the dashbot)

### Suffixes

#### `without moving`

Disallow moving during the given command. May cause some commands to fail.

#### `without jumping`

Disallow jumping during the given command. May cause some commands to fail.

### Routines

#### `start [a] new routine <routineName>`

Any commands will, in addition to being immediately executed, be recorded as a routine for future playback

#### `show routine [<routineName>]`

List the steps in the named routine, if no routine is given, show the routine currently being recorded. If not recording a routine, show the routine currently being executed. Else fail.

#### `when stopping`

Start recording tasks that must be completed when finishing or cancelling a routine.

#### `save`

Finishes recording a routine.

`Routine #routine.name# saved`

## Phrases

```json
{
	"coming-to-you": ["#moving#", "Coming", "I'll be there soon"],
	"arrived-at-you": ["#arrived-at-entity#", "Reporting for duty, Sir."],
	"moving": ["On my way", "En route", "Standby", "Made it, now what?"],
	"arrived": ["I'm here", "Motion accomplished"],
	"failed-to-arrive": [
		"I'm having translational difficulties, please send help",
		"Unable to reach destination",
		"I'm lost"
	],
	"arrived-at-location": [
		"Awaiting further instructions",
		"Destination reached"
	],
	"arrived-at-entity": ["Target reached"],
	"ok": ["OK", "Will do", "Sure thing", "Roger"],
	"received-item-from-player": [
		"Thank you Sir.",
		"I will cherish it always.",
		"I'm sure I asked for a tank, but I guess this is nice"
	]
}
```
