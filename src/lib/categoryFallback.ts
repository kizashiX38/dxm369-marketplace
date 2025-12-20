import type { DXMProduct } from "@/lib/products/types";

export function getCategoryFallback(category: string): DXMProduct[] {
  const fallbackProducts: Record<string, DXMProduct[]> = {
    GPU: [
      {
        id: "rtx-4090-fallback",
        asin: "B0BGP8FGNZ",
        title: "GIGABYTE GeForce RTX 4090 Gaming OC 24G",
        brand: "GIGABYTE",
        category: "gpu",
        price: 2171,
        dxmScore: 95,
        imageUrl: "https://m.media-amazon.com/images/I/711vU2IrEuL._AC_SL1500_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      }
    ],
    CPU: [
      {
        id: "ryzen-7800x3d-fallback",
        asin: "B0BTZB7F88",
        title: "AMD Ryzen 7 7800X3D 8-Core, 16-Thread Desktop Processor",
        brand: "AMD",
        category: "cpu",
        price: 449,
        dxmScore: 92,
        imageUrl: "https://m.media-amazon.com/images/I/61vGQNUEsGL._AC_SL1280_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      }
    ],
    LAPTOP: [
      {
        id: "asus-rog-g16-2024",
        asin: "B0CTKHKT5Q",
        title: "ASUS ROG Strix G16 (2024) Gaming Laptop",
        brand: "ASUS",
        category: "laptop",
        price: 1399,
        dxmScore: 91,
        imageUrl: "https://m.media-amazon.com/images/I/81Si31LMp5L._AC_SL1500_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      },
      {
        id: "lenovo-legion-pro-5",
        asin: "B0C8LQKT1H",
        title: "Lenovo Legion Pro 5 Gaming Laptop",
        brand: "Lenovo",
        category: "laptop",
        price: 1299,
        dxmScore: 89,
        imageUrl: "https://m.media-amazon.com/images/I/71HWQ09yKbL._AC_SL1500_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      },
      {
        id: "msi-katana-15",
        asin: "B0CRDXZWBX",
        title: "MSI Katana 15 Gaming Laptop",
        brand: "MSI",
        category: "laptop",
        price: 1099,
        dxmScore: 87,
        imageUrl: "https://m.media-amazon.com/images/I/71sQV0K2IjL._AC_SL1500_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      },
      {
        id: "acer-predator-helios",
        asin: "B0CRDQJ77H",
        title: "Acer Predator Helios Neo 16 Gaming Laptop",
        brand: "Acer",
        category: "laptop",
        price: 1449,
        dxmScore: 90,
        imageUrl: "https://m.media-amazon.com/images/I/81ikideGaqL._AC_SL1500_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      }
    ],
    MEMORY: [
      {
        id: "corsair-ddr5-32gb-best-value",
        asin: "B0BZHTVHN5",
        title: "CORSAIR VENGEANCE RGB DDR5 RAM 32GB (2x16GB) 6000MHz",
        brand: "Corsair",
        category: "memory",
        price: 131,
        dxmScore: 94,
        imageUrl: "https://m.media-amazon.com/images/I/81agXcNA6zL._AC_SL1500_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      },
      {
        id: "crucial-ddr5-32gb-value",
        asin: "B0CTHXMYL8",
        title: "Crucial Pro 32GB DDR5 RAM Kit (2x16GB) 6000MHz",
        brand: "Crucial",
        category: "memory",
        price: 131,
        dxmScore: 93,
        imageUrl: "https://m.media-amazon.com/images/I/71QsF8ezSBL._AC_SL1500_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      },
      {
        id: "corsair-ddr5-64gb-performance",
        asin: "B09R7S7PXC",
        title: "CORSAIR VENGEANCE DDR5 RAM 64GB (2x32GB) 5200MHz",
        brand: "Corsair",
        category: "memory",
        price: 839,
        dxmScore: 89,
        imageUrl: "https://m.media-amazon.com/images/I/81Rw6Pffb0L._AC_SL1500_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      },
      {
        id: "corsair-ddr5-96gb-extreme",
        asin: "B0F7RY9V4N",
        title: "CORSAIR Vengeance DDR5 RAM 96GB (2x48GB) 6000MHz",
        brand: "Corsair",
        category: "memory",
        price: 3715,
        dxmScore: 85,
        imageUrl: "https://m.media-amazon.com/images/I/81mwcITtHBL._AC_SL1500_.jpg",
        availability: "In Stock",
        primeEligible: true,
        vendor: "Amazon"
      }
    ]
  };

  return fallbackProducts[category.toUpperCase()] || [];
}
