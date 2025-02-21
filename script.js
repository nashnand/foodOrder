
const menuItemsContainer = document.querySelector('.menu-items');
const orderList = document.getElementById('orderList');
const totalAmount = document.getElementById('totalAmount');
let total = 0;

// Function to fetch menu items from the API
async function fetchMenuItems(type = '') {
  try {
    const url = type ? `${baseUrl}/api/menu?type=${type}` : `${baseUrl}/api/menu`;
    const response = await fetch(url);
    const menuItems = await response.json();

    const menuItemsContainer = document.querySelector('.menu-items');
    menuItemsContainer.innerHTML = '';
    menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.classList.add('menu-item');
      menuItem.innerHTML = `
      <img src="${item.imageUrl || 'default-image.jpg'}" alt="${item.itemName}">
      <h3>${item.itemName}</h3>
      <p class="price">₹${item.price.toFixed(2)}</p>
      <div class="action-container">
        <button class="add-button" onclick="initializeQuantity('${item.itemName}', ${item.price}, this)">Add</button>
      </div>
    `;

      menuItemsContainer.appendChild(menuItem);
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    // Display error in SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Failed to load menu items. Please try again later.',
      // footer: `<p>Error Details: ${error.message}</p>` // Optional, remove if not needed
    });
    document.querySelector('.menu-items').innerHTML = '<p>Failed to load menu items. Please try again later.</p>';

  }
}

// Function to initialize the quantity when "Add" button is clicked
function initializeQuantity(name, price, button) {
  const parentContainer = button.parentNode;

  // Replace the "Add" button with quantity controls
  parentContainer.innerHTML = `
    <div class="quantity-container">
      <button class="quantity-button" onclick="changeQuantity('${name}', -1, ${price}, this)">-</button>
      <input type="number" class="quantity-input" value="1" min="1" onchange="updateCustomQuantity('${name}', ${price}, this)">
      <button class="quantity-button" onclick="changeQuantity('${name}', 1, ${price}, this)">+</button>
    </div>
  `;

  // Add the item to the order with initial quantity 1
  addToOrder(name, 1, price);
}

// Function to change the quantity of an item
function changeQuantity(name, change, price, button) {
  const quantityInput = button.parentNode.querySelector('.quantity-input');
  let currentQuantity = parseInt(quantityInput.value, 10);
  currentQuantity += change;

  if (currentQuantity <= 0) {
    // Reset to "Add" button if quantity is less than 1
    const parentContainer = button.parentNode.parentNode;
    parentContainer.innerHTML = `<button class="add-button" onclick="initializeQuantity('${name}', ${price}, this)">Add</button>`;

    // Remove the item from the order
    removeFromOrder(name);
  } else {
    // Update the quantity and the order list
    quantityInput.value = currentQuantity;
    updateOrder(name, currentQuantity, price);
  }
}

// Function to handle custom quantity input
function updateCustomQuantity(name, price, input) {
  let quantity = parseInt(input.value, 10);

  if (isNaN(quantity) || quantity <= 0) {
    // Reset to "Add" button if invalid quantity is entered
    const parentContainer = input.parentNode.parentNode;
    parentContainer.innerHTML = `<button class="add-button" onclick="initializeQuantity('${name}', ${price}, this)">Add</button>`;

    // Remove the item from the order
    removeFromOrder(name);
  } else {
    // Update the order with the new quantity
    updateOrder(name, quantity, price);
  }
}

// Function to add an item to the order
function addToOrder(name, quantity, price) {
  const existingItem = Array.from(orderList.children).find(item =>
    item.dataset.name === name
  );

  if (existingItem) {
    // Update quantity and total price for the existing item
    const quantitySpan = existingItem.querySelector('.order-quantity');
    const amountSpan = existingItem.querySelector('.amount');

    quantitySpan.textContent = quantity;
    const newAmount = quantity * price;
    amountSpan.textContent = `₹${newAmount.toFixed(2)}`;
  } else {
    // Add a new item to the list
    const listItem = document.createElement('li');
    listItem.dataset.name = name;

    listItem.innerHTML = `
      ${name} - 
      <span class="order-quantity">${quantity}</span> x ₹${price.toFixed(2)} = 
      <span class="amount">₹${(quantity * price).toFixed(2)}</span>
    `;
    orderList.appendChild(listItem);
  }

  // Recalculate the total amount
  recalculateTotal();
}

