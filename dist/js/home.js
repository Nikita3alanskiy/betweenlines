// concerts.js
import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('concertsContainer');
  container.innerHTML = '<p class="text-center text-muted">Завантаження подій...</p>';

  try {
    const concertsCol = collection(db, 'concerts');
    const querySnapshot = await getDocs(concertsCol);

    container.innerHTML = '';

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="text-center text-muted">Поки що немає концертів.</p>';
      return;
    }

    const monthNames = ['СІЧ','ЛЮТ','БЕР','КВІТ','ТРАВ','ЧЕРВ','ЛИП','СЕРП','ВЕР','ЖОВТ','ЛИСТ','ГРУД'];
    const today = new Date();

    // Перетворюємо документи у масив об’єктів з датою
    const concertsArray = [];
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const dateObj = new Date(data.dateTime);
      concertsArray.push({ id: docSnap.id, data, dateObj });
    }

    // Фільтруємо лише майбутні події і сортуємо за датою
    const upcomingConcerts = concertsArray
      .filter(c => c.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 4); // максимум 4 події

    for (const concert of upcomingConcerts) {
      const { id, data, dateObj } = concert;

      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = monthNames[dateObj.getMonth()];
      const time = dateObj.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

      let locationName = 'Невідома локація';
      if (data.locationId) {
        const locDoc = await getDoc(doc(db, 'locations', data.locationId));
        if (locDoc.exists()) locationName = locDoc.data().name || locationName;
      }

      const eventHTML = `
        <a href="event.html?id=${id}" class="event-item">
          <div class="event-date">
            <span class="event-day">${day}</span>
            <span class="event-month">${month}</span>
          </div>
          <div class="event-info">
            <h4 class="event-title">${data.title}</h4>
            <p class="event-location">🎵 ${locationName}</p>
          </div>
          <div class="event-time">${time}</div>
        </a>
      `;

      container.innerHTML += eventHTML;
    }

    if (upcomingConcerts.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">Поки що немає майбутніх концертів.</p>';
    }

  } catch (error) {
    console.error('Помилка завантаження концертів:', error);
    container.innerHTML = '<p class="text-danger text-center">Не вдалося завантажити концерти 😔</p>';
  }
});
