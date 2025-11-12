// concerts.js
import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('concertsContainer');
  container.innerHTML = '<p class="text-center text-muted">Завантаження подій...</p>';

  try {
    // Отримуємо колекцію "concerts"
    const concertsCol = collection(db, 'concerts');
    const querySnapshot = await getDocs(concertsCol);

    container.innerHTML = '';

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="text-center text-muted">Поки що немає концертів.</p>';
      return;
    }

    const monthNames = ['СІЧ','ЛЮТ','БЕР','КВІТ','ТРАВ','ЧЕРВ','ЛИП','СЕРП','ВЕР','ЖОВТ','ЛИСТ','ГРУД'];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const concertId = docSnap.id;

      // Розбираємо дату та час
      const dateObj = new Date(data.dateTime);
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = monthNames[dateObj.getMonth()];
      const time = dateObj.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

      // Отримуємо назву локації, якщо є locationId
      let locationName = 'Невідома локація';
      if (data.locationId) {
        const locDoc = await getDoc(doc(db, 'locations', data.locationId));
        if (locDoc.exists()) locationName = locDoc.data().name || locationName;
      }

      // HTML для однієї події
      const eventHTML = `
        <a href="event.html?id=${concertId}" class="event-item">
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

  } catch (error) {
    console.error('Помилка завантаження концертів:', error);
    container.innerHTML = '<p class="text-danger text-center">Не вдалося завантажити концерти 😔</p>';
  }
});
