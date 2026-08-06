export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: number;
          reference: string;
          client: string;
          model: string;
          quantity: number;
          agent: string;
          manager: string;
          stage: number;
          status: string;
          priority: string;
          target_delivery: string | null;
          next_action: string;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
      };
      units: {
        Row: {
          id: number;
          cs_number: string;
          vin_number: string | null;
          engine_number: string | null;
          model_description: string;
          color: string;
          location: string;
          status: string;
          client_id: number | null;
          sales_consultant: string | null;
          date_assigned: string | null;
          date_released: string | null;
          dealers_price: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["units"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["units"]["Row"]>;
      };
      clients: {
        Row: {
          id: number;
          name: string;
          account_type: string;
          contact_person: string;
          contact_number: string;
          philgeps_itb_no: string | null;
          procurement_entity: string | null;
          abc_amount: number | null;
          unit_to_be_used: string | null;
          remarks: string | null;
          legal_checked: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Row"]>;
      };
      documents: {
        Row: {
          id: number;
          doc_name: string;
          doc_type: string;
          unit_cs_number: string | null;
          client_id: number | null;
          status: string;
          file_url: string | null;
          notarial_status: string | null;
          transmittal_status: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
      };
      expenses: {
        Row: {
          id: number;
          unit_cs_number: string | null;
          project_name: string;
          requested_amount: number;
          approved_amount: number;
          released_amount: number;
          liquidated_amount: number;
          unliquidated_balance: number;
          status: string;
          remarks: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["expenses"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Row"]>;
      };
      releases: {
        Row: {
          id: number;
          unit_cs_number: string;
          client_name: string;
          sales_agent: string;
          gate_pass_status: string;
          is_ready: boolean;
          released_with_pending: boolean;
          pending_reason: string | null;
          release_status: string;
          actual_release_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["releases"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["releases"]["Row"]>;
      };
      people: {
        Row: {
          id: number;
          full_name: string;
          role: string;
          department: string;
          department_start_date: string | null;
          contact_number: string | null;
          email: string | null;
          active_status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["people"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["people"]["Row"]>;
      };
    };
  };
}
