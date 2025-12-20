import type { DXMProduct } from "@/lib/types/product";

export function getCategoryFallback(category: string): DXMProduct[] {
  const fallbackProducts: Record<string, DXMProduct[]> = {
    GPU: [
      {
        id: "rtx-4090-fallback",
        asin: "B0BGP8FGNZ",
        name: "GIGABYTE GeForce RTX 4090 Gaming OC 24G",
        category: "GPU",
        price: 2171,
        dxmScore: 95,
        imageUrl: "https://m.media-amazon.com/images/I/711vU2IrEuL._AC_SL1500_.jpg",
        availability: "in_stock",
        isPrime: true,
        vendor: "Amazon",
        specs: {}
      }
    ],
    CPU: [
      {
        id: "ryzen-7800x3d-fallback",
        asin: "B0BTZB7F88",
        name: "AMD Ryzen 7 7800X3D 8-Core, 16-Thread Desktop Processor",
        category: "CPU",
        price: 449,
        dxmScore: 92,
        imageUrl: "https://m.media-amazon.com/images/I/61vGQNUEsGL._AC_SL1280_.jpg",
        availability: "in_stock",
        isPrime: true,
        vendor: "Amazon",
        specs: {}
      }
    ],
    LAPTOP: [
      {
        id: "asus-rog-g16-2024",
        asin: "B0CTKHKT5Q",
        name: "ASUS ROG Strix G16 (2024) Gaming Laptop",
        category: "Laptop",
        price: 1399,
        dxmScore: 91,
        imageUrl: "https://m.media-amazon.com/images/I/81Si31LMp5L._AC_SL1500_.jpg",
        availability: "in_stock",
        isPrime: true,
        vendor: "Amazon",
        specs: {}
      }
    ],
    MEMORY: [
      {
        id: "corsair-ddr5-32gb-best-value",
        asin: "B0BZHTVHN5",
        name: "CORSAIR VENGEANCE RGB DDR5 RAM 32GB (2x16GB) 6000MHz",
        category: "RAM",
        price: 131,
        dxmScore: 94,
        imageUrl: "https://m.media-amazon.com/images/I/81agXcNA6zL._AC_SL1500_.jpg",
        availability: "in_stock",
        isPrime: true,
        vendor: "Amazon",
        specs: {}
      }
    ]
  };

  return fallbackProducts[category.toUpperCase()] || [];
}
