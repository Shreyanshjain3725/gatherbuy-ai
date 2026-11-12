"use client";

import * as React from "react";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Campaign, FairShareSummary } from "@/lib/db/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "../ui/button";

export function ExportReportButton({
  campaign,
  summary,
}: {
  campaign: Campaign;
  summary: FairShareSummary;
}) {
  const [exporting, setExporting] = React.useState(false);

  const exportCSV = () => {
    const headers = [
      "Participant Name",
      "Email",
      "Items Count",
      "Items Subtotal ($)",
      "Allocated Shipping ($)",
      "Allocated Tax ($)",
      "Allocated Discount ($)",
      "Total Contribution ($)",
      "Amount Paid ($)",
      "Remaining Due ($)",
      "Payment Status",
    ];

    const rows = summary.member_breakdowns.map((m) => [
      `"${m.member_name}"`,
      `"${m.member_email}"`,
      m.items_count,
      m.items_subtotal.toFixed(2),
      m.allocated_shipping.toFixed(2),
      m.allocated_tax.toFixed(2),
      m.allocated_discount.toFixed(2),
      m.total.toFixed(2),
      m.amount_paid.toFixed(2),
      m.remaining_due.toFixed(2),
      `"${m.payment_status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `gatherbuy_${campaign.id}_fairshare_report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    try {
      setExporting(true);
      const doc = new jsPDF();

      // Header branding
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129);
      doc.text("GatherBuy AI", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Group Purchasing & Payments Procurement Report", 14, 26);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 31);

      // Campaign Info
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(campaign.title, 14, 42);

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Organizer: ${campaign.organizer_name} (${campaign.organizer_email})`, 14, 48);
      doc.text(`Deadline: ${formatDate(campaign.deadline)} | Status: ${campaign.status.toUpperCase()}`, 14, 53);
      doc.text(`Target Budget: $${campaign.target_budget.toFixed(2)} | Landed Cost: $${summary.total_campaign_amount.toFixed(2)}`, 14, 58);

      // Table of Member Allocations
      const tableData = summary.member_breakdowns.map((m) => [
        m.member_name,
        `${m.items_count} items`,
        `$${m.items_subtotal.toFixed(2)}`,
        `$${m.allocated_shipping.toFixed(2)}`,
        `$${m.allocated_tax.toFixed(2)}`,
        `$${m.total.toFixed(2)}`,
        `$${m.amount_paid.toFixed(2)}`,
        m.payment_status.toUpperCase(),
      ]);

      autoTable(doc, {
        startY: 65,
        head: [
          [
            "Participant",
            "Picks",
            "Items",
            "Shipping",
            "Tax",
            "Total Due",
            "Paid",
            "Status",
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [16, 24, 46], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
      });

      doc.save(`gatherbuy_${campaign.id}_procurement_audit.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportCSV}
        className="text-xs gap-1.5"
      >
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
        <span>Export CSV</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportPDF}
        isLoading={exporting}
        className="text-xs gap-1.5"
      >
        <FileText className="h-3.5 w-3.5 text-blue-400" />
        <span>Export PDF</span>
      </Button>
    </div>
  );
}
