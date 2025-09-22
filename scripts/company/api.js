import { fetchGraphQl } from '@dropins/tools/fetch-graphql.js';

/**
 * @returns {Promise<Array>} List of companies
 */
export async function fetchCustomerCompanies() {
  const query = `
    query GetCustomerCompanies {
      getCustomerCompanies {
        name
        name_2
        sap_customer_id
        ship_to_customers {
          city
          country_id
          is_tank_beer_customer
          name
          name_2
          ship_to_customer_id
          street
          zip_code
        }
      }
    }
  `;
  const result = await fetchGraphQl(query);
  return result.data?.getCustomerCompanies || [];
}

/**
 * @param {string} sapCustomerId
 * @param {string} shipToCustomerId
 * @returns {Promise<any>}
 */
export async function setCurrentCompany(sapCustomerId, shipToCustomerId) {
  const mutation = `
    mutation SetCurrentCompany($sapCustomerId: String!, $shipToCustomerId: String!) {
      setCurrentCompany(sap_customer_id: $sapCustomerId, ship_to_customer_id: $shipToCustomerId)
    }
  `;
  const variables = { sapCustomerId, shipToCustomerId };
  const result = await fetchGraphQl(mutation, { variables });
  return result.data?.setCurrentCompany || { success: false, message: 'Unknown error' };
}

export async function getAvailableShippingOptions() {
  const query = `
  query GetAvailableShippingOptions {
    getAvailableShippingOptions {
        date_overriding_text
        delivery_dates
        delivery_method
        info_text
        label
        pickup_points {
            city
            country_id
            name
            name2
            pickup_point_id
            street
            zip_code
        }
    }
}
`;
  const result = await fetchGraphQl(query);
  return result.data?.getAvailableShippingOptions || [];
}
