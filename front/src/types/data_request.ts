export type DataRequest = {
  id: string;
  user_id: string;
  data_type: string;
  min: number;
  max: number;
  leq: boolean;
  geq: boolean;
  exp_date: number;
};