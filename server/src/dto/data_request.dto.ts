export interface DataRequestDTO {
  user_id: string;
  data_type: string;
  min: number;
  max: number;
  leq: boolean;
  geq: boolean;
}