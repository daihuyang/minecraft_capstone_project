import { InputType } from './InputType';

const itemList = ['all', 'acacia_door', 'acacia_fence_gate', 'acacia_stairs', 'activator_rail', 'allow', 'anvil', 'apple', 'appleenchanted', 'arrow', 'baked_potato', 'beacon', 'bed', 'bedrock', 'beef', 'beetroot', 'beetroot_seeds', 'birch_door', 'birch_fence_gate', 'birch_stairs', 'blaze_powder', 'blaze_rod', 'board', 'boat', 'bone', 'book', 'bookshelf', 'border_block', 'bow', 'bowl', 'bread', 'brewing_stand', 'brick', 'brick_block', 'brick_stairs', 'brown_mushroom', 'brown_mushroom_block', 'bucket', 'cactus', 'cake', 'camera', 'carpet', 'carrot', 'carrotonastick', 'cauldron', 'chainmail_boots', 'chainmail_chestplate', 'chainmail_helmet', 'chainmail_leggings', 'chest', 'chest_minecart', 'chicken', 'clay', 'clay_ball', 'clock', 'clownfish', 'coal', 'coal_block', 'coal_ore', 'cobblestone', 'cobblestone_wall', 'comparator', 'compass', 'cooked_beef', 'cooked_chicken', 'cooked_fish', 'cooked_porkchop', 'cooked_rabbit', 'cooked_salmon', 'cookie', 'crafting_table', 'dark_oak_door', 'dark_oak_fence_gate', 'dark_oak_stairs', 'daylight_detector', 'deadbush', 'deny', 'detector_rail', 'diamond', 'diamond_axe', 'diamond_block', 'diamond_boots', 'diamond_chestplate', 'diamond_helmet', 'diamond_hoe', 'diamond_leggings', 'diamond_ore', 'diamond_pickaxe', 'diamond_shovel', 'diamond_sword', 'dirt', 'dispenser', 'double_plant', 'dropper', 'dye', 'egg', 'emerald', 'emerald_block', 'emerald_ore', 'emptymap', 'enchanted_book', 'enchanting_table', 'end_portal_frame', 'end_stone', 'experience_bottle', 'feather', 'fence', 'fence_gate', 'fermented_spider_eye', 'fireball', 'fish', 'fishing_rod', 'flint', 'flint_and_steel', 'flower_pot', 'frame', 'furnace', 'ghast_tear', 'glass', 'glass_bottle', 'glass_pane', 'glowstone', 'glowstone_dust', 'gold_block', 'gold_ingot', 'gold_nugget', 'gold_ore', 'golden_apple', 'golden_axe', 'golden_boots', 'golden_carrot', 'golden_chestplate', 'golden_helmet', 'golden_hoe', 'golden_leggings', 'golden_pickaxe', 'golden_rail', 'golden_shovel', 'golden_sword', 'grass', 'gravel', 'gunpowder', 'hardened_clay', 'hay_block', 'heavy_weighted_pressure_plate', 'hopper', 'hopper_minecart', 'horsearmordiamond', 'horsearmorgold', 'horsearmoriron', 'horsearmorleather', 'ice', 'iron_axe', 'iron_bars', 'iron_block', 'iron_boots', 'iron_chestplate', 'iron_door', 'iron_helmet', 'iron_hoe', 'iron_ingot', 'iron_leggings', 'iron_ore', 'iron_pickaxe', 'iron_shovel', 'iron_sword', 'iron_trapdoor', 'jungle_door', 'jungle_fence_gate', 'jungle_stairs', 'ladder', 'lapis_block', 'lapis_ore', 'lead', 'leather', 'leather_boots', 'leather_chestplate', 'leather_helmet', 'leather_leggings', 'leaves', 'leaves2', 'lever', 'light_weighted_pressure_plate', 'lit_pumpkin', 'log', 'log2', 'magma_cream', 'melon', 'melon_block', 'melon_seeds', 'minecart', 'mob_spawner', 'monster_egg', 'mossy_cobblestone', 'mushroom_stew', 'muttoncooked', 'muttonraw', 'mycelium', 'nametag', 'nether_brick', 'nether_brick_fence', 'nether_brick_stairs', 'nether_wart', 'netherbrick', 'netherrack', 'netherstar', 'noteblock', 'oak_stairs', 'observer', 'obsidian', 'packed_ice', 'painting', 'paper', 'piston', 'planks', 'podzol', 'poisonous_potato', 'porkchop', 'portfolio', 'potato', 'potion', 'prismarine', 'prismarine_crystals', 'prismarine_shard', 'pufferfish', 'pumpkin', 'pumpkin_pie', 'pumpkin_seeds', 'quartz', 'quartz_block', 'quartz_ore', 'quartz_stairs', 'rabbit', 'rabbit_foot', 'rabbit_hide', 'rabbit_stew', 'rail', 'red_flower', 'red_mushroom', 'red_mushroom_block', 'red_sandstone', 'red_sandstone_stairs', 'redstone', 'redstone_block', 'redstone_lamp', 'redstone_ore', 'redstone_torch', 'reeds', 'repeater', 'rotten_flesh', 'saddle', 'salmon', 'sand', 'sandstone', 'sandstone_stairs', 'sapling', 'sealantern', 'shears', 'sign', 'skull', 'slime', 'slime_ball', 'snow', 'snow_layer', 'snowball', 'soul_sand', 'spawn_egg', 'speckled_melon', 'spider_eye', 'splash_potion', 'sponge', 'spruce_door', 'spruce_fence_gate', 'spruce_stairs', 'stained_hardened_clay', 'stick', 'sticky_piston', 'stone', 'stone_axe', 'stone_brick_stairs', 'stone_button', 'stone_hoe', 'stone_pickaxe', 'stone_pressure_plate', 'stone_shovel', 'stone_slab', 'stone_slab2', 'stone_stairs', 'stone_sword', 'stonebrick', 'stonecutter', 'string', 'sugar', 'tallgrass', 'tnt', 'tnt_minecart', 'torch', 'trapdoor', 'trapped_chest', 'tripwire_hook', 'vine', 'waterlily', 'web', 'wheat', 'wheat_seeds', 'wooden_axe', 'wooden_button', 'wooden_door', 'wooden_hoe', 'wooden_pickaxe', 'wooden_pressure_plate', 'wooden_shovel', 'wooden_slab', 'wooden_sword', 'wool', 'yellow_flower']

