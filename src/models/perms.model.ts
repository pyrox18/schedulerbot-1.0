import { Document, Schema, Model, model } from 'mongoose';

import { Perms } from '../interfaces/perms.interface';

export interface PermsDocument extends Perms, Document {

}

export let PermsSchema: Schema = new Schema({
  node: String,
  deniedRoles: [String],
  deniedUsers: [String]
});

export let PermsModel: Model<PermsDocument> = model<PermsDocument>("Perms", PermsSchema);
export default PermsModel;