// Placeholder catalogue data — replace with a real GET /api/products
// call once the Catalogue module (Phase 2, Ticket 2.3) is built.

export interface MockGadget {
  id: string;
  name: string;
  spec: string;
  price: number;
  condition: "New" | "Refurbished — Grade A" | "Used — Grade B";
  status: "In stock" | "Limited" | "Sourcing";
  category: "Laptops" | "Phones & Tablets" | "Accessories" | "Repair Services";
}

export const mockGadgets: MockGadget[] = [
  { id: "1", name: "MacBook Air M2", spec: '13" · 8GB · 256GB SSD', price: 950000, condition: "Refurbished — Grade A", status: "In stock", category: "Laptops" },
  { id: "2", name: "iPhone 14 Pro", spec: "128GB · Deep Purple", price: 780000, condition: "Used — Grade B", status: "Limited", category: "Phones & Tablets" },
  { id: "3", name: "Dell XPS 13", spec: "i7 · 16GB · 512GB SSD", price: 1100000, condition: "New", status: "In stock", category: "Laptops" },
  { id: "4", name: "Samsung Galaxy S23", spec: "256GB · Phantom Black", price: 620000, condition: "Refurbished — Grade A", status: "In stock", category: "Phones & Tablets" },
  { id: "5", name: "iPad Air 5th Gen", spec: "64GB · Wi-Fi", price: 540000, condition: "New", status: "Sourcing", category: "Phones & Tablets" },
  { id: "6", name: "Anker 65W Charger", spec: "GaN · 3-Port", price: 28000, condition: "New", status: "In stock", category: "Accessories" },
  { id: "7", name: "Screen Replacement — iPhone 14", spec: "OEM glass · 30-day warranty", price: 45000, condition: "New", status: "In stock", category: "Repair Services" },
  { id: "8", name: "Battery Service — MacBook Pro 14", spec: "Original Apple part · 1-year warranty", price: 120000, condition: "New", status: "In stock", category: "Repair Services" },
  { id: "9", name: "Charging Port Repair — Samsung S23", spec: "OEM connector · same-day service", price: 35000, condition: "New", status: "Limited", category: "Repair Services" },
];