// namespace RandomTypeGenerator
export var RandomTypeGenerator = RandomTypeGenerator || {}

RandomTypeGenerator.GetRandomIntBetween = function (min, max): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

RandomTypeGenerator.RandomlyPickFrom = function (array): any {
  return array[RandomTypeGenerator.GetRandomIntBetween(0, array.length - 1)]
}

RandomTypeGenerator.GetRandom = function (inputType): any {
  var result
  switch (inputType) {
    case InputType.BLOCKPOS:
      result = `~${RandomTypeGenerator.GetRandomIntBetween(-10, 10)} ~${RandomTypeGenerator.GetRandomIntBetween(-10, 10)} ~${RandomTypeGenerator.GetRandomIntBetween(-10, 10)}`
      break
    case InputType.DIRECTION_2D:
      result = RandomTypeGenerator.RandomlyPickFrom(['forward', 'back', 'left', 'right'])
      break
    case InputType.DIRECTION_3D:
      result = RandomTypeGenerator.RandomlyPickFrom(['forward', 'back', 'left', 'right', 'up', 'down'])
      break
    case InputType.ITEMNAME:
      result = RandomTypeGenerator.RandomlyPickFrom(itemList)
      break
    case InputType.REDSTONE:
      result = RandomTypeGenerator.RandomlyPickFrom(['pulse', 'constant'])
      break
    case InputType.TARGET:
      result = 'Steve'
      break
    case InputType.TIME_NUMBER:
      result = RandomTypeGenerator.GetRandomIntBetween(0, 24000)
      break
    case InputType.TIME_STRING:
      result = RandomTypeGenerator.RandomlyPickFrom(['day', 'night'])
      break
    case InputType.LEFTRIGHT:
      result = RandomTypeGenerator.RandomlyPickFrom(['left', 'right'])
      break
  }
  return result
}