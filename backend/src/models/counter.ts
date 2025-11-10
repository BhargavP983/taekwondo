import mongoose, { Schema, Document } from 'mongoose';

interface ICounter extends Document {
  _id: string; // name of the sequence (e.g., 'cadet', 'poomsae')
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 }
});

export const Counter = mongoose.model<ICounter>('Counter', counterSchema);

/**
 * Get next sequence number for a given key atomically.
 * If the counter doc doesn't exist yet, initialize with existing max + 1.
 */
export async function getNextSequence(key: string, computeInitial?: () => Promise<number>): Promise<number> {
  // Try atomic increment first
  const updated = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true }
  );
  if (updated) return updated.seq;

  // Need to initialize
  let start = 1;
  if (computeInitial) {
    try {
      const initial = await computeInitial();
      // start from initial + 1 so next id reflects existing data
      start = initial + 1;
    } catch {
      start = 1;
    }
  }
  const created = await Counter.create({ _id: key, seq: start });
  return created.seq;
}
