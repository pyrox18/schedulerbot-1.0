import { Document, Schema, Model, model } from 'mongoose';

import { Event } from '../interfaces/event.interface';

export interface EventDocument extends Event, Document {

}

export let EventSchema: Schema = new Schema({
  name: String,
  startDate: Date,
  endDate: Date
});

export let EventModel: Model<EventDocument> = model<EventDocument>("Event", EventSchema);
export default EventModel;