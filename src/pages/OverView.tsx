import { useAuthStore } from "../store/authStore";
import AdvertiserOverview from "../components/advertiser/AdvertiserOverview";

export default function Overview() {
  const user = useAuthStore((s) => s.user);

  if (user?.role === "advertiser") {
    return <AdvertiserOverview />;
  }

  return (
    <div>
      <h1 className="font-sora font-bold text-2xl mb-1">Earner Dashboard</h1>
      <p className="text-slatec text-sm">Earner overview coming soon.</p>
    </div>
  );
}
