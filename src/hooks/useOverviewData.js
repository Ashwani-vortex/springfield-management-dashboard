import { useQuery } from "@tanstack/react-query";
import { getDealFields, getDealsByYear, getStatusList } from "../api/bitrix";

// Helper function to safely parse money fields like "95595.52|AED"
const parseMoney = (moneyString) => {
  if (!moneyString || typeof moneyString !== "string") return 0;
  return parseFloat(moneyString.split("|")[0]) || 0;
};

// Get field IDs from environment variables
const FIELD_IDS = {
  developer: import.meta.env.VITE_FIELD_DEVELOPER_NAME,
  grossCommission: import.meta.env.VITE_FIELD_GROSS_COMMISSION,
  netCommission: import.meta.env.VITE_FIELD_NET_COMMISSION,
  paymentReceived: import.meta.env.VITE_FIELD_PAYMENT_RECEIVED,
  propertyType: import.meta.env.VITE_FIELD_PROPERTY_TYPE,
  amountReceivable: import.meta.env.VITE_FIELD_AMOUNT_RECEIVABLE,
};

const DEAL_STAGES_WON = [
  import.meta.env.VITE_DEAL_STAGE_ID_WON,
  import.meta.env.VITE_DEAL_STAGE_ID_C2WON,
  import.meta.env.VITE_DEAL_STAGE_ID_C4WON,
  import.meta.env.VITE_DEAL_STAGE_ID_C5WON,
].filter(Boolean);

/**
 * Custom hook to fetch and process all data for the Management Dashboard.
 * @param {string} year The financial year selected by the user.
 */
