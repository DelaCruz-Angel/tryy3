 document.querySelectorAll('.toggle-password').forEach((eye) => {
    eye.addEventListener('click', () => {
      const pwdInput = eye.previousElementSibling;
      pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
    });
  });

  class User {
    #firstName; #lastName; #mi; #email; #password;
    constructor(firstName,lastName,mi,email,password){
      this.#firstName=firstName; this.#lastName=lastName;
      this.#mi=mi; this.#email=email; this.#password=password;
    }
    getEmail(){ return this.#email; }
    checkPassword(password){ return this.#password===password; }
    toJSON(){ return {firstName:this.#firstName,lastName:this.#lastName,mi:this.#mi,email:this.#email,password:this.#password}; }
    saveToStorage(){ localStorage.setItem('user', JSON.stringify(this.toJSON())); }
  }

  const signupBtn = document.querySelector('.signup-btn');
  const signupMessage = document.getElementById('signupMessage');


  document.querySelectorAll('input[type="text"]').forEach((input,index)=>{
    if(index<=2){
      input.addEventListener('input',()=>{ input.value=input.value.replace(/[^a-zA-Z]/g,''); });
    }
  });

 
  signupBtn.addEventListener('click',()=>{
    const inputsText=document.querySelectorAll('input[type="text"]');
    const firstName=inputsText[0].value.trim();
    const lastName=inputsText[1].value.trim();
    const mi=inputsText[2].value.trim();
    const email=document.querySelector('input[type="email"]').value.trim();
    const password=document.getElementById('password').value.trim();
    const confirmPassword=document.getElementById('confirmPassword').value.trim();

    if(!firstName||!lastName||!email||!password||!confirmPassword){
      signupMessage.style.color='red';
      signupMessage.textContent='Please fill in all fields';
      return;
    }

    if(!email.endsWith('@gmail.com')){
      signupMessage.style.color='red';
      signupMessage.textContent='Please use a valid Gmail account';
      return;
    }

    if(password!==confirmPassword){
      signupMessage.style.color='red';
      signupMessage.textContent='Passwords do not match';
      return;
    }

    const passwordRegex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if(!passwordRegex.test(password)){
      signupMessage.style.color='red';
      signupMessage.textContent='Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
      return;
    }

    const newUser=new User(firstName,lastName,mi,email,password);
    newUser.saveToStorage();

    signupMessage.style.color='green';
    signupMessage.textContent='Sign up successful! Redirecting to login...';

    setTimeout(()=>{ window.location.href='index.html'; },2000);
  });