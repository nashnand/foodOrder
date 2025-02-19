
let baseUrl; // Declare the base URL globally

// Fetch the base URL from config.json
fetch('config.json')
  .then(response => response.json())
  .then(config => {
    baseUrl = config.baseUrl; // Set the base URL globally
    console.log("Base URL:", baseUrl);

    // Fetch and render chart data after baseUrl is loaded
    fetchChartData();
  })
  .catch(error => {
    console.error('Error loading config:', error);
  });

async function fetchReport() {
  const year = document.getElementById('year').value;
  const month = document.getElementById('month').value;

  try {
    const response = await fetch(`${baseUrl}/api/foodOrders/report/${year}/${month}`);
    const data = await response.json();

    const labels = data.map(item => item.itemName);
    const values = data.map(item => item.totalAmount);

    renderCharts(labels, values);
  } catch (error) {
    console.error('Error fetching report:', error);
  }
}

async function fetchChartData() {
  try {
    const response = await fetch(`${baseUrl}/api/stats`); 
    const jsonData = await response.json();

    // Extract labels and values for the bar chart
    const barLabels = jsonData.mostPopularItems.map(item => item.item);
    const barValues = jsonData.mostPopularItems.map(item => item.total_sum);

    // Extract values for the pie chart
    const pieLabels = ['Average Order Value', 'Total Orders', 'Total Revenue'];
    const pieValues = [jsonData.averageOrderValue, jsonData.totalOrders, jsonData.totalRevenue];

    // Render the charts
    renderBarChart(barLabels, barValues);
    renderPieChart(pieLabels, pieValues);
  } catch (error) {
    console.error('Error fetching chart data:', error);
  }
}
function renderBarChart(labels, values) {
  const barCtx = document.getElementById('barChart').getContext('2d');
  const gradient = barCtx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(54, 162, 235, 1)');
  gradient.addColorStop(1, 'rgba(75, 192, 192, 0.5)');

  new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Revenue',
        data: values,
        backgroundColor: gradient,
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: 'rgba(54, 162, 235, 0.8)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#333',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Revenue: ₹${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Revenue (₹)',
            color: '#666',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.5)',
            borderDash: [5, 5]
          }
        },
        x: {
          title: {
            display: true,
            text: 'Items',
            color: '#666',
            font: {
              size: 12,
              weight: 'bold'
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}
function renderPieChart(labels, values) {
const pieCtx = document.getElementById('pieChart').getContext('2d');
const gradient1 = pieCtx.createLinearGradient(0, 0, 0, 200);
gradient1.addColorStop(0, 'rgba(75, 192, 192, 1)');
gradient1.addColorStop(1, 'rgba(153, 102, 255, 1)');

const gradient2 = pieCtx.createLinearGradient(0, 0, 0, 200);
gradient2.addColorStop(0, 'rgba(255, 159, 64, 1)');
gradient2.addColorStop(1, 'rgba(255, 99, 132, 1)');

const gradient3 = pieCtx.createLinearGradient(0, 0, 0, 200);
gradient3.addColorStop(0, 'rgba(54, 162, 235, 1)');
gradient3.addColorStop(1, 'rgba(75, 192, 192, 1)');

new Chart(pieCtx, {
type: 'pie',
data: {
  labels: labels,
  datasets: [{
    data: values,
    backgroundColor: [gradient1, gradient2, gradient3],
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    hoverOffset: 10,
  }]
},
options: {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        color: '#333',
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.label}: ₹${context.raw}`;
        }
      }
    }
  },
  layout: {
    padding: 10
  }
}
});
}
