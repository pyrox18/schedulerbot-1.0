import { Document, Schema, Model, model, Types } from 'mongoose';

import { Event } from '../interfaces/event.interface';

export interface EventDocument extends Event, Document {
  _id: Types.ObjectId
}

export let EventSchema: Schema = new Schema({
  name: String,
  startDate: Date,
  endDate: Date,
  description: String
});

export let EventModel: Model<EventDocument> = model<EventDocument>("Event", EventSchema);
export default EventModel;