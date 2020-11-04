# Python in Minecraft Education Edition

Python support in Minecraft Education Edition is available through the Code Builder interface (`C` in game). It is currently in early prototype form, but supports client-side scripting equivalent to blocks or commands.

Unlike the existing APIs used by external code tools, Python code is submitted as text to the game engine and is executed in process. There is no need for editors to compile or interpret source code at all.

## Contents

Page | Overview
-----|---------
[Examples](#examples) | Quick-start examples
[Enumerations](#enumerations) | Enumerations
[Easy API](#easy-api) | The available APIs for directly submitted code
[Agent](#agent) | The `agent` object
[Player](#player) | The `player` object
[World](#world) | The `world` object
[Location](#locations) | Relative and world position handling
[Events](#events) | Game events
[Mobs](#mobs) | Interacting with mobs
[Dev Docs](dev_docs.md) | Information for developers

## Examples

These examples are intended to quickly illustrate how Python code may be written to interact with the game. Unless otherwise specified, they assume the [Easy API](#easy-api) (that is, they _must_ be submitted via Code Builder).

### Meet the Agent

```python
agent.teleport()
agent.move("Forward")
agent.move("Forward")
agent.turn("Left")
agent.turn("Left")
agent.say("Hello. I am your Agent")
```

### Build a tower

```python
# Start a little bit away from the player
agent.teleport(from_me(0, 0, -10))
start_position = agent.position

agent.give(("wool", 2), 3, 1)
agent.give(("wool", 3), 3, 2)
agent.give(("wool", 4), 3, 3)
for i in range(9):
    agent.place((i % 3) + 1, "forward")
    agent.move("up")

# Jump back to the start and look proud
agent.position = start_position
agent.turn("right")
agent.move("forward")
agent.turn("left")
agent.say("All finished! :)")
```

### Fight a horde of zombies

```python
import math
import random

world.set_difficulty("easy")

zombie_count = 10

for i in range(zombie_count):
    x = 10 * math.sin(i * 2 * math.pi / zombie_count)
    z = 10 * math.cos(i * 2 * math.pi / zombie_count)
    mob = spawn("zombie", from_me(x, 0, z))
    weapon = random.choice(["nothing", "golden sword", "wooden shovel"])
    if weapon != "nothing":
        mob.give(weapon)
    helmet = random.choice(["nothing", "golden helmet", "iron helmet"])
    if helmet != "nothing":
        mob.give(helmet, "head")

give("diamond sword", 1)
show_title("Good luck...", stay=30)
```

### Fight a horde of zombies with events

```python
import math
import random

zombie_count = 10

@once
def start_fight():
    world.set_difficulty("easy")

    for i in range(zombie_count):
        x = 10 * math.sin(i * 2 * math.pi / zombie_count)
        z = 10 * math.cos(i * 2 * math.pi / zombie_count)
        mob = spawn("zombie", from_me(x, 0, z))
        weapon = random.choice(["nothing", "golden sword", "wooden shovel"])
        if weapon != "nothing":
            mob.give(weapon)
        helmet = random.choice(["nothing", "golden helmet", "iron helmet"])
        if helmet != "nothing":
            mob.give(helmet, "head")

    give("diamond sword", 1)
    show_title("Good luck...", stay=30)

def on_mob_killed(mob, weapon, is_monster):
    if mob == "zombie":
        agent.say("You get 'im, boss!")
```

### Lots of Apples

```python
for i in range(64):
    player.give("apple", i+1, i)
```

### Chicken Rain

```python
import random

chickens = 100
for _ in range(chickens):
    pos = from_me(
        random.randrange(-20, 20),
        10,
        random.randrange(-20, 20),
    )
    # spawn("chicken", pos) will drop raw chicken meat everywhere
    summon("chicken", pos)
```

### TODO: More

## Enumerations

All functions in the Python API take string literals as identifiers for blocks, items, and other enumerations. These are converted through an internal mapping to match the name expected by Minecraft, which means you may pass a variety of strings and see the same result.

At present, the mapping removes all non-alphanumeric characters from the string and converts it to uppercase.

For example, while the `/give` command requires `diamond_sword` in order to succeed, the `give()` function can take values such as `diamondsword`, `Diamond Sword` or even `DIAMOND-SWORD!!!`. Internally, these are all mapped to `DIAMONDSWORD` and used to locate the correct string `diamond_sword` (which also maps to `DIAMONDSWORD`).

If no mapping is found, an error is raised. Where possible, the full list of available names will be attached to the error, but not included in the message (as these lists may be very long).

When names are returned from functions or events, they are converted into "nice" names. These are all lowercase and use spaces instead of underscores or CamelCase. These names should always be convertible back through the mapping operation described above.

### Data values and JSON components

For blocks and items that may include data values and component information, a tuple may be passed instead of a string. For example, passing `'planks'` implies a data value of 0, whereas passing `('planks', 2)` specifies the data value as 2. To pass JSON component data, use the third element of the tuple, for example, `('wooden axe', 0, '{"minecraft:can_destroy":{"blocks":["log2"]}}')`.

Alternatively, you can pass either a data value or components in the string with a `#` separator, such as `'planks#2'` or `'wooden axe#{"minecraft:can_destroy":{"blocks":["log2"]}}'`. When a return value includes a non-zero data value, it is added to the nice name using this syntax. (JSON components are not returned.)

## Easy API

When Python code is written and submitted through Code Builder, it is executed in a preconfigured environment called the "Easy API". This environment includes imports and singleton objects related to Minecraft, allowing users to write interesting code without having to `import` and instantiate many classes (though they still may do this).

Additionally, functions defined in the Easy API using the `on_<event_name>` naming convention will automatically subscribe to game events and be converted to event objects (see [Events](#events) for more information).

The following objects and functions are available in the Easy API:

Variable | Description
---------|------------
`add_listener(event name, function)` | Explicitly register an event handler
`agent` | The current player's agent
`clear_inventory` | Clear the current player's inventory
`@forever` | Call the associated function repeatedly
`from_me(x, y, z)` | Create a location relative to the current player
`give(item, count)` | Give something to the current player
`help()` | Triggers a tutorial
`@on_event(name, [attached=True])` | Explicitly mark a function as an event handler
`@once` | Mark a function to be called immediately
`play_sound(sound, [location])` | Plays a sound effect
`player` | The current player
`say(...)` | Say something as the current player
`show_title([title], [subtitle], [action bar])` | Shows a title to all players
`spawn(item or mob, [location], [amount=1])` | Spawns an item or mob
`summon(mob, [location], [amount=1])` | Spawn a mob
`world` | The current world
`_exec(command, *args)` | Helper for executing commands directly

Note: The `remove_listener()` function is not available in the Easy API. To remove an event listener, call `.remove()` on the object returned from `add_listener()` or the function itself when using `@on_event`.

Because Python code executes as it is being defined, when loops are used outside of a function (or when functions are called from the top-level) only events defined before that point will be attached, and they may not be executed until the main code is finished. In general, it is better to either use only simple code (no event handlers), or only event handlers (including `@once` and `@forever` to automatically call functions).

To reset code run through the Easy API, submit a new piece of code. Code execution is not cumulative, and all previous events will be reset.

## Agent

The `minecraft.agent.Agent` class represents the current player's agent. It provides the following members:

Member | Description
-------|------------
`attack(direction)` | Makes the agent attack in the given direction
`collect([item])` | Collects all items of the given type near the agent
`destroy(direction)` | Destroys a block in the given direction
`drop(slot number, [quantity], [direction='forward'])` | Drops [all] items from the agent's inventory slot
`get_item(slot number)` | Returns the name of the item in the agent's inventory slot
`get_item_count(slot number)` | Returns the number of items in the agent's inventory slot
`give(item, quantity, slot number)` | Puts a block or item in the agent's inventory slot
`inspect(direction)` | Returns the name of the block in the given direction from the agent
`inspect_data(direction)` | Returns the data value of the block in the given direction
`move(direction)` | Attempts to move the agent in the given direction
`place(slot number, direction)` | Places a block or uses an item from the agent's inventory
`position` | Gets or sets the location of the agent
`rotation` | Gets the angular rotation of the agent in degrees (not writable)
`say(...)` | Makes the agent say something
`teleport([location])` | Teleports the agent to a location if specified, or else to the player
`till(direction)` | Tills the ground in the given direction
`transfer(slot number, quantity, dest slot number)` | Moves a number of items from one slot to another
`turn(turn direction)` | Turns the agent in the given direction

Valid directions are: `forward`, `forwards`, `back`, `backward`, `backwards`, `left`, `right`, `up`, `down`.

Valid turn directions are: `left`, `right`.

Valid slot numbers are between 1 and 27, inclusive.

## Player

The `minecraft.player.Player` class represents one or more players. By default it represents the current player, but the selector (default `@s`) can be specified in the initializer as `key`. Alternatively, a player name can be specified in the initializer as `name` to associate the instance with that player (by using a selector `@p[name="{name}"]`). Passing `@a` as the selector allows the class to reference all players.

Some functions will fail with a runtime error if the caller does not have permission to perform the action on behalf of the targeted player.

The `Player` class provides the following members:

Member | Description
-------|------------
`ability(ability, [grant=True])` | Grants or revokes an ability
`add_effect(effect, [seconds=30], [amplifier=1], [hide_particles=False])` | Gives an effect to the player
`clear_effect([effect])` | Clears an effect from the player, or all effects if none specified
`clear_inventory()` | Clears the player's inventory
`clear_levels()` | Removes all experience levels from the player
`clear_title()` | Clears the title seen by the player
`enchant(enchantment, [level=1])` | Enchants the item currently held by the player
`gamemode(mode)` | Sets the player's game mode
`give(item, count, [slot number], [slot])` | Gives an item to the player
`give_experience(xp)` | Gives the player the specified amount of experience
`give_levels(levels)` | Gives or removes the specified number of experience levels to the player
`kill()` | Kills the player
`look_at(location)` | Makes the player look at a certain location (using `teleport`)
`play_sound(sound, [location], [volume=1.0], [pitch=1.0], [minimum volume=1.0])` | Plays a sound only the player can hear
`position` | Gets or sets the position of the player
`say(...)` | Makes the player say things
`show_title([title], [subtitle], [action bar], [fade in=10], [stay=70], [fade out=20])` | Show a title only the player can see
`teleport(location, [facing])` | Teleports the player to a location, optionally looking at a location
`turn(turn direction)` | Makes the player turn in a certain direction (using `teleport`)
`whisper(...)` | Whispers to the player

Valid abilities are `worldbuilder` and `mayfly`.

Valid game modes are `survival`, `creative`, `adventure`, `spectator`. (Note that the single character versions are not valid.)

Valid slot numbers and slots are found in the [`/replaceitem`](https://minecraft.gamepedia.com/Commands/replaceitem) documentation. When `give` is called without a slot, slot numbers 0-8 refer to `slot.hotbar N` and 9+ refer to `slot.inventory N-9`. When `give` is called without a slot number, the `/give` command is used instead.

## World

The `minecraft.world.World` class provides functions that impact the world. It provides the following members:

Member | Description
-------|------------
`clear_title()` | Clears the title seen by all players
`clone(begin, end, destination, [mask mode="replace"], [clone mode="normal"], [filter block])` | Clones blocks between `begin` and `end` to a point starting at `destination`
`fill(begin, end, block, [fill mode="replace"], [replace block])` | Fills space between `begin` and `end` with a given block
`gamerule` | A dictionary of the current game rules
`is_block(location, block)` | Tests if a particular block exists at a given location
`play_sound(sound, [location], [volume=1.0], [pitch=1.0], [minimum volume=1.0])` | Plays a sound all players can hear
`players` | A list of all the players in the game (as `Player` objects)
`put_in(location, item, count, slot number)` | Puts one or more items inside a container
`set(location, block, [mode="replace"])` | Sets a location to a particular block
`set_difficulty(difficulty)` | Sets the world difficulty
`show_title([title], [subtitle], [action bar], [fade in=10], [stay=70], [fade out=20])` | Show a title to all players
`spawn(item, [location], [amount=1])` | Spawns one or more items. If a mob is passed, behaves like `summon()`
`summon(mob, [location], [amount=1])` | Summons one or more mobs and returns a `Mob` object

When `summon()` or `spawn()` are called without a location, the default location is in front of the current player.

Valid difficulties are `peaceful`, `easy`, `normal`, `hard`.

Valid slot numbers for `put_in` are between 0 and 53, inclusive.

Valid modes for `set()` are `replace` (always replace the existing block), `destroy` (destroy and drop existing block) and `keep` (only set if there's nothing there).

Valid mask modes are `replace` (always replace all blocks), `masked` (only replace empty blocks) and `filtered` (only replace blocks matching `filter block`).

Valid clone modes are `normal` (leave the original blocks), `move` (replace original blocks with are) and `force` (don't fail when trying to clone overlapping regions).

Valid fill modes are `replace` (replace all blocks), `destroy` (destroy and drop existing blocks), `keep` (only fill empty space), `hollow` (only fill the six sides of the space), `outline` (only fill the twelve edges of the space).

## Locations

Locations are generally represented as tuples of `(x, y, z)` coordinates. Each coordinate may be an integer, floating point value, or a string (to allow use of `~` and `^` prefixes). A location may also be a simple string with three space-separated values, such as `'10 10 10'`.

```python
spawn('gold nugget', (7.5, 12.5, 7.5))
spawn('gold nugget', ('^', 20, '^10'))
spawn('gold nugget', "~ ~5 ~")
```

When returned, locations are represented as instances of `minecraft.location.Location`, which provides some additional functionality for combining and formatting locations, but otherwise behave the same as tuples. This allows the following equivalent operations:

```python
pos = player.position

spawn('gold nugget', pos)
spawn('gold nugget', (pos.x, pos.y, pos.z))
spawn('gold nugget', str(pos))
```

The `Location` class also supports some basic arithmetic. This is intended as assistance for skilled developers who can track where the position value came from. For teaching purposes, positions should always be treated as tuples.

```python
pos = player.position

spawn('gold nugget', (pos[0], pos[1] + 5, pos[2]))
spawn('gold nugget', pos + (0, 5, 0))

spawn('gold nugget', (pos[0] * 2, pos[1] * 2, pos[2] * 2))
spawn('gold nugget', pos * 2)
```

All APIs that accept locations will convert to the correct value, so there is no need to do any conversion manually. The `minecraft.location.as_loc()` function is used for conversion and accepts all variations.

The `from_me()` function also accepts all variations of location, and will convert them to a location that is relative to the player (that is, each element gains the `~` prefix).

## Events

The following events are supported and _require_ that their handler have the function signature shown. If there is a mismatch in the number of parameters, an error will occur and the event will be disconnected. Mismatches in parameter names will not be detected.

The function names shown here are recommended for use with the Easy API. The same normalization rules as for [enumerations](#enumerations) are used, once the leading `'on'` is ignored, and so other variations on the names are possible (including `onBlockBroken` camel-case, if you really want to make Python developers cry). The `add_listener` function does not care about the function name, and the `@on_event` decorator allows you to override the event name:

```python
def on_end_of_day():
    ...

def someone_kicked_the_bucket(cause, mob):
    ...

add_listener("player died", someone_kicked_the_bucket)

@on_event("Block Broken")
def when_a_block_gets_destroyed(block, tool, count):
    ...
```

Event Name | Function Signature
-----------|-------------------
BlockBroken | `def on_block_broken(block, tool, count)`
BlockPlaced | `def on_block_placed(block, tool, count, method)`
CameraUsed | `def on_camera_used(selfie)`
EndOfDay | `def on_end_of_day()`
EntitySpawned | `def on_entity_spawned(mob, spawner)`
ItemAcquired | `def on_item_acquired(item, count, method)`
ItemCrafted | `def on_item_crafted(item, count)`
ItemDropped | `def on_item_dropped(item, count)`
ItemEquipped | `def on_item_equipped(item, slot, enchants)`
ItemInteracted | `def on_item_interacted(item, count, method)`
ItemNamed | `def on_item_named(item)`
ItemSmelted | `def on_item_smelted(item)`
ItemUsed | `def on_item_used(item, method)`
MobKilled | `def on_mob_killed(mob, weapon, is_monster)`
MobSpawned | `def on_mob_spawned(mob, spawner)`
PlayerBounced | `def on_player_bounced(height, block)`
PlayerDied | `def on_player_died(cause, mob)`
PlayerMessage | `def on_player_message(message, sender, receiver, message_type)`
PlayerTeleported | `def on_player_teleported(distance)`
PlayerTravelled | `def on_player_travelled(location, mode, distance)`

Other events may be registered directly using `minecraft._builtins.subscribe_callback`, but there should be no need. The event helpers in `minecraft.event` and the Easy API will raise errors for unsupported event names.

Methods of classes may be used as event handlers with `add_listener` on `@on_event`. They are not automatically recognized by the Easy API. When using `@on_event`, the required pattern is to pass `add=False` to the decorator and manually enable the event when the object is constructed.

```python
class MyMiniGame:
    def __init__(self):
        # start the game and wait for the player to die
        self.on_player_died.add()

    @on_event(add=False)
    def on_player_died(self, cause, mob):
        # Disable the event to avoid re-entrancy
        self.on_player_died.remove()
        say("Game over!")
```

(If you do not follow this pattern for method event handlers, you will end up with a function that is not attached to your object instance, and so should omit the `self` parameter. As this looks very strange to Python developers, it is best to just avoid this case and delay enabling the event.)

## Mobs

The `minecraft.mob.Mob` class provides functions that apply to one or more mobs. Use the static `Mob.find` function to create an instance by selecting mobs using search criteria.

Internally, the `Mob` class contains a unique key that has been applied to the mobs as a tag. The selector then uses `@e[tag="{tag}"]` to apply actions to these mobs.

Mobs provide the following attributes:

Member | Description
-------|------------
`kill()` | Kills the mob(s)
`teleport(location)` | Teleports the mob(s) to a given location
`give(item, [slot="weapon"])` | Gives the mob(s) an item

Valid slots are `weapon` and `weapon2` (for most weapon items) and  `head`, `chest`, `legs` and `feet` (for most armor items).
