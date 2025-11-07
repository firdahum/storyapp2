import { favoritesDB } from '../utils/favorites-db.js';

export default class FavoriteStoryPage {
  async render() {
    return `
      <section class="container favorite-stories">
        <div class="favorite-header">
          <div>
            <h1>❤️ Cerita Favorit</h1>
            <p>Koleksi cerita yang telah Anda tandai sebagai favorit</p>
          </div>
          <button id="delete-all-btn" class="btn btn-danger" style="display: none;">
            🗑️ Hapus Semua
          </button>
        </div>

        <div id="favorite-stats" class="favorite-stats"></div>
        
        <div id="favorite-list" class="favorite-list" aria-live="polite">
          <div class="loading">Memuat favorit...</div>
        </div>

        <style>
          .favorite-stories {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .favorite-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
          }

          .favorite-header h1 {
            margin: 0;
            font-size: 32px;
            color: #333;
          }

          .favorite-header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 16px;
          }

          .favorite-stats {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 25px;
            display: flex;
            gap: 30px;
            flex-wrap: wrap;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }

          .stat-item {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .stat-icon {
            font-size: 28px;
          }

          .stat-info h3 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }

          .stat-info p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }

          .favorite-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
          }

          .favorite-item {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            position: relative;
          }

          .favorite-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          }

          .favorite-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }

          .favorite-item-content {
            padding: 15px;
          }

          .favorite-item h3 {
            margin: 0 0 8px;
            font-size: 18px;
            color: #333;
          }

          .favorite-item p {
            margin: 0 0 12px;
            color: #666;
            font-size: 14px;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .favorite-item-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #999;
            margin-bottom: 12px;
          }

          .favorite-item-actions {
            display: flex;
            gap: 8px;
          }

          .btn-delete {
            background: #f44336;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.2s;
            flex: 1;
          }

          .btn-delete:hover {
            background: #d32f2f;
          }

          .btn-danger {
            background: #f44336;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.2s, transform 0.2s;
          }

          .btn-danger:hover {
            background: #d32f2f;
            transform: scale(1.05);
          }

          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
          }

          .empty-state-icon {
            font-size: 80px;
            margin-bottom: 20px;
            opacity: 0.5;
          }

          .empty-state h3 {
            font-size: 24px;
            margin: 0 0 10px;
            color: #666;
          }

          .empty-state p {
            font-size: 16px;
            margin: 0 0 20px;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          .loading {
            text-align: center;
            padding: 40px;
            color: #999;
            font-size: 16px;
          }

          @media (max-width: 768px) {
            .favorite-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .favorite-list {
              grid-template-columns: 1fr;
            }

            .favorite-stats {
              flex-direction: column;
              gap: 15px;
            }
          }
        </style>
      </section>
    `;
  }

  async afterRender() {
    await this.loadFavorites();

    // Delete all button
    const deleteAllBtn = document.getElementById('delete-all-btn');
    deleteAllBtn.addEventListener('click', async () => {
      if (confirm('Yakin ingin menghapus semua cerita favorit?')) {
        await favoritesDB.deleteAllFavorites();
        await this.loadFavorites();
      }
    });
  }

  async loadFavorites() {
    const listEl = document.getElementById('favorite-list');
    const statsEl = document.getElementById('favorite-stats');
    const deleteAllBtn = document.getElementById('delete-all-btn');

    try {
      const favorites = await favoritesDB.getAllFavorites();

      if (favorites.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">💔</div>
            <h3>Belum Ada Favorit</h3>
            <p>Anda belum menandai cerita apapun sebagai favorit.</p>
            <a href="#/dashboard" class="btn-primary">📖 Jelajahi Cerita</a>
          </div>
        `;
        statsEl.innerHTML = '';
        deleteAllBtn.style.display = 'none';
        return;
      }

      // Show stats
      statsEl.innerHTML = `
        <div class="stat-item">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <h3>${favorites.length}</h3>
            <p>Total Favorit</p>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">📍</div>
          <div class="stat-info">
            <h3>${favorites.filter(f => f.lat && f.lon).length}</h3>
            <p>Dengan Lokasi</p>
          </div>
        </div>
      `;

      deleteAllBtn.style.display = 'block';

      // Render favorites
      listEl.innerHTML = favorites.map(story => {
        const created = story.createdAt ? new Date(story.createdAt).toLocaleString('id-ID') : '—';
        const hasLocation = story.lat && story.lon;

        return `
          <article class="favorite-item" data-id="${story.id}">
            <img src="${story.photoUrl}" alt="${story.name}" loading="lazy" />
            <div class="favorite-item-content">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              <div class="favorite-item-meta">
                <small>📅 ${created}</small>
                ${hasLocation ? '<small style="color: #4caf50;">📍 Ada lokasi</small>' : ''}
              </div>
              <div class="favorite-item-actions">
                <button class="btn-delete" data-id="${story.id}">
                  🗑️ Hapus dari Favorit
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      // Add delete event listeners
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          if (confirm('Hapus cerita ini dari favorit?')) {
            await favoritesDB.deleteFavorite(id);
            await this.loadFavorites();
          }
        });
      });

    } catch (error) {
      console.error('Error loading favorites:', error);
      listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <h3>Terjadi Kesalahan</h3>
          <p>Gagal memuat data favorit. Silakan coba lagi.</p>
        </div>
      `;
    }
  }
}
