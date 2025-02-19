let defaultImageUrl;
let config;
let baseUrl;

// Fetch the base URL from config.json
fetch('config.json')
  .then(response => response.json())
  .then(config => {
    baseUrl = config.baseUrl;
    defaultImageUrl = config.defaultImageUrl;
    console.log("Base URL:", baseUrl);

    // Fetch and render chart data after baseUrl is loaded
    fetchMenu();
  })
  .catch(error => {
    console.error('Error loading config:', error);
  });


// Fetch and display the menu
async function fetchMenu() {
  const response = await fetch(baseUrl+`/api/menu`);
  const menu = await response.json();
  const menuList = document.getElementById('menuList');
  menuList.innerHTML = '';
  menu.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.innerHTML = `
      <div class="menu-details">
        <img src="${item.imageUrl}" alt="${item.itemName}">
        <div>
          <p><strong>${item.itemName}</strong></p>
          <p>Price: ₹${item.price.toFixed(2)}</p>
          <p>Type: ${item.type}</p>
        </div>
      </div>
      <div class="menu-actions">
        <button class="edit" onclick="editMenu(${item.itemId})">Edit</button>
        <button class="delete" onclick="deleteMenu(${item.itemId})">Delete</button>
      </div>
    `;
    menuList.appendChild(menuItem);
  });
}

// Add or update menu
async function saveMenu(event) {
  event.preventDefault();

  const id = event.target.dataset.id || null;
  const menuData = {
    itemName: document.getElementById('itemName').value,
    imageUrl: document.getElementById('imageUrl').value,
    price: parseFloat(document.getElementById('price').value),
    type: document.getElementById('type').value
  };

  const method = id ? 'PATCH' : 'POST';
  const url = id ? `${baseUrl+`/api/menu`}/${id}` : baseUrl+`/api/menu`;

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuData)
    });

    if (!response.ok) {
      throw new Error(`Failed to save menu item. Status: ${response.status}`);
    }

    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Menu item has been saved successfully.'
    });

    document.getElementById('menuForm').reset();
    delete event.target.dataset.id;
    fetchMenu();
  } catch (error) {
    console.error('Error saving menu item:', error);

    // Display error in SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Unable to save menu item. Please try again later.',
      // footer: `<p>Error Details: ${error.message}</p>` // Optional, remove if not needed
    });
  }
}


// // Delete menu
// async function deleteMenu(id) {
//   await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
//   fetchMenu();
// }

async function deleteMenu(id) {
  // Display SweetAlert2 confirmation
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'You won’t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    try {
      // Perform deletion
      const response = await fetch(`${baseUrl+`/api/menu`}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        // Success alert and refresh menu
        await Swal.fire('Deleted!', 'The menu item has been deleted.', 'success');
        fetchMenu(); // Call your existing function to refresh the menu
      } else {
        // Handle error response
        Swal.fire('Error!', 'Failed to delete the menu item.', 'error');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      Swal.fire('Error!', 'An unexpected error occurred.', 'error');
    }
  }
}


// Edit menu
function editMenu(id) {
  fetch(`${baseUrl+`/api/menu`}/${id}`)
    .then(response => response.json())
    .then(item => {
      // Populate form fields with fetched data
      document.getElementById('itemName').value = item.itemName;
      document.getElementById('imageUrl').value = item.imageUrl;
      document.getElementById('price').value = item.price;
      document.getElementById('type').value = item.type;
      document.getElementById('menuForm').dataset.id = id;

      // Scroll to the form and focus on the first input field
      const container = document.querySelector('.container');
      if (container) {
        container.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest', // Aligns the top of the container with the top of the viewport
        });
        const firstInput = document.getElementById('itemName');
        if (firstInput) {
          firstInput.focus();
        }
      }
    })
    .catch(error => console.error('Error fetching menu item:', error));
}


// Set default image URL
document.getElementById('setDefaultImageUrl').addEventListener('click', () => {
  document.getElementById('imageUrl').value = defaultImageUrl;
});

// Initialize
document.getElementById('menuForm').addEventListener('submit', saveMenu);
