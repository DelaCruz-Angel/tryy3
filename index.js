 const slides = document.querySelectorAll('.slide');
  let current = 0;

  function nextSlide() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }

  setInterval(nextSlide, 3000);

  class User {
    #firstName;
    #lastName;
    #mi;
    #email;
    #password;

    constructor(firstName, lastName, mi, email, password) {
      this.#firstName = firstName;
      this.#lastName = lastName;
      this.#mi = mi;
      this.#email = email;
      this.#password = password;
    }

    getEmail() { return this.#email; }
    checkPassword(password) { return this.#password === password; }

    static loadFromStorage() {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (!savedUser) return null;
      return new User(
        savedUser.firstName,
        savedUser.lastName,
        savedUser.mi,
        savedUser.email,
        savedUser.password
      );
    }
  }

  const loginBtn = document.getElementById('loginBtn');
  const gmailBtn = document.getElementById('gmailLogin');
  const fbBtn = document.getElementById('fbLogin');
  const instaBtn = document.getElementById('instaLogin');
  const loginMessage = document.getElementById('loginMessage');

 
  loginBtn.addEventListener('click', () => {
    const inputEmail = document.getElementById('username').value.trim();
    const inputPassword = document.getElementById('password').value.trim();

    const savedUser = User.loadFromStorage();
    if (!savedUser) {
      loginMessage.style.color = 'red';
      loginMessage.textContent = 'No account found. Please sign up first.';
      return;
    }

    if (inputEmail === savedUser.getEmail() && savedUser.checkPassword(inputPassword)) {
      loginMessage.style.color = 'green';
      loginMessage.textContent = 'Login successful! Redirecting...';
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
    } else {
      loginMessage.style.color = 'red';
      loginMessage.textContent = 'Invalid email or password.';
    }
  });

 
  function socialLogin(platform) {
    const input = prompt(`Enter your ${platform} email to continue:`);
    if (!input) return;

    const savedUser = User.loadFromStorage();
    if (!savedUser) {
      loginMessage.style.color = 'red';
      loginMessage.textContent = 'No account found. Please sign up first.';
      return;
    }

    if (input === savedUser.getEmail()) {
      loginMessage.style.color = 'green';
      loginMessage.textContent = `${platform} login successful! Redirecting...`;
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
    } else {
      loginMessage.style.color = 'red';
      loginMessage.textContent = `${platform} account not registered. Please sign up first.`;
    }
  }

  gmailBtn.addEventListener('click', () => socialLogin('Gmail'));
  fbBtn.addEventListener('click', () => socialLogin('Facebook'));
  instaBtn.addEventListener('click', () => socialLogin('Instagram'));



document.querySelectorAll('.toggle-password').forEach((eye) => {
  eye.addEventListener('click', () => {
    const pwdInput = eye.previousElementSibling;
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
  });
});
