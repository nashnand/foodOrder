
const menuItemsContainer = document.querySelector('.menu-items');
const orderList = document.getElementById('orderList');
const totalAmount = document.getElementById('totalAmount');
let total = 0;

// Function to fetch menu items from the API
async function fetchMenuItems(type = '') {
  try {
    const url = type ? `http://localhost:8080/api/menu?type=${type}` : `http://localhost:8080/api/menu`;
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
        <button onclick="addToOrder('${item.itemName}', ${item.price})">Add</button>
      `;
      menuItemsContainer.appendChild(menuItem);
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    document.querySelector('.menu-items').innerHTML = '<p>Failed to load menu items. Please try again later.</p>';
  }
}

// Function to add an item to the order
// function addToOrder(name, price) {
//   const listItem = document.createElement('li');
//   listItem.textContent = `${name} - ₹${price.toFixed(2)}`;
//   orderList.appendChild(listItem);
//   total += price;
//   totalAmount.textContent = `Total: ₹${total.toFixed(2)}`;
// }

// Function to add an item to the order
function addToOrder(name, price) {
  const existingItem = Array.from(orderList.children).find(item => 
    item.dataset.name === name
  );

  if (existingItem) {
    // Update quantity and total price for the existing item
    const quantitySpan = existingItem.querySelector('.quantity');
    const amountSpan = existingItem.querySelector('.amount');

    const quantity = parseInt(quantitySpan.textContent, 10) + 1;
    quantitySpan.textContent = quantity;

    const newAmount = quantity * price;
    amountSpan.textContent = `₹${newAmount.toFixed(2)}`;
  } else {
    // Add new item to the list
    const listItem = document.createElement('li');
    listItem.dataset.name = name;

    listItem.innerHTML = `
      ${name} - 
      <span class="quantity">1</span> x ₹${price.toFixed(2)} = 
      <span class="amount">₹${price.toFixed(2)}</span>
    `;
    orderList.appendChild(listItem);
  }

  // Update the total amount
  total += price;
  totalAmount.textContent = `Total: ₹${total.toFixed(2)}`;
}


// Function to place the order
// function placeOrder() {
//   alert(`Order placed! Total amount: ₹${total.toFixed(2)}`);
//   // Clear order summary
//   orderList.innerHTML = '';
//   total = 0;
//   totalAmount.textContent = 'Total: ₹0.00';
// }

async function placeOrder() {
  const orderItems = [];
  const orderList = document.querySelectorAll("#orderList li");

  // orderList.forEach((item) => {
  //   const [name, price] = item.textContent.split(" - ₹");
  //   orderItems.push({ name: name.trim(), price: parseFloat(price.trim()) });
  // });
   console.log(orderList);
  orderList.forEach((item) => {
    
    const text = item.textContent.trim(); // Get the content and remove extra spaces
    console.log(item.textContent.trim());
    // Match name, quantity, and price using a regular expression
    const match = text.match(/^(.*?) -\s*(\d+)\s*x\s*₹(\d+(\.\d{1,2})?)\s*=\s*₹(\d+(\.\d{1,2})?)$/);
  
    if (match) {
      const name = match[1].trim();
      const quantity = match[2];  // Extract quantity
      const unitPrice = parseFloat(match[3].trim()); // Extract unit price
      const price = parseFloat(match[5].trim()); // Extract total price (optional)
  
      orderItems.push({
        name,
        quantity,
        price
      });
    } else {
      console.warn(`Unexpected item format: ${text}`);
    }
  });

  const totalAmount = parseFloat(
    document.getElementById("totalAmount").textContent.replace("Total: ₹", "")
  );
  // Check if orderItems is empty
  if (orderItems.length === 0) {
    alert("No items in the order. Please add items to place an order.");
    return; // Stop execution
  }
  const orderId = Date.now().toString();
  const orderData = {
    orderId: orderId,
    items: orderItems,
    totalAmount: totalAmount,
  };
 console.log(JSON.stringify(orderData));
    try {
      const response = await fetch("http://localhost:8080/api/foodOrders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
   
    if (response.ok) {
      alert("Order placed successfully!");
      document.getElementById("orderList").innerHTML = "";
      document.getElementById("totalAmount").textContent = "Total: ₹0.00";
    } else {
      alert("Failed to place the order. Please try again.");
    }
  } catch (error) {
    console.error("Error placing order:", error);
    alert("An error occurred. Please try again later.");
  }
}