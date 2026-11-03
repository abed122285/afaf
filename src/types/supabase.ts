export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_url: string
          id: string
          mime_type: string
          organization_id: string
          storage_bucket: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size?: number
          file_url: string
          id?: string
          mime_type: string
          organization_id: string
          storage_bucket?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          mime_type?: string
          organization_id?: string
          storage_bucket?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_code: string
          actor_role: string
          actor_user_id: string | null
          actor_username: string
          created_at: string
          entity_id: string
          entity_type: string
          event_category: string
          id: string
          ip_address: string | null
          metadata_json: Json
          organization_id: string
          summary_ar: string
          summary_fr: string
        }
        Insert: {
          action_code: string
          actor_role?: string
          actor_user_id?: string | null
          actor_username?: string
          created_at?: string
          entity_id: string
          entity_type: string
          event_category?: string
          id?: string
          ip_address?: string | null
          metadata_json?: Json
          organization_id: string
          summary_ar: string
          summary_fr: string
        }
        Update: {
          action_code?: string
          actor_role?: string
          actor_user_id?: string | null
          actor_username?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_category?: string
          id?: string
          ip_address?: string | null
          metadata_json?: Json
          organization_id?: string
          summary_ar?: string
          summary_fr?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_of_material_items: {
        Row: {
          bom_id: string
          id: string
          material_id: string
          notes: string | null
          quantity_per_unit: number
          wastage_percent: number
        }
        Insert: {
          bom_id: string
          id?: string
          material_id: string
          notes?: string | null
          quantity_per_unit: number
          wastage_percent?: number
        }
        Update: {
          bom_id?: string
          id?: string
          material_id?: string
          notes?: string | null
          quantity_per_unit?: number
          wastage_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "bill_of_material_items_bom_id_fkey"
            columns: ["bom_id"]
            isOneToOne: false
            referencedRelation: "bill_of_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_of_material_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_of_materials: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          model_id: string
          notes: string | null
          organization_id: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          model_id: string
          notes?: string | null
          organization_id: string
          version?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          model_id?: string
          notes?: string | null
          organization_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_of_materials_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_of_materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_movements: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          direction: string
          id: string
          idempotency_key: string
          movement_date: string
          movement_number: string
          organization_id: string
          payment_method: string
          reference_id: string
          reference_type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          direction: string
          id?: string
          idempotency_key: string
          movement_date?: string
          movement_number: string
          organization_id: string
          payment_method?: string
          reference_id: string
          reference_type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          direction?: string
          id?: string
          idempotency_key?: string
          movement_date?: string
          movement_number?: string
          organization_id?: string
          payment_method?: string
          reference_id?: string
          reference_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          code: string
          created_at: string
          domain: string
          id: string
          name_ar: string
          name_fr: string
          organization_id: string
        }
        Insert: {
          code: string
          created_at?: string
          domain: string
          id?: string
          name_ar: string
          name_fr: string
          organization_id: string
        }
        Update: {
          code?: string
          created_at?: string
          domain?: string
          id?: string
          name_ar?: string
          name_fr?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          code: string
          created_at: string
          full_name: string
          id: string
          measurements_json: Json
          notes: string | null
          organization_id: string
          outstanding_balance: number
          phone: string
          tier: string | null
          total_spent: number
          updated_at: string
          wilaya: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          full_name: string
          id?: string
          measurements_json?: Json
          notes?: string | null
          organization_id: string
          outstanding_balance?: number
          phone: string
          tier?: string | null
          total_spent?: number
          updated_at?: string
          wilaya?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          full_name?: string
          id?: string
          measurements_json?: Json
          notes?: string | null
          organization_id?: string
          outstanding_balance?: number
          phone?: string
          tier?: string | null
          total_spent?: number
          updated_at?: string
          wilaya?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          attachment_url: string | null
          beneficiary: string | null
          category_id: string | null
          created_at: string
          description: string | null
          expense_date: string
          expense_number: string
          id: string
          idempotency_key: string
          organization_id: string
          payment_method: string
          recorded_by: string | null
          title_ar: string
          title_fr: string
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          beneficiary?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_number: string
          id?: string
          idempotency_key: string
          organization_id: string
          payment_method?: string
          recorded_by?: string | null
          title_ar: string
          title_fr: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          beneficiary?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_number?: string
          id?: string
          idempotency_key?: string
          organization_id?: string
          payment_method?: string
          recorded_by?: string | null
          title_ar?: string
          title_fr?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      finished_products: {
        Row: {
          available_qty: number
          color_label: string
          created_at: string
          id: string
          model_id: string
          name_ar: string
          name_fr: string
          on_hand_qty: number
          organization_id: string
          primary_image_url: string | null
          production_order_id: string | null
          reserved_qty: number
          selling_price: number
          size_label: string
          sku: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          available_qty?: number
          color_label: string
          created_at?: string
          id?: string
          model_id: string
          name_ar: string
          name_fr: string
          on_hand_qty?: number
          organization_id: string
          primary_image_url?: string | null
          production_order_id?: string | null
          reserved_qty?: number
          selling_price?: number
          size_label: string
          sku: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          available_qty?: number
          color_label?: string
          created_at?: string
          id?: string
          model_id?: string
          name_ar?: string
          name_fr?: string
          on_hand_qty?: number
          organization_id?: string
          primary_image_url?: string | null
          production_order_id?: string | null
          reserved_qty?: number
          selling_price?: number
          size_label?: string
          sku?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finished_products_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finished_products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finished_products_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      finished_stock_movements: {
        Row: {
          created_at: string
          direction: string
          finished_product_id: string
          id: string
          idempotency_key: string
          movement_type: string
          organization_id: string
          quantity: number
          reason: string
          reference_id: string
          reference_type: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          direction: string
          finished_product_id: string
          id?: string
          idempotency_key: string
          movement_type: string
          organization_id: string
          quantity: number
          reason: string
          reference_id: string
          reference_type: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          direction?: string
          finished_product_id?: string
          id?: string
          idempotency_key?: string
          movement_type?: string
          organization_id?: string
          quantity?: number
          reason?: string
          reference_id?: string
          reference_type?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "finished_stock_movements_finished_product_id_fkey"
            columns: ["finished_product_id"]
            isOneToOne: false
            referencedRelation: "finished_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finished_stock_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          discount_amount: number
          finished_product_id: string | null
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          snapshot_color: string
          snapshot_name_ar: string
          snapshot_name_fr: string
          snapshot_size: string
          snapshot_sku: string
          unit_cost_snapshot: number
          unit_price: number
        }
        Insert: {
          discount_amount?: number
          finished_product_id?: string | null
          id?: string
          invoice_id: string
          line_total: number
          quantity: number
          snapshot_color: string
          snapshot_name_ar: string
          snapshot_name_fr: string
          snapshot_size: string
          snapshot_sku: string
          unit_cost_snapshot?: number
          unit_price: number
        }
        Update: {
          discount_amount?: number
          finished_product_id?: string | null
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          snapshot_color?: string
          snapshot_name_ar?: string
          snapshot_name_fr?: string
          snapshot_size?: string
          snapshot_sku?: string
          unit_cost_snapshot?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_finished_product_id_fkey"
            columns: ["finished_product_id"]
            isOneToOne: false
            referencedRelation: "finished_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string | null
          discount_amount: number
          document_status: string
          due_date: string
          id: string
          idempotency_key: string
          invoice_number: string
          issue_date: string
          notes: string | null
          organization_id: string
          paid_amount: number
          payment_status: string
          refunded_amount: number
          remaining_balance: number
          sale_id: string | null
          subtotal: number
          tax_amount: number
          tax_percent: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number
          document_status?: string
          due_date?: string
          id?: string
          idempotency_key: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          organization_id: string
          paid_amount?: number
          payment_status?: string
          refunded_amount?: number
          remaining_balance?: number
          sale_id?: string | null
          subtotal?: number
          tax_amount?: number
          tax_percent?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount_amount?: number
          document_status?: string
          due_date?: string
          id?: string
          idempotency_key?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          organization_id?: string
          paid_amount?: number
          payment_status?: string
          refunded_amount?: number
          remaining_balance?: number
          sale_id?: string | null
          subtotal?: number
          tax_amount?: number
          tax_percent?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      material_stock_movements: {
        Row: {
          balance_after_available: number
          balance_after_on_hand: number
          created_at: string
          direction: string
          id: string
          idempotency_key: string
          material_id: string
          movement_type: string
          organization_id: string
          performed_by: string | null
          quantity: number
          reason: string
          reference_id: string
          reference_type: string
          total_cost: number
          unit_cost: number
        }
        Insert: {
          balance_after_available: number
          balance_after_on_hand: number
          created_at?: string
          direction: string
          id?: string
          idempotency_key: string
          material_id: string
          movement_type: string
          organization_id: string
          performed_by?: string | null
          quantity: number
          reason: string
          reference_id: string
          reference_type: string
          total_cost?: number
          unit_cost?: number
        }
        Update: {
          balance_after_available?: number
          balance_after_on_hand?: number
          created_at?: string
          direction?: string
          id?: string
          idempotency_key?: string
          material_id?: string
          movement_type?: string
          organization_id?: string
          performed_by?: string | null
          quantity?: number
          reason?: string
          reference_id?: string
          reference_type?: string
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "material_stock_movements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_stock_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          available_qty: number
          average_cost: number
          category_id: string | null
          color: string | null
          created_at: string
          description: string | null
          id: string
          last_purchase_cost: number
          min_stock_threshold: number
          name_ar: string
          name_fr: string
          on_hand_qty: number
          organization_id: string
          primary_image_url: string | null
          reserved_qty: number
          sku: string
          storage_location: string | null
          supplier_id: string | null
          unit: string
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          available_qty?: number
          average_cost?: number
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_purchase_cost?: number
          min_stock_threshold?: number
          name_ar: string
          name_fr: string
          on_hand_qty?: number
          organization_id: string
          primary_image_url?: string | null
          reserved_qty?: number
          sku: string
          storage_location?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          available_qty?: number
          average_cost?: number
          category_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_purchase_cost?: number
          min_stock_threshold?: number
          name_ar?: string
          name_fr?: string
          on_hand_qty?: number
          organization_id?: string
          primary_image_url?: string | null
          reserved_qty?: number
          sku?: string
          storage_location?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          is_owner: boolean
          organization_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_owner?: boolean
          organization_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_owner?: boolean
          organization_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      model_images: {
        Row: {
          caption_ar: string | null
          caption_fr: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_cover: boolean
          model_id: string
          organization_id: string
          shot_angle: string
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          caption_ar?: string | null
          caption_fr?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_cover?: boolean
          model_id: string
          organization_id: string
          shot_angle?: string
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          caption_ar?: string | null
          caption_fr?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_cover?: boolean
          model_id?: string
          organization_id?: string
          shot_angle?: string
          storage_bucket?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_images_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_images_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          back_image_url: string | null
          category_id: string | null
          code: string
          colors_available: string[]
          cover_image_url: string | null
          created_at: string
          default_labor_cost: number
          default_overhead_cost: number
          description_ar: string | null
          description_fr: string | null
          detail_image_url: string | null
          estimated_production_hours: number
          front_image_url: string | null
          id: string
          name_ar: string
          name_fr: string
          notes: string | null
          organization_id: string
          side_image_url: string | null
          sizes_available: string[]
          status: string
          suggested_selling_price: number
          updated_at: string
        }
        Insert: {
          back_image_url?: string | null
          category_id?: string | null
          code: string
          colors_available?: string[]
          cover_image_url?: string | null
          created_at?: string
          default_labor_cost?: number
          default_overhead_cost?: number
          description_ar?: string | null
          description_fr?: string | null
          detail_image_url?: string | null
          estimated_production_hours?: number
          front_image_url?: string | null
          id?: string
          name_ar: string
          name_fr: string
          notes?: string | null
          organization_id: string
          side_image_url?: string | null
          sizes_available?: string[]
          status?: string
          suggested_selling_price?: number
          updated_at?: string
        }
        Update: {
          back_image_url?: string | null
          category_id?: string | null
          code?: string
          colors_available?: string[]
          cover_image_url?: string | null
          created_at?: string
          default_labor_cost?: number
          default_overhead_cost?: number
          description_ar?: string | null
          description_fr?: string | null
          detail_image_url?: string | null
          estimated_production_hours?: number
          front_image_url?: string | null
          id?: string
          name_ar?: string
          name_fr?: string
          notes?: string | null
          organization_id?: string
          side_image_url?: string | null
          sizes_available?: string[]
          status?: string
          suggested_selling_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string
          currency: string
          id: string
          mfa_enforced_for_owners: boolean
          name_ar: string
          name_fr: string
          phone: string | null
          slug: string
          tax_id: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string
          id?: string
          mfa_enforced_for_owners?: boolean
          name_ar: string
          name_fr: string
          phone?: string | null
          slug: string
          tax_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string
          id?: string
          mfa_enforced_for_owners?: boolean
          name_ar?: string
          name_fr?: string
          phone?: string | null
          slug?: string
          tax_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          id: string
          idempotency_key: string
          invoice_id: string
          notes: string | null
          organization_id: string
          payment_date: string
          payment_method: string
          payment_number: string
          received_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: string | null
          id?: string
          idempotency_key: string
          invoice_id: string
          notes?: string | null
          organization_id: string
          payment_date?: string
          payment_method?: string
          payment_number: string
          received_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          id?: string
          idempotency_key?: string
          invoice_id?: string
          notes?: string | null
          organization_id?: string
          payment_date?: string
          payment_method?: string
          payment_number?: string
          received_by?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          code: string
          description: string | null
          id: string
          module: string
          name_ar: string
          name_fr: string
        }
        Insert: {
          action: string
          code: string
          description?: string | null
          id?: string
          module: string
          name_ar: string
          name_fr: string
        }
        Update: {
          action?: string
          code?: string
          description?: string | null
          id?: string
          module?: string
          name_ar?: string
          name_fr?: string
        }
        Relationships: []
      }
      production_consumptions: {
        Row: {
          consumed_qty: number
          created_at: string
          id: string
          material_id: string
          production_order_id: string
          reserved_qty: number
          total_cost_snapshot: number
          unit_cost_snapshot: number
        }
        Insert: {
          consumed_qty?: number
          created_at?: string
          id?: string
          material_id: string
          production_order_id: string
          reserved_qty?: number
          total_cost_snapshot?: number
          unit_cost_snapshot?: number
        }
        Update: {
          consumed_qty?: number
          created_at?: string
          id?: string
          material_id?: string
          production_order_id?: string
          reserved_qty?: number
          total_cost_snapshot?: number
          unit_cost_snapshot?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_consumptions_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_consumptions_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      production_order_stages: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          id: string
          notes: string | null
          production_order_id: string
          stage_code: string
          stage_name_ar: string
          stage_name_fr: string
          started_at: string | null
          status: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          id?: string
          notes?: string | null
          production_order_id: string
          stage_code: string
          stage_name_ar: string
          stage_name_fr: string
          started_at?: string | null
          status?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          id?: string
          notes?: string | null
          production_order_id?: string
          stage_code?: string
          stage_name_ar?: string
          stage_name_fr?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_order_stages_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          accepted_qty: number
          assigned_artisan: string | null
          assigned_employee_id: string | null
          color_label: string
          completed_at: string | null
          completed_qty: number
          created_at: string
          current_stage_code: string
          due_date: string | null
          id: string
          idempotency_key: string
          labor_cost_total: number
          material_cost_total: number
          model_id: string
          order_number: string
          organization_id: string
          overhead_cost_total: number
          packaging_cost_total: number
          rejected_qty: number
          size_label: string
          status: string
          target_qty: number
          total_order_cost: number
          unit_production_cost: number
          updated_at: string
        }
        Insert: {
          accepted_qty?: number
          assigned_artisan?: string | null
          assigned_employee_id?: string | null
          color_label: string
          completed_at?: string | null
          completed_qty?: number
          created_at?: string
          current_stage_code?: string
          due_date?: string | null
          id?: string
          idempotency_key: string
          labor_cost_total?: number
          material_cost_total?: number
          model_id: string
          order_number: string
          organization_id: string
          overhead_cost_total?: number
          packaging_cost_total?: number
          rejected_qty?: number
          size_label: string
          status?: string
          target_qty: number
          total_order_cost?: number
          unit_production_cost?: number
          updated_at?: string
        }
        Update: {
          accepted_qty?: number
          assigned_artisan?: string | null
          assigned_employee_id?: string | null
          color_label?: string
          completed_at?: string | null
          completed_qty?: number
          created_at?: string
          current_stage_code?: string
          due_date?: string | null
          id?: string
          idempotency_key?: string
          labor_cost_total?: number
          material_cost_total?: number
          model_id?: string
          order_number?: string
          organization_id?: string
          overhead_cost_total?: number
          packaging_cost_total?: number
          rejected_qty?: number
          size_label?: string
          status?: string
          target_qty?: number
          total_order_cost?: number
          unit_production_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          created_at: string
          created_by: string | null
          full_name: string
          id: string
          internal_auth_email: string
          is_active: boolean
          job_title_ar: string | null
          job_title_fr: string | null
          last_login_at: string | null
          mfa_enabled: boolean
          organization_id: string
          phone: string | null
          session_version: number
          updated_at: string
          username: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          created_by?: string | null
          full_name: string
          id: string
          internal_auth_email: string
          is_active?: boolean
          job_title_ar?: string | null
          job_title_fr?: string | null
          last_login_at?: string | null
          mfa_enabled?: boolean
          organization_id: string
          phone?: string | null
          session_version?: number
          updated_at?: string
          username: string
        }
        Update: {
          account_type?: string
          created_at?: string
          created_by?: string | null
          full_name?: string
          id?: string
          internal_auth_email?: string
          is_active?: boolean
          job_title_ar?: string | null
          job_title_fr?: string | null
          last_login_at?: string | null
          mfa_enabled?: boolean
          organization_id?: string
          phone?: string | null
          session_version?: number
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          discount_amount: number
          id: string
          line_total: number
          material_id: string
          ordered_qty: number
          purchase_id: string
          received_qty: number
          unit_price: number
        }
        Insert: {
          discount_amount?: number
          id?: string
          line_total: number
          material_id: string
          ordered_qty: number
          purchase_id: string
          received_qty: number
          unit_price: number
        }
        Update: {
          discount_amount?: number
          id?: string
          line_total?: number
          material_id?: string
          ordered_qty?: number
          purchase_id?: string
          received_qty?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          idempotency_key: string
          notes: string | null
          organization_id: string
          paid_amount: number
          payment_status: string
          purchase_date: string
          purchase_number: string
          receipt_status: string
          received_at: string | null
          remaining_amount: number
          subtotal: number
          supplier_id: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          idempotency_key: string
          notes?: string | null
          organization_id: string
          paid_amount?: number
          payment_status?: string
          purchase_date?: string
          purchase_number: string
          receipt_status?: string
          received_at?: string | null
          remaining_amount?: number
          subtotal?: number
          supplier_id: string
          total_amount?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          idempotency_key?: string
          notes?: string | null
          organization_id?: string
          paid_amount?: number
          payment_status?: string
          purchase_date?: string
          purchase_number?: string
          receipt_status?: string
          received_at?: string | null
          remaining_amount?: number
          subtotal?: number
          supplier_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checks: {
        Row: {
          accepted_qty: number
          checked_at: string
          id: string
          inspected_qty: number
          inspector_name: string
          notes: string | null
          organization_id: string
          production_order_id: string
          rejected_qty: number
        }
        Insert: {
          accepted_qty: number
          checked_at?: string
          id?: string
          inspected_qty: number
          inspector_name?: string
          notes?: string | null
          organization_id: string
          production_order_id: string
          rejected_qty: number
        }
        Update: {
          accepted_qty?: number
          checked_at?: string
          id?: string
          inspected_qty?: number
          inspector_name?: string
          notes?: string | null
          organization_id?: string
          production_order_id?: string
          rejected_qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "quality_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          id: string
          idempotency_key: string
          invoice_id: string
          organization_id: string
          processed_by: string | null
          reason: string
          refund_date: string
          refund_method: string
          refund_number: string
          restocked_to_inventory: boolean
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: string | null
          id?: string
          idempotency_key: string
          invoice_id: string
          organization_id: string
          processed_by?: string | null
          reason: string
          refund_date?: string
          refund_method?: string
          refund_number: string
          restocked_to_inventory?: boolean
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          id?: string
          idempotency_key?: string
          invoice_id?: string
          organization_id?: string
          processed_by?: string | null
          reason?: string
          refund_date?: string
          refund_method?: string
          refund_number?: string
          restocked_to_inventory?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "refunds_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_system_role: boolean
          name_ar: string
          name_fr: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean
          name_ar: string
          name_fr: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_system_role?: boolean
          name_ar?: string
          name_fr?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount_amount: number
          id: string
          idempotency_key: string
          notes: string | null
          organization_id: string
          sale_number: string
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          idempotency_key: string
          notes?: string | null
          organization_id: string
          sale_number: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          idempotency_key?: string
          notes?: string | null
          organization_id?: string
          sale_number?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          idempotency_key: string
          notes: string | null
          organization_id: string
          payment_date: string
          payment_method: string
          payment_number: string
          purchase_id: string | null
          recorded_by: string | null
          reference_number: string | null
          supplier_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          idempotency_key: string
          notes?: string | null
          organization_id: string
          payment_date?: string
          payment_method?: string
          payment_number: string
          purchase_id?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          supplier_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          notes?: string | null
          organization_id?: string
          payment_date?: string
          payment_method?: string
          payment_number?: string
          purchase_id?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          code: string
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          outstanding_balance: number
          phone: string
          total_paid: number
          total_purchases: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          outstanding_balance?: number
          phone: string
          total_paid?: number
          total_purchases?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          outstanding_balance?: number
          phone?: string
          total_paid?: number
          total_purchases?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          custom_permissions_deny: string[]
          custom_permissions_grant: string[]
          id: string
          organization_id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          custom_permissions_deny?: string[]
          custom_permissions_grant?: string[]
          id?: string
          organization_id: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          custom_permissions_deny?: string[]
          custom_permissions_grant?: string[]
          id?: string
          organization_id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          code: string
          created_at: string
          id: string
          is_default: boolean
          location_address: string | null
          name_ar: string
          name_fr: string
          organization_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_default?: boolean
          location_address?: string | null
          name_ar: string
          name_fr: string
          organization_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_default?: boolean
          location_address?: string | null
          name_ar?: string
          name_fr?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_settings: {
        Row: {
          address_ar: string | null
          address_fr: string | null
          currency: string
          default_tax_percent: number
          id: string
          logo_url: string | null
          organization_id: string
          owner_name: string
          phone: string | null
          rc_number: string | null
          tax_id_nif: string | null
          tax_id_nis: string | null
          timezone: string
          updated_at: string
          workshop_name_ar: string
          workshop_name_fr: string
        }
        Insert: {
          address_ar?: string | null
          address_fr?: string | null
          currency?: string
          default_tax_percent?: number
          id?: string
          logo_url?: string | null
          organization_id: string
          owner_name?: string
          phone?: string | null
          rc_number?: string | null
          tax_id_nif?: string | null
          tax_id_nis?: string | null
          timezone?: string
          updated_at?: string
          workshop_name_ar?: string
          workshop_name_fr?: string
        }
        Update: {
          address_ar?: string | null
          address_fr?: string | null
          currency?: string
          default_tax_percent?: number
          id?: string
          logo_url?: string | null
          organization_id?: string
          owner_name?: string
          phone?: string | null
          rc_number?: string | null
          tax_id_nif?: string | null
          tax_id_nis?: string | null
          timezone?: string
          updated_at?: string
          workshop_name_ar?: string
          workshop_name_fr?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_atelier_permission: {
        Args: { required_perm: string; target_org_id: string }
        Returns: boolean
      }
      is_org_member: { Args: { target_org_id: string }; Returns: boolean }
      is_org_owner: { Args: { target_org_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