// Function to remove an item from the order
function removeFromOrder(name) {
  const existingItem = Array.from(orderList.children).find(item =>
    item.dataset.name === name
  );

  if (existingItem) {
    // Remove the item from the order list
    orderList.removeChild(existingItem);

    // Update the total amount
    recalculateTotal();
  }
}

// Function to update the order when the quantity changes
function updateOrder(name, quantity, price) {
  const existingItem = Array.from(orderList.children).find(item =>
    item.dataset.name === name
  );

  if (existingItem) {
    const quantitySpan = existingItem.querySelector('.order-quantity');
    const amountSpan = existingItem.querySelector('.amount');

    // Update the quantity and the amount
    quantitySpan.textContent = quantity;
    const newAmount = quantity * price;
    amountSpan.textContent = `₹${newAmount.toFixed(2)}`;
  }

  // Recalculate the total amount
  recalculateTotal();
}

// Function to recalculate the total amount
function recalculateTotal() {
  let total = 0;
  const items = orderList.querySelectorAll('li');
  items.forEach(item => {
    const amount = parseFloat(item.querySelector('.amount').textContent.replace('₹', ''));
    total += amount;
  });
  totalAmount.textContent = `Total: ₹${total.toFixed(2)}`;
}


async function placeOrder() {
  const orderItems = [];
  const orderList = document.querySelectorAll("#orderList li");

  if (orderList.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No items in the order!',
      text: 'Please add items to place an order.',
    });
    return;
  }

  orderList.forEach((item) => {
    // Normalize text: Remove extra whitespace and newlines
    const text = item.textContent.replace(/\s+/g, " ").trim();
    console.log("Normalized Order List Item Text:", text); // Debugging log

    // Split the string into parts
    const parts = text.split(" - ");
    if (parts.length === 2) {
      const itemName = parts[0].trim(); // Item name
      const details = parts[1].split("x ₹"); // Split to isolate price and total

      if (details.length === 2) {
        const unitPriceAndTotal = details[1].split("= ₹"); // Split to separate unit price and total
        if (unitPriceAndTotal.length === 2) {
          const unitPrice = parseFloat(unitPriceAndTotal[0].trim());
          const totalPrice = parseFloat(unitPriceAndTotal[1].trim());
          const quantity = Math.round(totalPrice / unitPrice); // Calculate quantity

          // Add item to the list
          orderItems.push({
            name: itemName,
            quantity,
            price: unitPrice,
          });
        }
      }
    } else {
      console.warn(`Unexpected item format: ${text}`);
    }
  });

  if (orderItems.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Order Error',
      text: 'Failed to parse order items. Please check the order details.',
    });
    return;
  }

  const totalAmount = parseFloat(
    document.getElementById("totalAmount").textContent.replace("Total: ₹", "")
  );

  const orderData = {
    orderId: Date.now().toString(),
    items: orderItems,
    totalAmount: totalAmount,
  };

  console.log("Order Data to Send:", JSON.stringify(orderData));

  try {
    const response = await fetch(`${baseUrl}/api/foodOrders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Order Placed Successfully!',
        html: `<p>Order placed successfully!</p><p><strong>Order ID:</strong> ${orderData.orderId}</p>`,
        confirmButtonText: 'OK',
      });
      document.getElementById("orderList").innerHTML = "";
      document.getElementById("totalAmount").textContent = "Total: ₹0.00";
      fetchMenuItems();//This will reset the quantity
    } else {
      const errorData = await response.json();
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: errorData.message || 'Unknown error occurred.',
      });
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Order Error',
      text: 'An error occurred. Please try again later.',
    });
    console.error("Error placing order:", error);
  }
}