export const useManagementData = (year) => {
  return useQuery({
    queryKey: ["managementData", year],
    queryFn: async () => {
      // 1. Fetch raw data in parallel for efficiency
      const [fields, allDeals, statuses] = await Promise.all([
        getDealFields(),
        getDealsByYear(year),
        getStatusList(),
      ]);

      // 2. **CHANGE**: Filter for 'won' deals by checking against the array of WON stages.
      const wonDeals = allDeals.filter((deal) =>
        DEAL_STAGES_WON.includes(deal.STAGE_ID)
      );

      // 3. Create helper maps
      const propertyTypeMap = new Map(
        fields[FIELD_IDS.propertyType]?.items.map((item) => [
          item.ID,
          item.VALUE,
        ]) || []
      );

      // 4. Perform aggregations on ALL deals for charts and general data
      const allDevelopers = [
        ...new Set(allDeals.map((d) => d[FIELD_IDS.developer]).filter(Boolean)),
      ];
      const propertyTypesAgg = {};
      const developersAgg = {};
      const leadSourceAgg = {};

      for (const deal of allDeals) {
        const propertyPrice = parseFloat(deal.OPPORTUNITY) || 0;
        const developer = deal[FIELD_IDS.developer] || "Unknown";

        // Aggregate property types
        const propertyTypeId = deal[FIELD_IDS.propertyType];
        const propertyTypeName =
          propertyTypeMap.get(propertyTypeId) || "Unknown";
        propertyTypesAgg[propertyTypeName] =
          (propertyTypesAgg[propertyTypeName] || 0) + 1;

        // Aggregate developer data
        if (!developersAgg[developer]) {
          developersAgg[developer] = { totalValue: 0 };
        }
        developersAgg[developer].totalValue += propertyPrice;

        // Aggregate lead source data
        const leadSource = deal.SOURCE_ID || "Unknown";
        leadSourceAgg[leadSource] = (leadSourceAgg[leadSource] || 0) + 1;
      }

      // 5. Perform financial calculations and monthly breakdown on WON deals only
      const monthlyDataAgg = {};
      let totalGrossCommission = 0;
      let totalNetCommission = 0;

      for (const deal of wonDeals) {
        const grossCommission = parseMoney(deal[FIELD_IDS.grossCommission]);
        const netCommission = parseMoney(deal[FIELD_IDS.netCommission]);
        const paymentReceived = parseMoney(deal[FIELD_IDS.paymentReceived]);
        const propertyPrice = parseFloat(deal.OPPORTUNITY) || 0;
        const amountReceivable =
          parseFloat(deal[FIELD_IDS.amountReceivable]) || 0;

        totalGrossCommission += grossCommission;
        totalNetCommission += netCommission;

        const month = new Date(deal.CLOSEDATE).toLocaleString("default", {
          month: "long",
        });
        if (!monthlyDataAgg[month]) {
          monthlyDataAgg[month] = {
            dealsWon: 0,
            propertyPrice: 0,
            grossCommission: 0,
            netCommission: 0,
            paymentReceived: 0,
            amountReceivable: 0,
          };
        }
        monthlyDataAgg[month].dealsWon++;
        monthlyDataAgg[month].propertyPrice += propertyPrice;
        monthlyDataAgg[month].grossCommission += grossCommission;
        monthlyDataAgg[month].netCommission += netCommission;
        monthlyDataAgg[month].paymentReceived += paymentReceived;
        monthlyDataAgg[month].amountReceivable += amountReceivable;
      }

      // 6. Format all aggregated data for the UI
      const totalPropertyValueAllDeals = Object.values(developersAgg).reduce(
        (sum, dev) => sum + dev.totalValue,
        0
      );
      const totalDealsByMonth = Object.entries(monthlyDataAgg).map(
        ([month, data]) => ({ month, ...data })
      );
      const propertyTypesData = Object.entries(propertyTypesAgg).map(
        ([name, value]) => ({ name, value })
      );
      const developersData = Object.entries(developersAgg).map(
        ([developer, data]) => ({
          developer,
          value: data.totalValue,
          percentage:
            totalPropertyValueAllDeals > 0
              ? ((data.totalValue / totalPropertyValueAllDeals) * 100).toFixed(
                  2
                )
              : 0,
        })
      );
      // Build maps for source lookups (try both STATUS_ID and numeric ID)
      const statusMapByStatusId = new Map(
        (statuses || []).map((s) => [String(s.STATUS_ID), s.NAME])
      );
      const statusMapById = new Map(
        (statuses || []).map((s) => [String(s.ID), s.NAME])
      );

      // Convert leadSourceAgg (which uses whatever value was in deal.SOURCE_ID) to named data
      const leadSourceData = Object.entries(leadSourceAgg)
        .map(([sourceId, value]) => {
          const key = String(sourceId);
          // Prefer STATUS_ID lookup, then numeric ID, then fallback to the original id string
          const name =
            statusMapByStatusId.get(key) ||
            statusMapById.get(key) ||
            key ||
            "Unknown";
          return { name, value, id: sourceId };
        })
        .sort((a, b) => b.value - a.value); // sort descending by count

      const propertyTypeSalesAgg = {};

      for (const deal of wonDeals) {
        const price = parseFloat(deal.OPPORTUNITY) || 0;
        const typeId = deal[FIELD_IDS.propertyType];
        const typeName = propertyTypeMap.get(typeId) || "Unknown";

        if (!propertyTypeSalesAgg[typeName]) {
          propertyTypeSalesAgg[typeName] = { units: 0, value: 0 };
        }

        propertyTypeSalesAgg[typeName].units += 1;
        propertyTypeSalesAgg[typeName].value += price;
      }

      const salesByPropertyType = Object.entries(propertyTypeSalesAgg)
        .map(([type, data]) => ({
          type,
          units: data.units,
          value: data.value,
        }))
        .sort((a, b) => b.value - a.value);

      return {
        kpis: {
          totalDeals: allDeals.length,
          dealsWon: wonDeals.length,
          grossCommission: totalGrossCommission,
          netCommission: totalNetCommission,
        },
        allDevelopers,
        totalDealsByMonth,
        propertyTypesData,
        developersData,
        leadSourceData,
        salesByPropertyType,
      };
    },
  });
};
