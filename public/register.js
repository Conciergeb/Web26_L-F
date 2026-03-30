document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorEl = document.getElementById('registerError');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();

    if (!email || !password || !confirmPassword) {
      errorEl.textContent = 'All fields are required';
      return;
    }

    if (password !== confirmPassword) {
      errorEl.textContent = 'Passwords do not match';
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (data.errors && data.errors[0]?.msg) || 'Register failed');

      alert('Registered successfully; please log in');
      window.location.href = 'Login.html';
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
});