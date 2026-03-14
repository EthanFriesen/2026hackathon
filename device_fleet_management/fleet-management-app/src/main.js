import './style.css'

function displayUserPopup() {
  const popup = document.getElementById('user-popup');
  popup.style.display = 'block';

  popup.innerHTML = `
    <span class="close-btn" onclick="document.getElementById('user-popup').style.display='none'">&times;</span>
    <h2>Add New User</h2>
    <form id="user-form">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required />
      
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required />

      <label for="phone">Phone:</label>
      <input type="tel" id="phone" name="phone" required />

      <label for="address">Address:</label>
      <input type="text" id="address" name="address" required />
      
      <button style="background-color: var(--primary-color);" type="submit">Add User</button>
    </form>
  `;
}

// handel form submission
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('user-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Here you can handle the form data and send it to your backend or update the UI
    alert('User added successfully!');
    form.reset();
    document.getElementById('user-popup').style.display = 'none';
  });
});

window.displayUserPopup = displayUserPopup;