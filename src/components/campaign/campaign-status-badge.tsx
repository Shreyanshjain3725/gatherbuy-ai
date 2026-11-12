import { CampaignStatus } from "@/lib/db/schema";
import { Badge } from "../ui/badge";

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  switch (status) {
    case "draft":
      return <Badge variant="muted">Draft</Badge>;
    case "open":
      return <Badge variant="emerald">Open for Members</Badge>;
    case "collecting":
      return <Badge variant="paypal">Collecting Contributions</Badge>;
    case "ready_to_order":
      return <Badge variant="lime">Ready for Order</Badge>;
    case "ordered":
      return <Badge variant="warning">Order Placed</Badge>;
    case "completed":
      return <Badge variant="emerald">Completed</Badge>;
    case "cancelled":
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}
