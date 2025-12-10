const mobileBtn = document.getElementById('mobileBtn');
const navLinks = document.getElementById('navLinks');

mobileBtn.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  mobileBtn.textContent = navLinks.classList.contains('open') ? '✖' : '☰';
});

const dropdown = document.querySelector(".dropdown");
const dropdownMenu = document.querySelector(".dropdown-menu");

dropdown.addEventListener("click", () => {
  dropdownMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdownMenu.classList.remove("show");
  }
});


const logoutBtn = document.querySelector('.dropdown-item.logout');


logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');

  window.location.href = 'index.html';
});



document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        console.log("No user found in localStorage");
        return;
    }

    const firstName = user.firstName ? user.firstName.toUpperCase() : "";
  
    const middleInitial = user.mi ? user.mi.charAt(0).toUpperCase() + "." : "";
   
    const lastName = user.lastName ? user.lastName.toUpperCase() : "";

 
    const fullName = `${firstName} ${middleInitial} ${lastName}`.trim();

 
    const display = document.getElementById("displayUsername");
    if (display) {
        display.textContent = fullName;
    } else {
        console.log("displayUsername div NOT found");
    }
});

