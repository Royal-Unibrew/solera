import { getAvailableShippingOptions } from '../../scripts/company/api.js';

function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/;`;
}

export default async function decorate(block) {
  block.innerHTML = '';
  const options = await getAvailableShippingOptions();
  const deliveryDates = Array.isArray(options)
  && options.length && options[0].delivery_dates ? options[0].delivery_dates : [];

  const wrapper = document.createElement('div');
  wrapper.className = 'dropdown-wrapper nav-tools-wrapper royal-delivery-dates-wrapper';

  const label = document.createElement('span');
  label.className = 'royal-delivery-dates-label';
  label.textContent = 'Delivery date:';
  wrapper.appendChild(label);

  if (!deliveryDates.length) {
    const noDates = document.createElement('span');
    noDates.className = 'royal-delivery-dates-empty';
    noDates.textContent = 'None';
    wrapper.appendChild(noDates);
    block.appendChild(wrapper);
    return;
  }

  let selectedDate = deliveryDates[0];

  // Dropdown button
  const dropdownBtn = document.createElement('button');
  dropdownBtn.type = 'button';
  dropdownBtn.className = 'nav-dropdown-button royal-delivery-dates-display';
  dropdownBtn.setAttribute('aria-haspopup', 'listbox');
  dropdownBtn.setAttribute('aria-expanded', 'false');
  dropdownBtn.innerHTML = `<span class="royal-delivery-dates-current">${selectedDate}</span> <span class="royal-delivery-dates-arrow">&#x25B6;</span>`;
  wrapper.appendChild(dropdownBtn);

  // Dropdown panel
  const panel = document.createElement('div');
  panel.className = 'nav-tools-panel royal-delivery-dates-panel';
  panel.style.display = 'none';

  const list = document.createElement('ul');
  list.className = 'authenticated-user-menu royal-delivery-dates-list';
  deliveryDates.forEach((date) => {
    const li = document.createElement('li');
    li.className = 'royal-delivery-dates-list-item';
    li.textContent = date;
    li.onclick = () => {
      selectedDate = date;
      setCookie('delivery_date', date);
      dropdownBtn.querySelector('.royal-delivery-dates-current').textContent = date;
      panel.style.display = 'none';
      dropdownBtn.setAttribute('aria-expanded', 'false');
    };
    list.appendChild(li);
  });
  panel.appendChild(list);
  wrapper.appendChild(panel);

  // Dropdown toggle logic
  dropdownBtn.onclick = (e) => {
    e.stopPropagation();
    const isOpen = panel.style.display === 'block';
    panel.style.display = isOpen ? 'none' : 'block';
    dropdownBtn.setAttribute('aria-expanded', String(!isOpen));
  };
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      panel.style.display = 'none';
      dropdownBtn.setAttribute('aria-expanded', 'false');
    }
  });

  block.appendChild(wrapper);
}
