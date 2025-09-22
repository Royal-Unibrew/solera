export function getCatalogServiceFilterHeader() {
  // Helper to get cookie by name
  function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  }

  // Get and convert delivery date from cookie (format: dd.mm.yyyy -> yyyy-mm-dd)
  const deliveryDate = getCookie('delivery_date');
  let DDATE = '';
  if (deliveryDate) {
    const [dd, mm, yyyy] = deliveryDate.split('.');
    DDATE = `${yyyy}-${mm}-${dd}`;
  }

  // Get selectedCompany from localStorage
  let KUNAG = '';
  try {
    const selectedCompany = JSON.parse(localStorage.getItem('selectedCompany'));
    if (selectedCompany?.ship_to_customers?.[0]?.ship_to_customer_id) {
      KUNAG = selectedCompany.ship_to_customers[0].ship_to_customer_id;
    }
  } catch {
  }

  // Get sap_customer_id from cookie
  const KUNNR = getCookie('sap_customer_id') || '';

  // APL is plant_id, set to '0035'
  const APL = '0035';

  // Other static values
  const CG5 = 'J12';
  const HT = 'NORMALCUSTOMER';
  const PATP = 'X';
  const SGID = '002';

  // Assemble the filter string
  return `(APL eq '${APL}' and CG5 eq '${CG5}' and DDATE eq '${DDATE}' and HT eq '${HT}' and KUNAG eq '${KUNAG}' and KUNNR eq '${KUNNR}' and PATP eq '${PATP}' and SGID eq '${SGID}')`;
}
