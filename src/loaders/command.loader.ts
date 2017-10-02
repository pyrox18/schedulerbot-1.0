import { CommandClient } from 'eris';
import { CommandController } from '../controllers/command.controller';
import { MiscController } from '../controllers/misc.controller';
import { CalendarController } from '../controllers/calendar.controller';
import { AdminController } from '../controllers/admin.controller';

export function loadCommands(): void {
  let controllers: CommandController[] = [];
  controllers.push(new MiscController());
  controllers.push(new CalendarController());
  controllers.push(new AdminController());
  for (let controller of controllers) {
    controller.registerCommands();
  }
}

export default loadCommands;