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


function loadDashboardPosts() {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = '';

  const posts = JSON.parse(localStorage.getItem('markers')) || [];

  posts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'data-card';


    const textDiv = document.createElement('div');
    textDiv.className = 'text-content';
    textDiv.innerHTML = `
      <div class="field-title"><strong>${escapeHtml(post.title)}</strong></div>
      <div class="field-value">${escapeHtml(post.desc)}</div>
      <div class="field-value"><strong>Severity:</strong> ${post.severity ? post.severity.charAt(0).toUpperCase() + post.severity.slice(1) : 'N/A'}</div>
    `;


    const imagesDiv = document.createElement('div');
    if (post.images?.length === 1) imagesDiv.className = 'images one';
    else if (post.images?.length === 2) imagesDiv.className = 'images two';
    else if (post.images?.length >= 3) imagesDiv.className = 'images more';

    post.images?.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => showFullImage(src));
      imagesDiv.appendChild(img);
    });

    card.appendChild(textDiv);
    card.appendChild(imagesDiv);
    cardContainer.appendChild(card);
  });
}


function escapeHtml(s) {
  return s ? s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) : '';
}


function showFullImage(src) {
  const popup = document.getElementById('imagePopup');
  const img = document.getElementById('popupImg');
  img.src = src;
  popup.classList.add('show');
}

document.getElementById('imagePopup').addEventListener('click', () => {
  const popup = document.getElementById('imagePopup');
  popup.classList.remove('show');
  setTimeout(() => document.getElementById('popupImg').src = '', 200);
});


function renderSeverityChart() {
  const posts = JSON.parse(localStorage.getItem('markers')) || [];
  const severityCount = { High: 0, Medium: 0, Low: 0 };

  posts.forEach(p => {
    const sev = p.severity?.toLowerCase();
    if (sev === 'high') severityCount.High++;
    else if (sev === 'medium') severityCount.Medium++;
    else if (sev === 'low') severityCount.Low++;
  });

  const ctx = document.getElementById('severityChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        label: 'Hazard Severity',
        data: [severityCount.High, severityCount.Medium, severityCount.Low],
        backgroundColor: ['#ff0000', '#ffa500', '#00cc00'],
        borderColor: ['#ff0000', '#ffa500', '#00cc00'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Number of Hazards' } },
        x: { title: { display: true, text: 'Severity' } }
      }
    }
  });
}


async function loadWeather() {
  const apiKey = "a086e741534d42a385c31855251511";
  const location = "Manolo Fortich";
  const weatherBox = document.getElementById("weatherBox");
  if (!weatherBox) return;

  weatherBox.innerHTML = "<p class='placeholder-text'>Loading Weather...</p>";
  try {
    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

weatherBox.innerHTML = `
  <div class="weather-horizontal">
    <div class="weather-left">
      <img src="https:${data.current.condition.icon}" alt="${data.current.condition.text}">
      <div class="temp">${data.current.temp_c}°C</div>
    </div>
    <div class="weather-right">
      <h2>${data.location.name}</h2>
      <h4>${data.location.region}</h4>
      <div>${data.current.condition.text}</div>
      <div class="weather-details">Wind: ${data.current.wind_kph} kph | Humidity: ${data.current.humidity}%</div>
    </div>
  </div>
`;


  } catch (err) {
    console.error(err);
    weatherBox.innerHTML = "<p class='placeholder-text'>Unable to load weather data.</p>";
  }
}

loadWeather();
setInterval(loadWeather, 600000);


document.addEventListener("DOMContentLoaded", () => {
  loadDashboardPosts();
  renderSeverityChart();
});


window.addEventListener('storage', (event) => {
  if(event.key === 'markers') {
    loadDashboardPosts(); 
    renderSeverityChart(); 
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;
  const fullName = `${user.firstName?.toUpperCase() || ""} ${user.mi ? user.mi.charAt(0).toUpperCase() + "." : ""} ${user.lastName?.toUpperCase() || ""}`.trim();
  const display = document.getElementById("displayUsername");
  if (display) display.textContent = fullName;
});


document.querySelector('.dropdown-item.logout').addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});
