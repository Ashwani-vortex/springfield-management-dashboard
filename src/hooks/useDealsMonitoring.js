import { useQuery } from "@tanstack/react-query";
import { getDealsPaginated, getDealFields, getContacts } from "../api/bitrix";
import { useMemo } from "react";

const parseMoney = (moneyString) => {
  if (!moneyString || typeof moneyString !== "string") return 0;
  return parseFloat(moneyString.split("|")[0]) || 0;
};

const getPhoneFromContact = (contact) => {
  if (!contact?.PHONE?.length) return "N/A";
  return contact.PHONE[0]?.VALUE || "N/A";
};


// --- Helper: Safe Email Extraction ---
const getEmailFromContact = (contact) => {
  if (!contact?.EMAIL?.length) return "N/A";
  return contact.EMAIL[0].VALUE;
};

const FIELD_IDS = {
  projectName: import.meta.env.VITE_FIELD_PROJECT_NAME,
  transactionType: import.meta.env.VITE_FIELD_TRANSACTION_TYPE,
  agentName: import.meta.env.VITE_FIELD_AGENT_NAME,
  propertyRef: import.meta.env.VITE_FIELD_PROPERTY_REFERENCE,
  developer: import.meta.env.VITE_FIELD_DEVELOPER_NAME,
  propertyType: import.meta.env.VITE_FIELD_PROPERTY_TYPE,
  grossCommission: import.meta.env.VITE_FIELD_GROSS_COMMISSION,
  netCommission: import.meta.env.VITE_FIELD_NET_COMMISSION,
  amountReceivable: import.meta.env.VITE_FIELD_AMOUNT_RECEIVABLE,
  noOfBedrooms: import.meta.env.VITE_FIELD_NO_OF_BEDROOMS,
  unitNumber: import.meta.env.VITE_FIELD_UNIT_NUMBER,
  clientName: import.meta.env.VITE_FIELD_CLIENT_NAME,
  teamName: import.meta.env.VITE_FIELD_TEAM,
  grossCommissionInclVat: import.meta.env.VITE_FIELD_GROSS_COMMISSION_INCL_VAT,
  vat: import.meta.env.VITE_FIELD_VAT,
  agentNetCommission: import.meta.env.VITE_FIELD_AGENT_NET_COMMISSION,
  managerCommissionfield: import.meta.env.VITE_FIELD_MANAGER_COMMISSION,
  salesSupportCommission: import.meta.env.VITE_FIELD_SALES_SUPPORT_COMMISSION,
  springfieldNetCommission: import.meta.env
    .VITE_FIELD_SPRINGFIELD_NET_COMMISSION,
  commissionSlab: import.meta.env.VITE_FIELD_COMMISSION_SLAB,
  referral: import.meta.env.VITE_FIELD_REFERRAL,
  referralFee: import.meta.env.VITE_FIELD_REFERRAL_FEE,
  invoiceStatus: import.meta.env.VITE_FIELD_INVOICE_STATUS,
  paymentReceivedStatus: import.meta.env.VITE_FIELD_PAYMENT_RECEIVED_STATUS,
  firstPaymentReceived: import.meta.env.VITE_FIRST_PAYMENT_RECEIVED,
  secondPaymentReceived: import.meta.env.VITE_SECOND_PAYMENT_RECEIVED,
  thirdPaymentReceived: import.meta.env.VITE_THIRD_PAYMENT_RECEIVED,
  totalPaymentReceived: import.meta.env.VITE_TOTAL_PAYMENT_RECEIVED,
  amountReceivable: import.meta.env.VITE_AMOUNT_RECEIVABLE,
  bookingForm: import.meta.env.VITE_FIELD_BOOKING_FORM,
  ppCopy: import.meta.env.VITE_FIELD_PP_COPY,
  kyc: import.meta.env.VITE_FIELD_KYC,
  screeningField: import.meta.env.VITE_FIELD_SCREENING,
  cliendId: import.meta.env.VITE_FIELD_CLIENT_ID,
  clientType:import.meta.env.VITE_FIELD_CLIENT_TYPE,
  passportOrCompanyRegNo:import.meta.env.VITE_PASSPORT_OR_COMPANY_REG_NO,
  emiratesId: import.meta.env.VITE_FIELD_EMIRATES_ID,
  birthdayField:import.meta.env.VITE_FIELD_BIRTHDAY,
  countryField:import.meta.env.VITE_FIELD_COUNTRY,
  nationality:import.meta.env.VITE_FIELD_NATIONALITY,
};

