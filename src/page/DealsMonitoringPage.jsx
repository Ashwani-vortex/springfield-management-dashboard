import { useMemo, useState } from "react";
import { downloadCSV } from "../utils";
import { TOKENS } from "../utils/data"; 
import { Card } from "../utils/ui/Card";
import { CardHeader } from "../utils/ui/CardHeader";
import { CardBody } from "../utils/ui/CardBody";
import { Input } from "../utils/ui/Input";
import { Button } from "../utils/ui/Button";
import { LoadingSpinner } from "../utils/ui/loading-spinner";
import { Download, Layers } from "lucide-react";
import { useDealsMonitoring } from "../hooks/useDealsMonitoring";
import { Table } from "../utils/ui/table";
import { CardFooter } from "../utils/ui/CardFooter";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "N/A") return "-";
  if (typeof value === "string" && value.trim().startsWith("AED")) return value;
  const num = Number(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export function DealsMonitoringPage() {
  const [page, setPage] = useState(1);
  const { deals, totalDeals, dealsPerPage, isLoading, isError, error } =
    useDealsMonitoring(page);
  const [query, setQuery] = useState("");

  const totalPages = Math.ceil(totalDeals / dealsPerPage);

  const filteredDeals = useMemo(() => {
    if (!deals) return [];
    return deals.filter((deal) => {
      const searchString = Object.values(deal).join(" ").toLowerCase();
      return searchString.includes(query.toLowerCase());
    });
  }, [query, deals]);

  const columns = [
    { header: "Agent Name", key: "agentName" },
    { header: "Date", key: "transactionDate" },
    { header: "Transaction Type", key: "transactionType" },
    { header: "Deal Type", key: "dealType" },
    { header: "Project Name", key: "projectName" },
    { header: "Unit No", key: "unitNumber" },
    { header: "Developer Name", key: "developerName" },
    { header: "Type", key: "propertyType" },
    { header: "No Of Br", key: "noOfBedrooms" },
    { header: "Client Name", key: "clientName" },
    { header: "Team", key: "team" },
    { header: "Property Price", key: "propertyPrice", render: formatCurrency },
    { header: "Gross Commission (Incl.VAT)", key: "grossCommissionIncVat", render: formatCurrency },
    { header: "Gross Comm.", key: "grossCommission", render: formatCurrency },
    { header: "VAT", key: "vat" },
    { header: "Agent Net Commission", key: "agentNetCommission", render: formatCurrency },
    { header: "Managers commission", key: "managerCommission" },
    { header: "Sales Support Commission", key: "salesSupportCommission" },
    { header: "Springfield Commission", key: "springfieldNetCommission" },
    { header: "Commission Slab", key: "commissionSlab" },
    { header: "Referral", key: "referral" },
    { header: "Referral fee", key: "referralFee" },
    { header: "Deal ID", key: "dealId" },
    { header: "Invoice status", key: "invoiceStatus" },
    { header: "Payment Received", key: "paymentReceived", render: formatCurrency },
    { header: "1st Payment Received", key: "firstPaymentReceived" },
    { header: "2nd Payment Received", key: "secondPaymentReceived" },
    { header: "3rd Payment Received", key: "thirdPaymentReceived" },
    { header: "Total payment Received", key: "totalPaymentReceived" },
    { header: "Amount Receivable", key: "amountReceivable" },
    { header: "Booking Form", key: "bookingForm" },
    { header: "PP copy", key: "ppCop" },
    { header: "KYC", key: "kyc" },
    { header: "Screening", key: "screeningField" },
    { header: "Client ID", key: "cliendId" },
    { header: "Contact Number", key: "contactPhone" },
    { header: "Email", key: "contactEmail" },
    { header: "Client Type", key: "clientType" },
    { header: "Passport No/Company Registration No", key: "passportOrCompanyRegNo" },
    { header: "Emirates ID (If applicable)", key: "emiratesId" },
    { header: "Birthday", key: "birthdayField" },
    { header: "Country", key: "countryField" },
    { header: "Nationality", key: "nationality" },
  ];

  const exportHeaders = [
    "transactionDate",
    "transactionType",
    "dealId",
    "propertyType",
    "projectName",
    "developerName",
    "agentName",
    "propertyId",
    "propertyPrice",
    "grossCommission",
    "netCommission",
    "paymentReceived",
    "totalAmountReceived",
  ];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  if (isError)
    return (
      <div className="text-center p-8 text-red-500">Error: {error.message}</div>
    );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Deals Monitoring"
          icon={<Layers size={18} style={{ color: TOKENS.primary }} />}
          actions={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  className="pl-8 w-64"
                  placeholder="Search deals on this page..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={() =>
                  downloadCSV(
                    filteredDeals,
                    exportHeaders,
                    "deals-monitoring.csv"
                  )
                }
              >
                <Download size={16} className="inline mr-1" />
                Export
              </Button>
            </div>
          }
        />
        <CardBody>
          <Table columns={columns} data={filteredDeals} />
        </CardBody>
        <CardFooter>
          <div className="flex justify-between items-center text-sm">
            <div>
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}