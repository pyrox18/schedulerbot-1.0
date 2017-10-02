import { Types } from 'mongoose';

export interface Event {
  _id: Types.ObjectId,
  name: string,
  startDate: Date,
  endDate: Date
}

export default Event;