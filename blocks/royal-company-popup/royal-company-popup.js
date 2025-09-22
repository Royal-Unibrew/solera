// Royal Company Popup Block
// eslint-disable-next-line max-len
// IMPORTANT: Make sure 'royal-company-popup.css' is loaded globally in your HTML or main CSS entry point.
/**
 * Fetch companies for the current user using GraphQL and the auth token.
 * @returns {Promise<Array>} List of companies
 */

import * as authApi from '@dropins/storefront-auth/api.js';
import { fetchCustomerCompanies, setCurrentCompany } from '../../scripts/company/api.js';
import { loadCSS } from '../../scripts/aem.js';
import decorateDeliveryDates from '../royal-delivery-dates/royal-delivery-dates.js';

/**
 * Render the popup UI
 * @param {HTMLElement} block
 * @param {Array} companies
 * @param {Function} onSelect
 * @param {Function} onCancel
 */
function renderPopup(block, companies, onSelect, onCancel) {
  block.innerHTML = '';
  const overlay = document.createElement('div');
  overlay.className = 'royal-company-popup-overlay';

  const popup = document.createElement('div');
  popup.className = 'royal-company-popup';

  // X close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.className = 'royal-company-popup-close';
  closeBtn.onclick = onCancel;
  popup.appendChild(closeBtn);

  const title = document.createElement('h2');
  title.textContent = 'Select Your Company';
  // Removed inline style, handled by CSS
  popup.appendChild(title);

  const list = document.createElement('div');
  list.className = 'royal-company-list';
  let selectedIdx = null;

  companies.forEach((company, idx) => {
    const item = document.createElement('label');
    item.className = 'royal-company-list-item';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'company';
    radio.value = idx;
    radio.className = 'royal-company-radio';
    radio.checked = selectedIdx === idx;
    radio.onclick = () => {
      selectedIdx = idx;
      list.querySelectorAll('input[type="radio"]').forEach((r, i) => {
        r.checked = i === idx;
      });
    };

    const labelText = document.createElement('span');
    labelText.textContent = company.name_2 ? `${company.name} (${company.name_2})` : company.name;

    item.appendChild(radio);
    item.appendChild(labelText);
    list.appendChild(item);
  });
  popup.appendChild(list);

  const buttons = document.createElement('div');
  buttons.className = 'royal-company-popup-buttons';

  const selectBtn = document.createElement('button');
  selectBtn.textContent = 'Select';

  // Loader element
  const loader = document.createElement('span');
  loader.className = 'royal-company-popup-loader';
  loader.style.display = 'none';
  loader.innerHTML = '<span class="spinner"></span>';
  buttons.appendChild(loader);

  // Full overlay for blocking popup during select
  const blockingOverlay = document.createElement('div');
  blockingOverlay.className = 'royal-company-popup-blocking-overlay';
  blockingOverlay.style.display = 'none';
  popup.appendChild(blockingOverlay);

  selectBtn.onclick = async () => {
    if (selectedIdx !== null) {
      loader.style.display = 'inline-block';
      selectBtn.disabled = true;
      blockingOverlay.style.display = 'block';
      const company = companies[selectedIdx];
      const sapCustomerId = company.sap_customer_id;
      const shipToCustomerId = company.ship_to_customers
        && company.ship_to_customers[0]
        && company.ship_to_customers[0].ship_to_customer_id;
      if (!sapCustomerId || !shipToCustomerId) {
        loader.style.display = 'none';
        selectBtn.disabled = false;
        blockingOverlay.style.display = 'none';
        return;
      }
      const response = await setCurrentCompany(sapCustomerId, shipToCustomerId);
      loader.style.display = 'none';
      selectBtn.disabled = false;
      blockingOverlay.style.display = 'none';
      if (response && response.success !== false) {
        // Save selected company to localStorage
        localStorage.setItem('selectedCompany', JSON.stringify(company));
        // Save sap_customer_id to cookie
        document.cookie = `sap_customer_id=${encodeURIComponent(sapCustomerId)}; path=/;`;
        // Refresh delivery dates block instead of reloading the page
        const deliveryDatesBlock = document.querySelector('.royal-delivery-dates-wrapper');
        if (deliveryDatesBlock) {
          decorateDeliveryDates(deliveryDatesBlock);
        }
        // Optionally close the popup
        if (typeof onSelect === 'function') onSelect(company);
      }
    }
  };
  buttons.appendChild(selectBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = async () => {
    await authApi.revokeCustomerToken();
    onCancel();
  };
  buttons.appendChild(cancelBtn);

  popup.appendChild(buttons);
  overlay.appendChild(popup);
  block.appendChild(overlay);
}

/**
 * Main decorate function for the block
 */
export default async function decorate(block, { onCompanySelected }) {
  // Ensure CSS is loaded before rendering
  await loadCSS(`${window.hlx.codeBasePath}/blocks/royal-company-popup/royal-company-popup.css`);
  const companies = await fetchCustomerCompanies();
  return new Promise((resolve) => {
    renderPopup(block, companies, (company) => {
      block.innerHTML = '';
      if (onCompanySelected) onCompanySelected(company);
      resolve(company);
    }, () => {
      block.innerHTML = '';
      resolve(null);
    });
  });
}
