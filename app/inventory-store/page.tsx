import React from "react";
import AirtableInventoryStore from "@/components/airtable-inventory-store";

export const metadata = {
  title: "Airtable Live Inventory Store | R. Herrero Pianos & Services (RHPS)",
  description: "Browse live piano inventory goods, shop assets, and personal collections directly synced with RHPS Airtable Database.",
};

export default function InventoryStorePage() {
  return <AirtableInventoryStore />;
}
