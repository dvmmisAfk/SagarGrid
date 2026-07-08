import { create } from 'zustand';

export type DTNStatus = 'buffered' | 'carrying' | 'delivered' | 'expired';

export interface DTNMessage {
  id: string;
  type: 'sos' | 'hazard' | 'ping';
  originBoatId: string;
  originBoatName: string;
  originCell: string;
  payload: string;
  createdAt: Date;
  ttlHours: number; // time-to-live before the message expires
  carrierId?: string; // which boat is currently carrying this
  carrierName?: string;
  carriedSince?: Date;
  deliveredAt?: Date;
  status: DTNStatus;
  hopCount: number;
}

interface DTNStore {
  messages: DTNMessage[];
  bufferMessage: (
    msg: Omit<DTNMessage, 'id' | 'status' | 'hopCount' | 'createdAt'>
  ) => void;
  assignCarrier: (msgId: string, carrierId: string, carrierName: string) => void;
  deliverMessage: (msgId: string) => void;
  clearDelivered: () => void;
  clearAll: () => void;
}

export const useDTNStore = create<DTNStore>((set) => ({
  messages: [],

  bufferMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: `dtn-${Date.now()}`,
          status: 'buffered',
          hopCount: 0,
          createdAt: new Date(),
        },
      ],
    })),

  assignCarrier: (msgId, carrierId, carrierName) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === msgId
          ? {
              ...m,
              status: 'carrying',
              carrierId,
              carrierName,
              carriedSince: new Date(),
              hopCount: m.hopCount + 1,
            }
          : m
      ),
    })),

  deliverMessage: (msgId) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === msgId ? { ...m, status: 'delivered', deliveredAt: new Date() } : m
      ),
    })),

  clearDelivered: () =>
    set((state) => ({ messages: state.messages.filter((m) => m.status !== 'delivered') })),

  clearAll: () => set({ messages: [] }),
}));
