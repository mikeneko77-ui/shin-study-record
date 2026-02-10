export type Record = {
  id: string;
  title: string;
  time: number;
};

export const formatTime = (time: number): string => `${time}時間`;
