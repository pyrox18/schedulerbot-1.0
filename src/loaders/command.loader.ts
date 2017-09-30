import { CommandClient } from 'eris';
import { CommandController } from '../controllers/command.controller';
import { MiscController } from '../controllers/misc.controller';

export function loadCommands(): void {
  let controllers: CommandController[] = [];
  controllers.push(new MiscController());
  for (let controller of controllers) {
    controller.registerCommands();
  }
}

export default loadCommands;