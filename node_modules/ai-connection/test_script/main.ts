import { Command, CommandInput } from './Command';
import { InputType } from './InputType';
import CommandFactory from './CommandFactory';
import { RandomTypeGenerator } from './RandomTypeGenerator';
import { SequenceCommandQueue } from './SequenceCommandQueue';
import { RandomCommandQueue, RandomCommandQueueMode } from './RandomCommandQueue';
import { CommandQueue } from './CommandQueue';
var commandFactory = new CommandFactory();

function initalize() {
    commandFactory.addCommand(new Command('move', [new CommandInput('direction', InputType.DIRECTION_3D)], 'success'));
    commandFactory.addCommand(new Command('turn', [new CommandInput('direction', InputType.LEFTRIGHT)], 'success'));
    commandFactory.addCommand(new Command('place', [new CommandInput('slotNum', InputType.NUMBER, () => { return RandomTypeGenerator.GetRandomIntBetween(1, 27) }),
    new CommandInput('direction', InputType.DIRECTION_3D)], 'success'));
    commandFactory.addCommand(new Command('attack', [new CommandInput('direction', InputType.DIRECTION_3D)], 'success'));
    commandFactory.addCommand(new Command('destroy', [new CommandInput('direction', InputType.DIRECTION_3D)], 'success'));
    commandFactory.addCommand(new Command('till', [new CommandInput('direction', InputType.DIRECTION_3D)], 'success'));
    commandFactory.addCommand(new Command('collect', [new CommandInput('item', InputType.ITEMNAME)], 'success'));
    commandFactory.addCommand(new Command('drop', [new CommandInput('slotNum', InputType.NUMBER, () => { return RandomTypeGenerator.GetRandomIntBetween(1, 27) }),
    new CommandInput('quantity', InputType.NUMBER, () => { return RandomTypeGenerator.GetRandomIntBetween(1, 64) }),
    new CommandInput('direction', InputType.DIRECTION_2D)], 'success'));
    commandFactory.addCommand(new Command('dropall', [new CommandInput('direction', InputType.DIRECTION_2D)], 'success'));
    commandFactory.addCommand(new Command('detect', [new CommandInput('direction', InputType.DIRECTION_3D)], 'success'));
    commandFactory.addCommand(new Command('inspect', [new CommandInput('direction', InputType.DIRECTION_3D)], 'itemName'));
    commandFactory.addCommand(new Command('detectredstone', [new CommandInput('direction', InputType.DIRECTION_3D)], 'success'));
    commandFactory.addCommand(new Command('getitemdetail', [new CommandInput('slotNum', InputType.NUMBER, () => { return RandomTypeGenerator.GetRandomIntBetween(1, 27) })], 'itemName'));
    commandFactory.addCommand(new Command('getitemspace', [new CommandInput('slotNum', InputType.NUMBER, () => { return RandomTypeGenerator.GetRandomIntBetween(1, 27) })], 'stackCount'));
    commandFactory.addCommand(new Command('getitemcount', [new CommandInput('slotNum', InputType.NUMBER, () => { return RandomTypeGenerator.GetRandomIntBetween(1, 27) })], 'stackCount'));
    commandFactory.addCommand(new Command('transfer', [new CommandInput('srcSlotNum', InputType.NUMBER, () => { return RandomTypeGenerator.GetRandomIntBetween(1, 27) }),
    new CommandInput('quantity', InputType.NUMBER, () => { return RandomTypeGenerator.GetRandomIntBetween(1, 64) }),
    new CommandInput('dstSlotNum', InputType.NUMBER, () => { return RandomTypeGenerator.GetRandomIntBetween(1, 27) })], 'success'));
}

function prepareQueue(): CommandQueue {
    // TODO: User's selection between SequenceCommandQueue <-> RandomCommandQueue ( Infinite <-> Finite )
    return new RandomCommandQueue(commandFactory, RandomCommandQueueMode.INFINITE);
}

function executeCommands(commandQueue: CommandQueue) {
    commandQueue.begin()
    while (!commandQueue.isDone()) {
        commandQueue.update()
    }
}

function app() {
    initalize();
    let queue = prepareQueue();
    executeCommands(queue);
    process.exit();
}

app();
