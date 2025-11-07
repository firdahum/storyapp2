export default class InfoPage {
  async render() {
    return `
      <section class="container about-page">
        <div class="about-hero">
          <h1>Tentang Story App</h1>
          <p>
            Story App adalah wadah berbagi cerita dan foto dengan konteks lokasi. 
            Kamu dapat menambahkan pengalaman perjalanan, momen spesial, atau kisah menarik
            yang nantinya muncul di peta agar pengguna lain dapat menemukannya.
          </p>
        </div>

        <div class="about-content">
          <h2>Bagikan Kisahmu</h2>
          <p>
            Unggah foto dan tuliskan cerita singkat! Ceritamu akan muncul di beranda dan peta.
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log('InfoPage selesai dirender.');
  }
}
