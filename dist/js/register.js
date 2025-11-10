// js/register.js
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Форма відправлена!');

    const displayName = document.getElementById('displayName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Валідація форми
    if (!validateForm(displayName, email, password, confirmPassword)) {
      return;
    }

    showLoading(true);

    try {
      console.log('Спробуємо створити користувача...');

      // 1. Створюємо користувача в Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('Користувач створений в Auth:', user.uid);

      // 2. Оновлюємо displayName
      await user.updateProfile({
        displayName: displayName
      });
      console.log('DisplayName оновлено');

      // 3. Зберігаємо в Firestore (БЕЗ createdAt та updatedAt)
      const userData = {
        userId: user.uid,
        email: email,
        displayName: displayName,
        phoneNumber: phoneNumber || '',
        role: 'user'
        // Видалено: createdAt та updatedAt
      };

      await db.collection('users').doc(user.uid).set(userData);
      console.log('Дані збережено в Firestore');

      // 4. Показуємо повідомлення про успіх
      showAlert('✅ Реєстрація успішна! Перенаправляємо на головну сторінку...', 'success');

      // 5. Перекидаємо на головну через 2 секунди
      setTimeout(() => {
        console.log('Перенаправляємо на головну сторінку');
        window.location.href = '../index.html';
      }, 2000);

    } catch (error) {
      console.error('Помилка реєстрації:', error);
      handleFirebaseError(error);
      showLoading(false);
    }
  });

  function validateForm(displayName, email, password, confirmPassword) {
    if (displayName.length < 2) {
      showAlert('Ім\'я повинно містити мінімум 2 символи!', 'error');
      return false;
    }

    if (!isValidEmail(email)) {
      showAlert('Будь ласка, введіть коректну email адресу!', 'error');
      return false;
    }

    if (password.length < 8) {
      showAlert('Пароль повинен містити мінімум 8 символів!', 'error');
      return false;
    }

    if (password !== confirmPassword) {
      showAlert('Паролі не співпадають!', 'error');
      return false;
    }

    return true;
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function handleFirebaseError(error) {
    let errorMessage = 'Сталася помилка при реєстрації. Спробуйте ще раз.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Ця email адреса вже використовується.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Неправильний формат email адреси.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Реєстрація з email/паролем не увімкнена.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Пароль занадто слабкий. Використовуйте мінімум 8 символів.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    showAlert(errorMessage, 'error');
  }

  function showLoading(show) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (show) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Завантаження...';
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Зареєструватися';
    }
  }

  function showAlert(message, type) {
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = `custom-alert alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
    alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    alert.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
        `;

    document.body.appendChild(alert);

    if (type === 'error') {
      setTimeout(() => {
        if (alert.parentNode) {
          alert.remove();
        }
      }, 5000);
    }
  }
});
