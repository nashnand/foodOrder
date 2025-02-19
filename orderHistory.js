// let baseUrl; // Declare the base URL globally
const baseUrl = 'https://foodorder-uton.onrender.com'; // Ensure this is defined
// Fetch the base URL from config.json
// fetch('config.json')
//   .then((response) => {
//     if (!response.ok) {
//       throw new Error('Failed to load config.json');
//     }
//     return response.json();
//   })
//   .then((config) => {
//     baseUrl = config.baseUrl; // Set the base URL globally
//     console.log('Base URL:', baseUrl);

//     // Initialize event listeners and default actions
//     initializePage();
//   })
//   .catch((error) => {
//     console.error('Error loading config:', error);
//     alert('Failed to load configuration. Please check your setup.');
//   });

// function initializePage() {
  document.addEventListener('DOMContentLoaded', () => {
    const yearInput = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const tableBody = document.querySelector('#orderTable tbody');
    const tableFooter = document.querySelector('#orderTable tfoot'); // Add a footer section

    // Function to fetch and display data
    function fetchAndDisplayData(year, month) {
      const apiUrl = `${baseUrl}/api/foodOrders/${year}/${month}`;
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((orderData) => {
          // Clear existing table rows and footer
          tableBody.innerHTML = '';
          tableFooter.innerHTML = '';

          let grandTotal = 0; // Variable to calculate the total amount

          // Populate table with new data
          orderData.forEach((order) => {
            const row = document.createElement('tr');

            const orderIdCell = document.createElement('td');
            orderIdCell.textContent = order.orderId;
            row.appendChild(orderIdCell);

            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(order.date).toLocaleString();
            row.appendChild(dateCell);

            const itemsCell = document.createElement('td');
            const itemsList = order.items
              .map((item) => `${item.name} (x${item.quantity}) @ ₹${item.price}`)
              .join(', ');
            itemsCell.textContent = itemsList;
            row.appendChild(itemsCell);

            const totalAmountCell = document.createElement('td');
            totalAmountCell.textContent = `₹${order.totalAmount.toFixed(2)}`;
            row.appendChild(totalAmountCell);

            tableBody.appendChild(row);

            grandTotal += order.totalAmount; // Accumulate the total amount
          });

          // Add a footer row displaying the grand total
          const footerRow = document.createElement('tr');

          const footerCell1 = document.createElement('td');
          footerCell1.colSpan = 3; // Span across 3 columns
          footerCell1.textContent = 'Grand Total';
          footerCell1.style.textAlign = 'right';
          footerCell1.style.fontWeight = 'bold';

          const footerCell2 = document.createElement('td');
          footerCell2.textContent = `₹${grandTotal.toFixed(2)}`;
          footerCell2.style.fontWeight = 'bold';

          footerRow.appendChild(footerCell1);
          footerRow.appendChild(footerCell2);

          tableFooter.appendChild(footerRow);
        })
        .catch((error) => {
          console.error('There was a problem with the fetch operation:', error);
          alert('Failed to fetch order data. Please try again later.');
        });
    }

    // Set default year and month to current
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Months are zero-based

    yearInput.value = currentYear;
    monthSelect.value = currentMonth;

    // Fetch and display data for the current month and year on page load
    fetchAndDisplayData(currentYear, currentMonth);

    // Event listeners for year and month changes
    yearInput.addEventListener('change', () => {
      const selectedYear = yearInput.value || currentYear; // Fallback to default
      const selectedMonth = monthSelect.value || currentMonth; // Fallback to default
      fetchAndDisplayData(selectedYear, selectedMonth);
    });

    monthSelect.addEventListener('change', () => {
      const selectedYear = yearInput.value || currentYear; // Fallback to default
      const selectedMonth = monthSelect.value || currentMonth; // Fallback to default
      fetchAndDisplayData(selectedYear, selectedMonth);
    });

    // Download report functionality
    document.getElementById('downloadButton').addEventListener('click', () => {
      const selectedYear = yearInput.value || currentYear; // Fallback to default
      const selectedMonth = monthSelect.value || currentMonth; // Fallback to default

      if (!selectedYear || !selectedMonth) {
        alert('Please select both year and month.');
        return;
      }

      window.location.href = `${baseUrl}/api/foodOrders/report/${selectedYear}/${selectedMonth}/download`;
    });
  });

