// Simplified GPU page for debugging
import { getGpuDeals } from "@/lib/dealRadar";

export default async function GPUsPageSimple() {
  try {
    const deals = await getGpuDeals();
    
    return (
      <div className="min-h-screen py-6">
        <h1 className="text-2xl font-bold text-white mb-4">GPU Deals</h1>
        <div className="grid gap-4">
          {deals.map((deal) => (
            <div key={deal.id} className="p-4 bg-slate-800 rounded">
              <h3 className="text-white font-semibold">{deal.title}</h3>
              <p className="text-green-400">${deal.price}</p>
              <p className="text-cyan-400">DXM Score: {deal.dxmScore.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen py-6">
        <h1 className="text-2xl font-bold text-red-400">Error</h1>
        <pre className="text-white">{String(error)}</pre>
      </div>
    );
  }
}