export const useDealsMonitoring = (page) => {
  const dealsPerPage = 50;
  const start = (page - 1) * dealsPerPage;

  const { data: dealFields, isLoading: isLoadingFields } = useQuery({
    queryKey: ["dealFields"],
    queryFn: getDealFields,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dealsMonitoring", page],
    queryFn: () => getDealsPaginated(start),
    enabled: !!dealFields,
  });

  // 3. Extract Contact IDs
  const contactIds = useMemo(() => {
    if (!data?.deals) return [];
    return [
      ...new Set(
        data.deals
          .map((d) => d.CONTACT_ID)
          .filter((id) => id && id !== "0")
      ),
    ];
  }, [data?.deals]);

  // 4. Fetch Contacts (Phone & Email)
  const { data: contactsList, isLoading: isLoadingContacts } = useQuery({
    queryKey: ["contacts", contactIds],
    queryFn: () => getContacts(contactIds),
    enabled: contactIds.length > 0,
    staleTime: 1000 * 60 * 5, 
  });

  const processedDeals = useMemo(() => {
    if (!data?.deals || !dealFields) return [];

    const propertyTypeMap = new Map(
      dealFields[FIELD_IDS.propertyType]?.items.map((item) => [
        item.ID,
        item.VALUE,
      ]) || []
    );
    const transactionTypeMap = new Map(
      dealFields[FIELD_IDS.transactionType]?.items.map((item) => [
        item.ID,
        item.VALUE,
      ]) || []
    );

    const bedroomsMap = new Map(
      dealFields[FIELD_IDS.noOfBedrooms]?.items?.map((item) => [
        item.ID,
        item.VALUE,
      ]) || []
    );

    const teamMap = new Map(
      dealFields[FIELD_IDS.teamName]?.items?.map((item) => [
        item.ID,
        item.VALUE,
      ]) || []
    );

    const referralMap = new Map(
      dealFields[FIELD_IDS.referral]?.items?.map((item) => [
        item.ID,
        item.VALUE,
      ]) || []
    );

    const invoiceStatusMap = new Map(
      dealFields[FIELD_IDS.invoiceStatus]?.items?.map((item) => [
        item.ID,
        item.VALUE,
      ]) || []
    );

    const paymentStatusMap = new Map(
      dealFields[FIELD_IDS.paymentReceivedStatus]?.items?.map((i) => [
        i.ID,
        i.VALUE,
      ]) || []
    );

    const ppCopMap = new Map(
      dealFields[FIELD_IDS.ppCopy]?.items?.map((i) => [i.ID, i.VALUE]) || []
    );

    const screeningFieldMap = new Map(
      dealFields[FIELD_IDS.screeningField]?.items?.map((i) => [
        i.ID,
        i.VALUE,
      ]) || []
    );

    const phoneMap = new Map();
    const emailMap = new Map();
    if (contactsList) {
      contactsList.forEach((c) => {
        phoneMap.set(c.ID, getPhoneFromContact(c));
      });
    }

     if (contactsList) {
      contactsList.forEach((c) => {
        emailMap.set(c.ID, getEmailFromContact(c));
      });
    }

    const clientTypeMap = new Map(
      dealFields[FIELD_IDS.clientType]?.items?.map((i) => [i.ID, i.VALUE]) || []
    );

    return data.deals.map((deal) => ({
      agentName: deal[FIELD_IDS.agentName] || "N/A",
      transactionDate: (deal.CLOSEDATE || "").split("T")[0],
      transactionType:
        transactionTypeMap.get(deal[FIELD_IDS.transactionType]) || "N/A",
      dealType:
        deal.TYPE_ID == "SALE"
          ? "Off-plan"
          : deal.TYPE_ID == "UC_1X41C2"
          ? "Secondary"
          : "-",
      projectName: deal[FIELD_IDS.projectName] || "N/A",
      unitNumber: deal[FIELD_IDS.unitNumber] || "N/A",
      developerName: deal[FIELD_IDS.developer] || "N/A",
      propertyType: propertyTypeMap.get(deal[FIELD_IDS.propertyType]) || "N/A",
      noOfBedrooms: bedroomsMap.get(deal[FIELD_IDS.noOfBedrooms]) || "N/A",
      clientName: deal[FIELD_IDS.clientName] || "N/A",
      team: teamMap.get(deal[FIELD_IDS.teamName]) || "N/A",
      propertyPrice: deal.OPPORTUNITY || "N/A",
      grossCommissionIncVat: parseMoney(deal[FIELD_IDS.grossCommissionInclVat]),
      grossCommission: parseMoney(deal[FIELD_IDS.grossCommission]),
      vat: `AED ${parseMoney(deal[FIELD_IDS.vat])}`,
      agentNetCommission: parseMoney(deal[FIELD_IDS.agentNetCommission]),
      managerCommission: `AED ${parseMoney(
        deal[FIELD_IDS.managerCommissionfield]
      )}`,
      salesSupportCommission: `AED ${parseMoney(
        deal[FIELD_IDS.salesSupportCommission]
      )}`,
      springfieldNetCommission: `AED ${parseMoney(
        deal[FIELD_IDS.springfieldNetCommission]
      )}`,
      commissionSlab: `${deal[FIELD_IDS.commissionSlab] || "N/A"} %`,
      referral: referralMap.get(deal[FIELD_IDS.referral]) || "N/A",
      referralFee: `AED ${parseMoney(deal[FIELD_IDS.referralFee] || "N/A")}`,
      dealId: deal.ID,
      invoiceStatus:
        invoiceStatusMap.get(deal[FIELD_IDS.invoiceStatus]) || "N/A",
      paymentReceived: paymentStatusMap.get(
        deal[FIELD_IDS.paymentReceivedStatus]
      ),
      firstPaymentReceived: `AED ${parseMoney(
        deal[FIELD_IDS.firstPaymentReceived] || "N/A"
      )}`,
      secondPaymentReceived: `AED ${parseMoney(
        deal[FIELD_IDS.secondPaymentReceived] || "N/A"
      )}`,
      thirdPaymentReceived: `AED ${parseMoney(
        deal[FIELD_IDS.thirdPaymentReceived] || "N/A"
      )}`,
      totalPaymentReceived: `AED ${parseMoney(
        deal[FIELD_IDS.totalPaymentReceived] || "N/A"
      )}`,
      amountReceivable: `AED ${parseMoney(
        deal[FIELD_IDS.amountReceivable] || "N/A"
      )}`,
      bookingForm: deal[FIELD_IDS.bookingForm] ? "Yes" : "No",
      ppCop: ppCopMap.get(deal[FIELD_IDS.ppCopy]) || "N/A",
      kyc: deal[FIELD_IDS.kyc] ? "Yes" : "No",
      screeningField:
        screeningFieldMap.get(deal[FIELD_IDS.screeningField]) || "N/A",
      cliendId: deal[FIELD_IDS.cliendId] || "N/A",
      contactPhone: phoneMap.get(deal.CONTACT_ID) || "N/A",
     contactEmail: emailMap.get(deal.CONTACT_ID) || "N/A",
      clientType: clientTypeMap.get(deal[FIELD_IDS.clientType]) || "N/A",  
      passportOrCompanyRegNo: deal[FIELD_IDS.passportOrCompanyRegNo] || "N/A",
      emiratesId: deal[FIELD_IDS.emiratesId] || "N/A",
      birthdayField:deal[FIELD_IDS.birthdayField].split("T")[0] || "N/A",
      countryField:deal[FIELD_IDS.countryField] || "N/A",
      nationality:deal[FIELD_IDS.nationality] || "N/A",
    }));
  }, [data, dealFields]);

  return {
    deals: processedDeals,
    totalDeals: data?.total || 0,
    dealsPerPage,
    isLoading: isLoading || isLoadingFields,
    isError,
    error,
  };
};
